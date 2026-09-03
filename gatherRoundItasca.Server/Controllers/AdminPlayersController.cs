using gatherRoundItasca.Server.Authorization;
using gatherRoundItasca.Server.Models;
using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace gatherRoundItasca.Server.Controllers;

[ApiController]
[Route("api/admin/users")]
[AdminAuthorize]
public class AdminPlayersController : ControllerBase
{
    private readonly IMongoCollection<PlayerDataModel> _players;

    public AdminPlayersController(MongoCollectionsService collections) => _players = collections.Players;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AdminPlayerDto>>> GetPlayersAsync()
    {
        var players = await _players.Find(Builders<PlayerDataModel>.Filter.Empty).SortBy(x => x.PlayerId).ToListAsync();
        return Ok(players.Select(ToDto));
    }

    [HttpPatch("{playerId}/email")]
    public async Task<IActionResult> UpdateEmailAsync(string playerId, [FromBody] AdminPlayerEmailRequest request)
    {
        var email = request.Email?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email) || !IsLikelyEmail(email)) return BadRequest(new { message = "A valid email is required." });
        try
        {
            var updated = await _players.FindOneAndUpdateAsync(x => x.PlayerId == playerId,
                Builders<PlayerDataModel>.Update.Set(x => x.Email, email), new FindOneAndUpdateOptions<PlayerDataModel> { ReturnDocument = ReturnDocument.After });
            return updated == null ? NotFound(new { message = "Player not found." }) : Ok(ToDto(updated));
        }
        catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
        {
            return Conflict(new { message = "An account already exists for that email." });
        }
    }

    [HttpPost("{playerId}/reset-pin")]
    public async Task<IActionResult> ResetPinAsync(string playerId, [FromBody] AdminPlayerPinResetRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Pin) || request.Pin.Length != 4 || !request.Pin.All(char.IsDigit)) return BadRequest(new { message = "PIN must be 4 digits." });
        var result = await _players.UpdateOneAsync(x => x.PlayerId == playerId, Builders<PlayerDataModel>.Update
            .Set(x => x.PinHash, BCrypt.Net.BCrypt.HashPassword(request.Pin))
            .Set(x => x.FailedLoginAttempts, 0).Set(x => x.LockoutUntil, null));
        return result.MatchedCount == 0 ? NotFound(new { message = "Player not found." }) : NoContent();
    }

    [HttpPatch("{playerId}/disabled")]
    public async Task<IActionResult> SetDisabledAsync(string playerId, [FromBody] AdminPlayerDisabledRequest request)
    {
        var updated = await _players.FindOneAndUpdateAsync(x => x.PlayerId == playerId,
            Builders<PlayerDataModel>.Update.Set(x => x.IsDisabled, request.IsDisabled), new FindOneAndUpdateOptions<PlayerDataModel> { ReturnDocument = ReturnDocument.After });
        return updated == null ? NotFound(new { message = "Player not found." }) : Ok(ToDto(updated));
    }

    [HttpDelete("{playerId}")]
    public async Task<IActionResult> DeletePlayerAsync(string playerId)
    {
        var result = await _players.DeleteOneAsync(x => x.PlayerId == playerId);
        return result.DeletedCount == 0 ? NotFound(new { message = "Player not found." }) : NoContent();
    }

    private static AdminPlayerDto ToDto(PlayerDataModel player) => new(player.PlayerId ?? string.Empty, player.Email ?? string.Empty,
        player.FavoriteColor ?? string.Empty, player.FavoriteFood ?? string.Empty, player.FavoriteAnimal ?? string.Empty, player.Points, player.IsDisabled);
    private static bool IsLikelyEmail(string email) => email.IndexOf('@') > 0 && email.IndexOf('.', email.IndexOf('@')) > email.IndexOf('@');
}

public record AdminPlayerDto(string PlayerId, string Email, string FavoriteColor, string FavoriteFood, string FavoriteAnimal, int Points, bool IsDisabled);
public class AdminPlayerEmailRequest { public string? Email { get; set; } }
public class AdminPlayerPinResetRequest { public string? Pin { get; set; } }
public class AdminPlayerDisabledRequest { public bool IsDisabled { get; set; } }