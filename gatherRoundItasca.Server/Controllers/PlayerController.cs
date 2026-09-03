using Microsoft.AspNetCore.Mvc;
using gatherRoundItasca.Server.Services;
using gatherRoundItasca.Server.Models;
using MongoDB.Driver;
using BCrypt.Net;
namespace gatherRoundItasca.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PlayerController : ControllerBase
{
    // Login security: the PlayerId is public (it is the leaderboard name) so the
    // 4-digit PIN is the only secret. Lock the account after a handful of wrong
    // PINs to make brute force infeasible. See docs/adr/0002.
    private const int MaxFailedAttempts = 5;
    private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);

    private readonly EmailService _emailService;
    private readonly IMongoCollection<PlayerDataModel> _players;
    private readonly ILogger<PlayerController> _logger;

    public PlayerController(EmailService emailService, MongoCollectionsService collectionsService, ILogger<PlayerController> logger)
    {
        _emailService = emailService;
        _players = collectionsService.Players;
        _logger = logger;
    }

    // The curated Favorites picklists. Served so the client renders the same fixed
    // choices the server enforces, keeping the two from drifting. See docs/adr/0005.
    [HttpGet("favorites")]
    public IActionResult GetFavorites()
    {
        return Ok(new
        {
            colors = FavoritesCatalog.Colors,
            foods = FavoritesCatalog.Foods,
            animals = FavoritesCatalog.Animals
        });
    }

    [HttpPost]
    [Route("register")]
    public async Task<IActionResult> RegisterPlayer([FromBody] PlayerRegistrationRequest registration)
    {
        // Email is required and unique: it delivers the generated PlayerId and
        // breaks ties during Favorites-based recovery.
        var email = registration.Email?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email) || !IsLikelyEmail(email))
        {
            return BadRequest(new { Message = "A valid email is required." });
        }

        // Favorites must come from the fixed, curated picklist — never free text.
        // They are reproducible identity material and the PlayerId built from them is
        // public, so we canonicalize each against the authoritative catalog and reject
        // anything not in it (this is the server-side guard the ADR requires; the
        // dropdown UI is convenience, not enforcement). See docs/adr/0005.
        var color = FavoritesCatalog.Canonicalize(FavoritesCatalog.Colors, registration.FavoriteColor);
        var food = FavoritesCatalog.Canonicalize(FavoritesCatalog.Foods, registration.FavoriteFood);
        var animal = FavoritesCatalog.Canonicalize(FavoritesCatalog.Animals, registration.FavoriteAnimal);
        if (color == null || food == null || animal == null)
        {
            return BadRequest(new { Message = "Favorite color, food and animal must each be chosen from the provided lists." });
        }

        if (string.IsNullOrWhiteSpace(registration.Pin) || registration.Pin.Length != 4 || !registration.Pin.All(char.IsDigit))
        {
            return BadRequest(new { Message = "PIN must be 4 digits." });
        }

        var emailTaken = await _players.Find(x => x.Email == email).AnyAsync();
        if (emailTaken)
        {
            return Conflict(new { Message = "An account already exists for that email." });
        }

        // The PlayerId is generated from the Favorites (never client-chosen):
        // the PascalCase concatenation, with the smallest unused integer suffix
        // appended on collision. Insert with retry so concurrent registrations of
        // the same combination can't mint duplicate IDs (PlayerId is the _id, so
        // a clash surfaces as a duplicate-key write error).
        var baseId = PlayerIdGenerator.BuildBase(color, food, animal);
        var pinHash = BCrypt.Net.BCrypt.HashPassword(registration.Pin);

        for (int suffix = 1; suffix <= 10000; suffix++)
        {
            var candidate = PlayerIdGenerator.Candidate(baseId, suffix);
            if (await _players.Find(x => x.PlayerId == candidate).AnyAsync())
            {
                continue;
            }

            var playerData = new PlayerDataModel
            {
                PlayerId = candidate,
                Email = email,
                FavoriteColor = color,
                FavoriteFood = food,
                FavoriteAnimal = animal,
                Points = 0,
                PinHash = pinHash
            };

            try
            {
                await _players.InsertOneAsync(playerData);
            }
            catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
            {
                // Lost a race. If the email index tripped, someone just claimed
                // this email; otherwise the PlayerId was taken — try the next suffix.
                if (IsEmailDuplicate(ex))
                {
                    return Conflict(new { Message = "An account already exists for that email." });
                }
                continue;
            }

            try
            {
                await _emailService.SendEmailAsync(email, "Your Player ID", $"Your unique Player ID is: {candidate}");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send registration email for PlayerId {PlayerId}", candidate);
            }

            return Ok(new { playerId = candidate });
        }

        _logger.LogError("Exhausted PlayerId suffixes for base {BaseId}", baseId);
        return StatusCode(500, new { Message = "Could not generate a Player ID. Please try again." });
    }

    [HttpPost]
    [Route("login")]
    public async Task<IActionResult> LoginPlayer([FromBody] PlayerLoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PlayerId) || string.IsNullOrWhiteSpace(request.Pin))
        {
            return BadRequest(new { Message = "PlayerId and PIN are required." });
        }

        var player = await _players.Find(x => x.PlayerId == request.PlayerId).FirstOrDefaultAsync();
        if (player == null || string.IsNullOrWhiteSpace(player.PinHash))
        {
            return Unauthorized(new { Message = "Invalid PlayerId or PIN." });
        }

        if (player.LockoutUntil is { } until && until > DateTime.UtcNow)
        {
            var minutes = Math.Max(1, (int)Math.Ceiling((until - DateTime.UtcNow).TotalMinutes));
            return StatusCode(StatusCodes.Status423Locked, new
            {
                Message = $"Too many wrong PINs. Try again in about {minutes} minute(s)."
            });
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Pin, player.PinHash))
        {
            await RegisterFailedAttempt(player);
            return Unauthorized(new { Message = "Invalid PlayerId or PIN." });
        }

        // Successful login clears any accumulated failures / lockout.
        if (player.FailedLoginAttempts != 0 || player.LockoutUntil != null)
        {
            await _players.UpdateOneAsync(
                x => x.PlayerId == player.PlayerId,
                Builders<PlayerDataModel>.Update
                    .Set(x => x.FailedLoginAttempts, 0)
                    .Set(x => x.LockoutUntil, null));
        }

        return Ok(new
        {
            success = true,
            player = new
            {
                playerId = player.PlayerId,
                email = player.Email,
                favoriteColor = player.FavoriteColor,
                favoriteFood = player.FavoriteFood,
                favoriteAnimal = player.FavoriteAnimal
            }
        });
    }

    // Recovery: a Player who forgot their PlayerId re-enters their three Favorites.
    // If exactly one Player matches, hand back the full PlayerId (including suffix).
    // If several share the combination, Email is the tiebreaker.
    [HttpPost]
    [Route("recover")]
    public async Task<IActionResult> RecoverPlayerId([FromBody] PlayerRecoveryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FavoriteColor)
            || string.IsNullOrWhiteSpace(request.FavoriteFood)
            || string.IsNullOrWhiteSpace(request.FavoriteAnimal))
        {
            return BadRequest(new { Message = "Favorite color, food and animal are all required." });
        }

        // Favorites are stored in their canonical picklist form, so canonicalize the
        // query the same way — a case/whitespace variant of the same choice still
        // matches. (Fall back to the raw value if it's off-catalog, which simply won't
        // match and yields a clean "not found".) See docs/adr/0005.
        var color = FavoritesCatalog.Canonicalize(FavoritesCatalog.Colors, request.FavoriteColor) ?? request.FavoriteColor!.Trim();
        var food = FavoritesCatalog.Canonicalize(FavoritesCatalog.Foods, request.FavoriteFood) ?? request.FavoriteFood!.Trim();
        var animal = FavoritesCatalog.Canonicalize(FavoritesCatalog.Animals, request.FavoriteAnimal) ?? request.FavoriteAnimal!.Trim();

        var matches = await _players.Find(x =>
            x.FavoriteColor == color
            && x.FavoriteFood == food
            && x.FavoriteAnimal == animal).ToListAsync();

        var email = request.Email?.Trim().ToLowerInvariant();
        if (!string.IsNullOrWhiteSpace(email))
        {
            matches = matches.Where(x => x.Email == email).ToList();
        }

        if (matches.Count == 0)
        {
            return NotFound(new { Message = "No Player matches those favorites." });
        }

        if (matches.Count > 1)
        {
            // Ambiguous without an email tiebreaker.
            return Ok(new { needsEmail = true, message = "More than one Player matches. Enter your email to find yours." });
        }

        var player = matches[0];
        try
        {
            if (!string.IsNullOrWhiteSpace(player.Email))
            {
                await _emailService.SendEmailAsync(player.Email, "Your Player ID", $"Your Player ID is: {player.PlayerId}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send recovery email for PlayerId {PlayerId}", player.PlayerId);
        }

        return Ok(new { playerId = player.PlayerId });
    }

    // Lookup of a known PlayerId (e.g. to confirm a Player exists before a
    // check-in). This is not recovery — recovery is by Favorites, above.
    [HttpGet("retrieveID")]
    public async Task<IActionResult> RetrievePlayerId([FromQuery] string playerID)
    {
        if (string.IsNullOrWhiteSpace(playerID))
        {
            return BadRequest(new { Message = "playerID is required." });
        }

        var player = await _players.Find(x => x.PlayerId == playerID).FirstOrDefaultAsync();
        if (player == null)
        {
            return NotFound(new { Message = "Player not found" });
        }

        return Ok(new
        {
            PlayerId = player.PlayerId,
            Email = player.Email,
            FavoriteColor = player.FavoriteColor,
            FavoriteFood = player.FavoriteFood,
            FavoriteAnimal = player.FavoriteAnimal
        });
    }

    [HttpPatch("updateScore")]
    public async Task<IActionResult> AddPointsAsync([FromQuery] string playerId, [FromQuery] int pointsToAdd)
    {
        if (string.IsNullOrWhiteSpace(playerId))
        {
            return BadRequest(new { Message = "playerId is required." });
        }

        var updateResult = await _players.UpdateOneAsync(
            x => x.PlayerId == playerId,
            Builders<PlayerDataModel>.Update.Inc(x => x.Points, pointsToAdd));

        if (updateResult.MatchedCount == 0)
        {
            return NotFound(new { Message = "Player not found" });
        }

        return Ok(new { Message = "Score updated" });
    }

    private async Task RegisterFailedAttempt(PlayerDataModel player)
    {
        // Increment atomically and read back the true count, so concurrent wrong
        // PINs can't lose increments and slip past the lockout threshold (the
        // brute-force mitigation this whole flow exists for — see docs/adr/0002).
        var updated = await _players.FindOneAndUpdateAsync<PlayerDataModel, PlayerDataModel>(
            x => x.PlayerId == player.PlayerId,
            Builders<PlayerDataModel>.Update.Inc(x => x.FailedLoginAttempts, 1),
            new FindOneAndUpdateOptions<PlayerDataModel> { ReturnDocument = ReturnDocument.After });

        if (updated != null && updated.FailedLoginAttempts >= MaxFailedAttempts)
        {
            // Threshold reached: lock the account and reset the counter so the
            // next window starts fresh.
            await _players.UpdateOneAsync(
                x => x.PlayerId == player.PlayerId,
                Builders<PlayerDataModel>.Update
                    .Set(x => x.FailedLoginAttempts, 0)
                    .Set(x => x.LockoutUntil, DateTime.UtcNow.Add(LockoutDuration)));
        }
    }

    private static bool IsLikelyEmail(string email)
    {
        var at = email.IndexOf('@');
        return at > 0 && at < email.Length - 1 && email.IndexOf('.', at) > at;
    }

    private static bool IsEmailDuplicate(MongoWriteException ex)
    {
        // A duplicate-key write error names the index that tripped. Match the
        // email index specifically rather than any "Email" substring, so a
        // PlayerId (_id) collision is never misread as an email clash.
        var message = ex.WriteError?.Message ?? string.Empty;
        return message.Contains(MongoCollectionsService.EmailUniqueIndexName, StringComparison.OrdinalIgnoreCase);
    }
}

// Request models
public class PlayerRegistrationRequest
{
    public string? Email { get; set; }
    public string? FavoriteColor { get; set; }
    public string? FavoriteFood { get; set; }
    public string? FavoriteAnimal { get; set; }
    public string? Pin { get; set; }
}

public class PlayerLoginRequest
{
    public string? PlayerId { get; set; }
    public string? Pin { get; set; }
}

public class PlayerRecoveryRequest
{
    public string? FavoriteColor { get; set; }
    public string? FavoriteFood { get; set; }
    public string? FavoriteAnimal { get; set; }
    public string? Email { get; set; }
}
