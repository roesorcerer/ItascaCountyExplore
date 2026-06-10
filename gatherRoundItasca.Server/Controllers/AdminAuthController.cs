using gatherRoundItasca.Server.Models;
using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace gatherRoundItasca.Server.Controllers;

// The Admin's login lives on its own controller, deliberately NOT gated by
// [AdminAuthorize] (you can't present a token before you have one). Everything else
// under /admin/* is gated. The Admin is a distinct actor authenticated by a real
// username + password, not the Player PIN scheme. See docs/adr/0003.
[ApiController]
[Route("api/admin")]
public class AdminAuthController : ControllerBase
{
    // Brute-force defence on the single account, mirroring the Player login lockout
    // in docs/adr/0002.
    private const int MaxFailedAttempts = 5;
    private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);

    private readonly IMongoCollection<AdminModel> _admins;
    private readonly AdminTokenService _tokens;

    public AdminAuthController(MongoCollectionsService collections, AdminTokenService tokens)
    {
        _admins = collections.Admins;
        _tokens = tokens;
    }

    [HttpPost("login")]
    public async Task<IActionResult> LoginAsync([FromBody] AdminLoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Username and password are required." });
        }

        var username = request.Username.Trim();
        var admin = await _admins.Find(x => x.Username == username).FirstOrDefaultAsync();
        if (admin == null || string.IsNullOrWhiteSpace(admin.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

        if (admin.LockoutUntil is { } until && until > DateTime.UtcNow)
        {
            var minutes = Math.Max(1, (int)Math.Ceiling((until - DateTime.UtcNow).TotalMinutes));
            return StatusCode(StatusCodes.Status423Locked, new
            {
                message = $"Too many failed attempts. Try again in about {minutes} minute(s)."
            });
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, admin.PasswordHash))
        {
            await RegisterFailedAttempt(admin);
            return Unauthorized(new { message = "Invalid username or password." });
        }

        // Successful login clears any accumulated failures / lockout.
        if (admin.FailedLoginAttempts != 0 || admin.LockoutUntil != null)
        {
            await _admins.UpdateOneAsync(
                x => x.Username == admin.Username,
                Builders<AdminModel>.Update
                    .Set(x => x.FailedLoginAttempts, 0)
                    .Set(x => x.LockoutUntil, null));
        }

        var token = _tokens.Issue(admin.Username);
        return Ok(new { token, username = admin.Username });
    }

    private async Task RegisterFailedAttempt(AdminModel admin)
    {
        // Increment atomically and read back the true count so concurrent guesses
        // can't lose increments and slip past the threshold.
        var updated = await _admins.FindOneAndUpdateAsync<AdminModel, AdminModel>(
            x => x.Username == admin.Username,
            Builders<AdminModel>.Update.Inc(x => x.FailedLoginAttempts, 1),
            new FindOneAndUpdateOptions<AdminModel> { ReturnDocument = ReturnDocument.After });

        if (updated != null && updated.FailedLoginAttempts >= MaxFailedAttempts)
        {
            await _admins.UpdateOneAsync(
                x => x.Username == admin.Username,
                Builders<AdminModel>.Update
                    .Set(x => x.FailedLoginAttempts, 0)
                    .Set(x => x.LockoutUntil, DateTime.UtcNow.Add(LockoutDuration)));
        }
    }
}

public class AdminLoginRequest
{
    public string? Username { get; set; }
    public string? Password { get; set; }
}
