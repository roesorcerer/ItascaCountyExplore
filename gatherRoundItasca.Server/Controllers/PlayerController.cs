using Microsoft.AspNetCore.Mvc;
using gatherRoundItasca.Server.Services;
using gatherRoundItasca.Server.Models;
using MongoDB.Driver;
using BCrypt.Net;
namespace gatherRoundItasca.Server.Controllers;

//Lots of excess here between the PlayerRegistration and the playerDataModel. Need to clean up the code and make it more efficient.

[Route("api/[controller]")]
[ApiController]
public class PlayerController : ControllerBase
{
    private readonly EmailService _emailService;
    private readonly IMongoCollection<PlayerDataModel> _players;
    private readonly ILogger<PlayerController> _logger;

    public PlayerController(EmailService emailService, MongoCollectionsService collectionsService, ILogger<PlayerController> logger)
    {
        _emailService = emailService;
        _players = collectionsService.Players;
        _logger = logger;
    }

    [HttpPost]
    [Route("register")]
    public async Task<IActionResult> RegisterPlayer([FromBody] PlayerRegistrationRequest registration)
    {
        if (string.IsNullOrWhiteSpace(registration.PlayerId))
        {
            return BadRequest(new { Message = "PlayerId is required." });
        }

        if (string.IsNullOrWhiteSpace(registration.Pin) || registration.Pin.Length != 4)
        {
            return BadRequest(new { Message = "PIN must be 4 digits." });
        }

        var existingPlayer = await _players.Find(x => x.PlayerId == registration.PlayerId).FirstOrDefaultAsync();
        if (existingPlayer != null)
        {
            return Conflict(new { Message = "PlayerId already exists." });
        }

        var playerData = new PlayerDataModel
        {
            PlayerId = registration.PlayerId,
            Email = registration.Email,
            FavoriteColor = registration.FavoriteColor,
            FavoriteFood = registration.FavoriteFood,
            FavoriteAnimal = registration.FavoriteAnimal,
            Points = 0,
            PinHash = BCrypt.Net.BCrypt.HashPassword(registration.Pin)
        };

        await _players.InsertOneAsync(playerData);

        // Code to send email
        if (!string.IsNullOrWhiteSpace(registration.Email))
        {
            try
            {
                await _emailService.SendEmailAsync(registration.Email, "Your Player ID", $"Your unique player ID is: {registration.PlayerId}");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send registration email for PlayerId {PlayerId}", registration.PlayerId);
            }
        }

        return Ok(new { playerId = playerData.PlayerId });
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
        if (player == null)
        {
            return Unauthorized(new { Message = "Invalid PlayerId or PIN." });
        }

        if (string.IsNullOrWhiteSpace(player.PinHash))
        {
            return Unauthorized(new { Message = "Account needs PIN setup. Please contact support." });
        }

        bool isValidPin = BCrypt.Net.BCrypt.Verify(request.Pin, player.PinHash);
        if (!isValidPin)
        {
            return Unauthorized(new { Message = "Invalid PlayerId or PIN." });
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



    [HttpGet("retrieveByEmail")]
    public async Task<IActionResult> PlayerEmailRetrival([FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new { Message = "email is required." });
        }

        var player = await _players.Find(x => x.Email == email).FirstOrDefaultAsync();
        if (player == null)
        {
            return NotFound(new { Message = "Player not found" });
        }

        return Ok(new { playerId = player.PlayerId });
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

    [HttpGet("retrieve")]
    public Task<IActionResult> RetrieveByEmailAlias([FromQuery] string email)
    {
        return PlayerEmailRetrival(email);
    }

}

// Request models
public class PlayerRegistrationRequest
{
    public string? PlayerId { get; set; }
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

