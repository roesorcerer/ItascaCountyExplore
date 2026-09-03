using gatherRoundItasca.Server.Authorization;
using gatherRoundItasca.Server.Models;
using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace gatherRoundItasca.Server.Controllers;

// Every endpoint here can rewrite or delete game-wide state (Trails, Stops,
// Players, Announcements), so the whole controller is gated behind Admin
// authentication. See docs/adr/0003. Trails and Stops follow the data model of
// docs/adr/0004; traffic (visit counts) is derived from the checkins log, never a
// stored counter.
[ApiController]
[Route("api/admin")]
[AdminAuthorize]
public class AdminController : ControllerBase
{
    private readonly IMongoCollection<TrailModel> _trails;
    private readonly IMongoCollection<StopModel> _stops;
    private readonly IMongoCollection<CheckinModel> _checkins;
    private readonly IMongoCollection<PlayerDataModel> _players;
    private readonly IMongoCollection<UpdateModel> _updates;

    public AdminController(MongoCollectionsService collectionsService)
    {
        _trails = collectionsService.Trails;
        _stops = collectionsService.Stops;
        _checkins = collectionsService.Checkins;
        _players = collectionsService.Players;
        _updates = collectionsService.Updates;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardResponse>> GetDashboardAsync()
    {
        var totalTrails = await _trails.CountDocumentsAsync(Builders<TrailModel>.Filter.Empty);
        var totalUsers = await _players.CountDocumentsAsync(Builders<PlayerDataModel>.Filter.Empty);
        var totalUpdates = await _updates.CountDocumentsAsync(Builders<UpdateModel>.Filter.Empty);

        // Visit counts derive from the checkins log. Left-join all Trails so a Trail
        // with no check-ins still shows (count 0), preserving the "top 5" view.
        var visitsByTrail = await VisitCountsByTrailAsync();
        var trails = await _trails.Find(Builders<TrailModel>.Filter.Empty).ToListAsync();
        var topTrails = trails
            .Select(t => new TrailSummaryDto(
                t.Id ?? string.Empty,
                t.Name ?? string.Empty,
                t.Region ?? string.Empty,
                t.Id != null && visitsByTrail.TryGetValue(t.Id, out var n) ? n : 0))
            .OrderByDescending(t => t.VisitCount)
            .ThenBy(t => t.Title)
            .Take(5)
            .ToList();

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

    // ----- Trails -----

    [HttpGet("trails")]
    public async Task<ActionResult<IEnumerable<TrailModel>>> GetTrailsAsync()
    {
        var trails = await _trails.Find(Builders<TrailModel>.Filter.Empty)
            .SortBy(x => x.Name)
            .ToListAsync();

        return Ok(trails);
    }

    [HttpPost("trails")]
    public async Task<ActionResult<TrailModel>> CreateTrailAsync([FromBody] TrailModel model)
    {
        if (model == null || string.IsNullOrWhiteSpace(model.Name))
        {
            return BadRequest(new { message = "Trail name is required." });
        }

        // Id is server-assigned (ObjectId); ignore any client-supplied value.
        model.Id = null;
        await _trails.InsertOneAsync(model);
        return Ok(model);
    }

    [HttpPut("trails/{id}")]
    public async Task<IActionResult> UpdateTrailAsync([FromRoute] string id, [FromBody] TrailModel model)
    {
        if (model == null)
        {
            return BadRequest(new { message = "Trail payload is required." });
        }

        model.Id = id;
        var result = await _trails.ReplaceOneAsync(x => x.Id == id, model);
        if (result.MatchedCount == 0)
        {
            return NotFound(new { message = "Trail not found." });
        }

        return Ok(model);
    }

    // Deleting a Trail removes its Stops too. Historical check-ins are left as-is
    // (harmless orphan log rows); they reference Stops/Trails that no longer surface.
    [HttpDelete("trails/{id}")]
    public async Task<IActionResult> DeleteTrailAsync([FromRoute] string id)
    {
        var result = await _trails.DeleteOneAsync(x => x.Id == id);
        if (result.DeletedCount == 0)
        {
            return NotFound(new { message = "Trail not found." });
        }

        await _stops.DeleteManyAsync(x => x.TrailId == id);
        return NoContent();
    }

    // ----- Stops (independently addressable per docs/adr/0004) -----

    [HttpGet("trails/{trailId}/stops")]
    public async Task<ActionResult<IEnumerable<StopAdminDto>>> GetStopsAsync([FromRoute] string trailId)
    {
        var stops = await _stops.Find(x => x.TrailId == trailId).SortBy(x => x.Order).ToListAsync();
        var visits = await VisitCountsByStopAsync(trailId);

        var dtos = stops.Select(s => new StopAdminDto(
            s.Id ?? string.Empty,
            s.TrailId ?? string.Empty,
            s.Order,
            s.Points,
            s.Title ?? string.Empty,
            s.Riddle ?? string.Empty,
            s.Coordinates ?? string.Empty,
            s.Radius,
            s.Image,
            s.Id != null && visits.TryGetValue(s.Id, out var n) ? n : 0));

        return Ok(dtos);
    }

    [HttpPost("trails/{trailId}/stops")]
    public async Task<ActionResult<StopModel>> CreateStopAsync([FromRoute] string trailId, [FromBody] StopModel model)
    {
        if (model == null || model.Order <= 0 || string.IsNullOrWhiteSpace(model.Title) || string.IsNullOrWhiteSpace(model.Coordinates))
        {
            return BadRequest(new { message = "Stop order (>0), title and coordinates are required." });
        }

        var trailExists = await _trails.Find(x => x.Id == trailId).AnyAsync();
        if (!trailExists)
        {
            return NotFound(new { message = "Trail not found." });
        }

        model.Id = null;
        model.TrailId = trailId;
        if (model.Points <= 0)
        {
            model.Points = StopModel.DefaultPoints;
        }

        try
        {
            await _stops.InsertOneAsync(model);
        }
        catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
        {
            return Conflict(new { message = $"A Stop with order {model.Order} already exists on this Trail." });
        }

        return Ok(model);
    }

    [HttpPut("stops/{id}")]
    public async Task<IActionResult> UpdateStopAsync([FromRoute] string id, [FromBody] StopModel model)
    {
        if (model == null || model.Order <= 0)
        {
            return BadRequest(new { message = "Stop payload with order (>0) is required." });
        }

        var existing = await _stops.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (existing == null)
        {
            return NotFound(new { message = "Stop not found." });
        }

        model.Id = id;
        model.TrailId = existing.TrailId; // a Stop never moves Trails
        if (model.Points <= 0)
        {
            model.Points = StopModel.DefaultPoints;
        }

        try
        {
            await _stops.ReplaceOneAsync(x => x.Id == id, model);
        }
        catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
        {
            return Conflict(new { message = $"A Stop with order {model.Order} already exists on this Trail." });
        }

        return Ok(model);
    }

    [HttpDelete("stops/{id}")]
    public async Task<IActionResult> DeleteStopAsync([FromRoute] string id)
    {
        var result = await _stops.DeleteOneAsync(x => x.Id == id);
        if (result.DeletedCount == 0)
        {
            return NotFound(new { message = "Stop not found." });
        }

        return NoContent();
    }

    // ----- Updates -----

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
        return Ok(model);
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

    // ----- Users -----

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

    // ----- Derived traffic helpers -----

    private async Task<Dictionary<string, int>> VisitCountsByTrailAsync()
    {
        var grouped = await _checkins.Aggregate()
            .Group(x => x.TrailId, g => new { TrailId = g.Key, Count = g.Count() })
            .ToListAsync();

        return grouped.Where(g => g.TrailId != null).ToDictionary(g => g.TrailId!, g => g.Count);
    }

    private async Task<Dictionary<string, int>> VisitCountsByStopAsync(string trailId)
    {
        var grouped = await _checkins.Aggregate()
            .Match(x => x.TrailId == trailId)
            .Group(x => x.StopId, g => new { StopId = g.Key, Count = g.Count() })
            .ToListAsync();

        return grouped.Where(g => g.StopId != null).ToDictionary(g => g.StopId!, g => g.Count);
    }

    public record TrailSummaryDto(string Id, string Title, string Location, int VisitCount);

    public record StopAdminDto(string Id, string TrailId, int Order, int Points, string Title, string Riddle, string Coordinates, double? Radius, string? Image, int VisitCount);

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
