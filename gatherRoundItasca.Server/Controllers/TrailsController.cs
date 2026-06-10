using gatherRoundItasca.Server.Models;
using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace gatherRoundItasca.Server.Controllers;

// Public read path for the Trail / Stop model (docs/adr/0004). The Play page reads
// from here now, not from the legacy `locations` collection. The detail endpoint
// honours the reveal mechanic: it returns completed Stops and the single current
// Stop, never a Stop the Player has not yet reached.
[ApiController]
[Route("api/[controller]")]
public class TrailsController : ControllerBase
{
    private readonly IMongoCollection<TrailModel> _trails;
    private readonly IMongoCollection<StopModel> _stops;
    private readonly TrailProgressService _progress;

    public TrailsController(MongoCollectionsService collections, TrailProgressService progress)
    {
        _trails = collections.Trails;
        _stops = collections.Stops;
        _progress = progress;
    }

    // Grid of Trails. Stop counts are derived in one grouped pass over `stops`.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TrailSummaryDto>>> GetTrails()
    {
        var trails = await _trails.Find(Builders<TrailModel>.Filter.Empty).ToListAsync();

        var stopCounts = await _stops.Aggregate()
            .Group(x => x.TrailId, g => new { TrailId = g.Key, Count = g.Count() })
            .ToListAsync();
        var countByTrail = stopCounts.Where(c => c.TrailId != null)
            .ToDictionary(c => c.TrailId!, c => c.Count);

        var summaries = trails.Select(t => new TrailSummaryDto(
            t.Id ?? string.Empty,
            t.Name ?? string.Empty,
            t.Description ?? string.Empty,
            t.Region ?? string.Empty,
            t.CoverImage ?? string.Empty,
            t.Id != null && countByTrail.TryGetValue(t.Id, out var n) ? n : 0));

        return Ok(summaries);
    }

    // Trail detail for the walker. With a playerId, progress and the revealed
    // current Stop are personalised; without one, the Trail is shown from the start.
    [HttpGet("{trailId}")]
    public async Task<ActionResult<TrailDetailDto>> GetTrail([FromRoute] string trailId, [FromQuery] string? playerId)
    {
        // trailId is an ObjectId string; reject a malformed one before it reaches the
        // driver's filter translation (which would throw a 500 rather than 404).
        if (!ObjectId.TryParse(trailId, out _))
        {
            return NotFound(new { message = "Trail not found." });
        }

        var trail = await _trails.Find(x => x.Id == trailId).FirstOrDefaultAsync();
        if (trail == null)
        {
            return NotFound(new { message = "Trail not found." });
        }

        var orderedStops = await _progress.GetOrderedStopsAsync(trailId);
        var completed = string.IsNullOrWhiteSpace(playerId)
            ? new HashSet<string>()
            : await _progress.GetCompletedStopIdsAsync(playerId, trailId);
        var progress = TrailProgressService.BuildProgress(orderedStops, completed);

        var completedStops = orderedStops
            .Where(s => s.Id != null && completed.Contains(s.Id))
            .Select(s => new CompletedStopDto(s.Id ?? string.Empty, s.Order, s.Title ?? string.Empty))
            .ToList();

        return Ok(new TrailDetailDto(
            trail.Id ?? string.Empty,
            trail.Name ?? string.Empty,
            trail.Description ?? string.Empty,
            trail.Region ?? string.Empty,
            trail.CoverImage ?? string.Empty,
            progress.Completed,
            progress.Total,
            progress.IsComplete,
            progress.IsComplete ? null : StopDto.From(progress.CurrentStop),
            completedStops));
    }
}

public record TrailSummaryDto(string Id, string Name, string Description, string Region, string CoverImage, int StopCount);

public record CompletedStopDto(string Id, int Order, string Title);

public record TrailDetailDto(
    string Id,
    string Name,
    string Description,
    string Region,
    string CoverImage,
    int Completed,
    int Total,
    bool TrailComplete,
    StopDto? CurrentStop,
    IReadOnlyList<CompletedStopDto> CompletedStops);
