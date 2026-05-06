using gatherRoundItasca.Server.Models;
using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace gatherRoundItasca.Server.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly IMongoCollection<LocationModel> _locations;
    private readonly IMongoCollection<PlayerDataModel> _players;
    private readonly IMongoCollection<UpdateModel> _updates;

    public AdminController(MongoCollectionsService collectionsService)
    {
        _locations = collectionsService.Locations;
        _players = collectionsService.Players;
        _updates = collectionsService.Updates;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardResponse>> GetDashboardAsync()
    {
        var totalTrails = await _locations.CountDocumentsAsync(Builders<LocationModel>.Filter.Empty);
        var totalUsers = await _players.CountDocumentsAsync(Builders<PlayerDataModel>.Filter.Empty);
        var totalUpdates = await _updates.CountDocumentsAsync(Builders<UpdateModel>.Filter.Empty);

        var topTrails = await _locations.Find(Builders<LocationModel>.Filter.Empty)
            .SortByDescending(x => x.VisitCount)
            .ThenBy(x => x.Id)
            .Limit(5)
            .Project(x => new TrailSummaryDto(x.Id, x.Title ?? string.Empty, x.Location ?? string.Empty, x.VisitCount))
            .ToListAsync();

        var leaderboard = await _players.Find(Builders<PlayerDataModel>.Filter.Empty)
            .SortByDescending(x => x.Points)
            .ThenBy(x => x.PlayerId)
            .Limit(10)
            .Project(x => new LeaderboardEntryDto(x.PlayerId ?? string.Empty, x.Email ?? string.Empty, x.Points))
            .ToListAsync();

        var latestUpdates = await _updates.Find(Builders<UpdateModel>.Filter.Empty)
            .SortByDescending(x => x.UpdateNumber)
            .Limit(5)
            .Project(x => new UpdateSummaryDto(x.UpdateNumber, x.Date ?? string.Empty, x.LocationUpdate ?? string.Empty, x.LeaderboardUpdate ?? string.Empty))
            .ToListAsync();

        return Ok(new DashboardResponse(totalTrails, totalUsers, totalUpdates, topTrails, leaderboard, latestUpdates));
    }

    [HttpGet("leaderboard")]
    public async Task<ActionResult<IEnumerable<LeaderboardEntryDto>>> GetLeaderboardAsync()
    {
        var leaderboard = await _players.Find(Builders<PlayerDataModel>.Filter.Empty)
            .SortByDescending(x => x.Points)
            .ThenBy(x => x.PlayerId)
            .Project(x => new LeaderboardEntryDto(x.PlayerId ?? string.Empty, x.Email ?? string.Empty, x.Points))
            .ToListAsync();

        return Ok(leaderboard);
    }

    [HttpGet("trails")]
    public async Task<ActionResult<IEnumerable<LocationModel>>> GetTrailsAsync()
    {
        var trails = await _locations.Find(Builders<LocationModel>.Filter.Empty)
            .SortBy(x => x.Id)
            .ToListAsync();

        return Ok(trails);
    }

    [HttpPost("trails")]
    public async Task<ActionResult<LocationModel>> CreateTrailAsync([FromBody] LocationModel model)
    {
        if (model == null || model.Id <= 0)
        {
            return BadRequest(new { message = "Trail id is required and must be greater than zero." });
        }

        var exists = await _locations.Find(x => x.Id == model.Id).AnyAsync();
        if (exists)
        {
            return Conflict(new { message = "A trail with this id already exists." });
        }

        if (model.VisitCount < 0)
        {
            model.VisitCount = 0;
        }

        await _locations.InsertOneAsync(model);
        return CreatedAtAction(nameof(GetTrailsAsync), new { id = model.Id }, model);
    }

    [HttpPut("trails/{id:int}")]
    public async Task<IActionResult> UpdateTrailAsync([FromRoute] int id, [FromBody] LocationModel model)
    {
        if (model == null)
        {
            return BadRequest(new { message = "Trail payload is required." });
        }

        model.Id = id;
        if (model.VisitCount < 0)
        {
            model.VisitCount = 0;
        }

        var result = await _locations.ReplaceOneAsync(x => x.Id == id, model);
        if (result.MatchedCount == 0)
        {
            return NotFound(new { message = "Trail not found." });
        }

        return Ok(model);
    }

    [HttpDelete("trails/{id:int}")]
    public async Task<IActionResult> DeleteTrailAsync([FromRoute] int id)
    {
        var result = await _locations.DeleteOneAsync(x => x.Id == id);
        if (result.DeletedCount == 0)
        {
            return NotFound(new { message = "Trail not found." });
        }

        return NoContent();
    }

    [HttpPatch("trails/{id:int}/visit")]
    public async Task<IActionResult> IncrementVisitCountAsync([FromRoute] int id)
    {
        var result = await _locations.UpdateOneAsync(
            x => x.Id == id,
            Builders<LocationModel>.Update.Inc(x => x.VisitCount, 1));

        if (result.MatchedCount == 0)
        {
            return NotFound(new { message = "Trail not found." });
        }

        return Ok(new { message = "Visit count updated." });
    }

    [HttpGet("updates")]
    public async Task<ActionResult<IEnumerable<UpdateModel>>> GetUpdatesAsync()
    {
        var updates = await _updates.Find(Builders<UpdateModel>.Filter.Empty)
            .SortBy(x => x.UpdateNumber)
            .ToListAsync();

        return Ok(updates);
    }

    [HttpPost("updates")]
    public async Task<ActionResult<UpdateModel>> CreateUpdateAsync([FromBody] UpdateModel model)
    {
        if (model == null || model.UpdateNumber <= 0)
        {
            return BadRequest(new { message = "UpdateNumber is required and must be greater than zero." });
        }

        var exists = await _updates.Find(x => x.UpdateNumber == model.UpdateNumber).AnyAsync();
        if (exists)
        {
            return Conflict(new { message = "An update with this number already exists." });
        }

        await _updates.InsertOneAsync(model);
        return CreatedAtAction(nameof(GetUpdatesAsync), new { id = model.UpdateNumber }, model);
    }

    [HttpPut("updates/{updateNumber:int}")]
    public async Task<IActionResult> UpdateUpdateAsync([FromRoute] int updateNumber, [FromBody] UpdateModel model)
    {
        if (model == null)
        {
            return BadRequest(new { message = "Update payload is required." });
        }

        model.UpdateNumber = updateNumber;

        var result = await _updates.ReplaceOneAsync(x => x.UpdateNumber == updateNumber, model);
        if (result.MatchedCount == 0)
        {
            return NotFound(new { message = "Update not found." });
        }

        return Ok(model);
    }

    [HttpDelete("updates/{updateNumber:int}")]
    public async Task<IActionResult> DeleteUpdateAsync([FromRoute] int updateNumber)
    {
        var result = await _updates.DeleteOneAsync(x => x.UpdateNumber == updateNumber);
        if (result.DeletedCount == 0)
        {
            return NotFound(new { message = "Update not found." });
        }

        return NoContent();
    }

    [HttpPost("fix-image-paths")]
    public async Task<IActionResult> FixImagePathsAsync()
    {
        // Find locations with paths starting with "public/" or "/public/"
        var filter = Builders<LocationModel>.Filter.Or(
            Builders<LocationModel>.Filter.Regex(x => x.Image, new MongoDB.Bson.BsonRegularExpression("^public/")),
            Builders<LocationModel>.Filter.Regex(x => x.Image, new MongoDB.Bson.BsonRegularExpression("^/public/"))
        );

        var locations = await _locations.Find(filter).ToListAsync();

        if (locations.Count == 0)
        {
            return Ok(new { message = "No image paths need fixing.", fixedCount = 0 });
        }

        var fixedCount = 0;
        foreach (var location in locations)
        {
            if (location.Image != null)
            {
                // Remove both "public/" and "/public/" prefixes
                var originalPath = location.Image;
                location.Image = location.Image.Replace("/public/", "/").Replace("public/", "/");

                if (originalPath != location.Image)
                {
                    await _locations.ReplaceOneAsync(x => x.Id == location.Id, location);
                    fixedCount++;
                }
            }
        }

        return Ok(new { message = "Image paths fixed successfully.", fixedCount });
    }

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<PlayerDataModel>>> GetUsersAsync()
    {
        var users = await _players.Find(Builders<PlayerDataModel>.Filter.Empty)
            .SortBy(x => x.PlayerId)
            .ToListAsync();

        return Ok(users);
    }

    [HttpPut("users/{playerId}")]
    public async Task<IActionResult> UpdateUserAsync([FromRoute] string playerId, [FromBody] PlayerDataModel model)
    {
        if (string.IsNullOrWhiteSpace(playerId) || model == null)
        {
            return BadRequest(new { message = "Player id and payload are required." });
        }

        model.PlayerId = playerId;

        var result = await _players.ReplaceOneAsync(x => x.PlayerId == playerId, model);
        if (result.MatchedCount == 0)
        {
            return NotFound(new { message = "User not found." });
        }

        return Ok(model);
    }

    [HttpDelete("users/{playerId}")]
    public async Task<IActionResult> DeleteUserAsync([FromRoute] string playerId)
    {
        if (string.IsNullOrWhiteSpace(playerId))
        {
            return BadRequest(new { message = "Player id is required." });
        }

        var result = await _players.DeleteOneAsync(x => x.PlayerId == playerId);
        if (result.DeletedCount == 0)
        {
            return NotFound(new { message = "User not found." });
        }

        return NoContent();
    }

    public record TrailSummaryDto(int Id, string Title, string Location, int VisitCount);

    public record LeaderboardEntryDto(string PlayerId, string Email, int Points);

    public record UpdateSummaryDto(int UpdateNumber, string Date, string LocationUpdate, string LeaderboardUpdate);

    public record DashboardResponse(
        long TotalTrails,
        long TotalUsers,
        long TotalUpdates,
        IReadOnlyList<TrailSummaryDto> PopularTrails,
        IReadOnlyList<LeaderboardEntryDto> Leaderboard,
        IReadOnlyList<UpdateSummaryDto> LatestUpdates);
}
