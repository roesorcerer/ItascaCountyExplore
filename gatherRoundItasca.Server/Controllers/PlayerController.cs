using Microsoft.AspNetCore.Mvc;
using gatherRoundItasca.Server.Services;
using gatherRoundItasca.Server.Models;
using MongoDB.Driver;
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
    public async Task<IActionResult> RegisterPlayer([FromBody] PlayerDataModel registration)
    {
        if (string.IsNullOrWhiteSpace(registration.PlayerId))
        {
            return BadRequest(new { Message = "PlayerId is required." });
        }

        var existingPlayer = await _players.Find(x => x.PlayerId == registration.PlayerId).FirstOrDefaultAsync();
        if (existingPlayer != null)
        {
            return Conflict(new { Message = "PlayerId already exists." });
        }

        registration.Points = 0;
        await _players.InsertOneAsync(registration);

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

        return Ok(new { playerId = registration.PlayerId });
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

        return Ok(new { playerId = player.PlayerId });
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

