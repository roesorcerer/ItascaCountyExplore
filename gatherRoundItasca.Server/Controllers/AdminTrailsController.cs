using gatherRoundItasca.Server.Authorization;
using gatherRoundItasca.Server.Models;
using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace gatherRoundItasca.Server.Controllers;

[ApiController]
[Route("api/admin")]
[AdminAuthorize]
public class AdminTrailsController : ControllerBase
{
    private readonly IMongoCollection<TrailModel> _trails;
    private readonly IMongoCollection<StopModel> _stops;
    private readonly IMongoCollection<CheckinModel> _checkins;

    public AdminTrailsController(MongoCollectionsService collections)
    {
        _trails = collections.Trails;
        _stops = collections.Stops;
        _checkins = collections.Checkins;
    }

    [HttpGet("trails")]
    public async Task<ActionResult<IEnumerable<TrailModel>>> GetTrailsAsync() =>
        Ok(await _trails.Find(Builders<TrailModel>.Filter.Empty).SortBy(x => x.Name).ToListAsync());

    [HttpPost("trails")]
    public async Task<ActionResult<TrailModel>> CreateTrailAsync([FromBody] TrailModel model)
    {
        if (model == null || string.IsNullOrWhiteSpace(model.Name)) return BadRequest(new { message = "Trail name is required." });
        model.Id = null;
        await _trails.InsertOneAsync(model);
        return Ok(model);
    }

    [HttpPut("trails/{id}")]
    public async Task<IActionResult> UpdateTrailAsync(string id, [FromBody] TrailModel model)
    {
        if (model == null) return BadRequest(new { message = "Trail payload is required." });
        model.Id = id;
        var result = await _trails.ReplaceOneAsync(x => x.Id == id, model);
        return result.MatchedCount == 0 ? NotFound(new { message = "Trail not found." }) : Ok(model);
    }

    [HttpDelete("trails/{id}")]
    public async Task<IActionResult> DeleteTrailAsync(string id)
    {
        var result = await _trails.DeleteOneAsync(x => x.Id == id);
        if (result.DeletedCount == 0) return NotFound(new { message = "Trail not found." });
        await _stops.DeleteManyAsync(x => x.TrailId == id);
        return NoContent();
    }

    [HttpGet("trails/{trailId}/stops")]
    public async Task<ActionResult<IEnumerable<StopAdminDto>>> GetStopsAsync(string trailId)
    {
        var stops = await _stops.Find(x => x.TrailId == trailId).SortBy(x => x.Order).ToListAsync();
        var visits = await VisitCountsByStopAsync(trailId);
        return Ok(stops.Select(s => new StopAdminDto(s.Id ?? string.Empty, s.TrailId ?? string.Empty, s.Order, s.Points,
            s.Title ?? string.Empty, s.Riddle ?? string.Empty, s.Coordinates ?? string.Empty, s.Radius, s.Image,
            s.Id != null && visits.TryGetValue(s.Id, out var count) ? count : 0)));
    }

    [HttpPost("trails/{trailId}/stops")]
    public async Task<ActionResult<StopModel>> CreateStopAsync(string trailId, [FromBody] StopModel model)
    {
        if (model == null || model.Order <= 0 || string.IsNullOrWhiteSpace(model.Title) || string.IsNullOrWhiteSpace(model.Coordinates)) return BadRequest(new { message = "Stop order (>0), title and coordinates are required." });
        if (!await _trails.Find(x => x.Id == trailId).AnyAsync()) return NotFound(new { message = "Trail not found." });
        model.Id = null;
        model.TrailId = trailId;
        if (model.Points <= 0) model.Points = StopModel.DefaultPoints;
        try { await _stops.InsertOneAsync(model); }
        catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey) { return Conflict(new { message = $"A Stop with order {model.Order} already exists on this Trail." }); }
        return Ok(model);
    }

    [HttpPut("stops/{id}")]
    public async Task<IActionResult> UpdateStopAsync(string id, [FromBody] StopModel model)
    {
        if (model == null || model.Order <= 0) return BadRequest(new { message = "Stop payload with order (>0) is required." });
        var existing = await _stops.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (existing == null) return NotFound(new { message = "Stop not found." });
        model.Id = id;
        model.TrailId = existing.TrailId;
        if (model.Points <= 0) model.Points = StopModel.DefaultPoints;
        try { await _stops.ReplaceOneAsync(x => x.Id == id, model); }
        catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey) { return Conflict(new { message = $"A Stop with order {model.Order} already exists on this Trail." }); }
        return Ok(model);
    }

    [HttpDelete("stops/{id}")]
    public async Task<IActionResult> DeleteStopAsync(string id)
    {
        var result = await _stops.DeleteOneAsync(x => x.Id == id);
        return result.DeletedCount == 0 ? NotFound(new { message = "Stop not found." }) : NoContent();
    }

    private async Task<Dictionary<string, int>> VisitCountsByStopAsync(string trailId)
    {
        var grouped = await _checkins.Aggregate().Match(x => x.TrailId == trailId).Group(x => x.StopId, g => new { StopId = g.Key, Count = g.Count() }).ToListAsync();
        return grouped.Where(g => g.StopId != null).ToDictionary(g => g.StopId!, g => g.Count);
    }

    public record StopAdminDto(string Id, string TrailId, int Order, int Points, string Title, string Riddle, string Coordinates, double? Radius, string? Image, int VisitCount);
}