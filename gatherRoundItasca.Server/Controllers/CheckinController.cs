using gatherRoundItasca.Server.Models;
using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace gatherRoundItasca.Server.Controllers;

// The Check-in handler. It writes the single source of truth (the checkins log)
// and, as a denormalized cache, increments the Player's Points on a *new* check-in.
// Scoring is idempotent: a repeat check-in is a duplicate-key no-op that awards
// nothing. Strict order is enforced server-side as defence-in-depth even though the
// reveal mechanic already prevents a Player from seeing a future Stop. See
// docs/adr/0004.
//
// Geo-proximity verification is NOT done here — that is docs/adr/0006, a separate
// concern still handled on the client. This handler trusts the request and is
// concerned only with order, idempotency, and scoring.
[ApiController]
[Route("api/[controller]")]
public class CheckinController : ControllerBase
{
    private readonly IMongoCollection<PlayerDataModel> _players;
    private readonly IMongoCollection<StopModel> _stops;
    private readonly IMongoCollection<CheckinModel> _checkins;
    private readonly TrailProgressService _progress;

    public CheckinController(MongoCollectionsService collections, TrailProgressService progress)
    {
        _players = collections.Players;
        _stops = collections.Stops;
        _checkins = collections.Checkins;
        _progress = progress;
    }

    [HttpPost]
    public async Task<IActionResult> CheckIn([FromBody] CheckinRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PlayerId) || string.IsNullOrWhiteSpace(request.StopId))
        {
            return BadRequest(new { message = "playerId and stopId are required." });
        }

        var player = await _players.Find(x => x.PlayerId == request.PlayerId).FirstOrDefaultAsync();
        if (player == null)
        {
            return NotFound(new { message = "Player not found." });
        }

        // StopId is an ObjectId string. Reject a malformed one up front — otherwise the
        // driver throws translating the filter, surfacing as a 500 instead of a 404.
        if (!ObjectId.TryParse(request.StopId, out _))
        {
            return NotFound(new { message = "Stop not found." });
        }

        var stop = await _stops.Find(x => x.Id == request.StopId).FirstOrDefaultAsync();
        if (stop == null || stop.TrailId == null)
        {
            return NotFound(new { message = "Stop not found." });
        }

        var orderedStops = await _progress.GetOrderedStopsAsync(stop.TrailId);
        var completed = await _progress.GetCompletedStopIdsAsync(player.PlayerId!, stop.TrailId);
        var progress = TrailProgressService.BuildProgress(orderedStops, completed);

        // Already checked in here: harmless no-op, award nothing, report state as-is.
        if (stop.Id != null && completed.Contains(stop.Id))
        {
            return Ok(BuildResult(awarded: 0, player.Points, orderedStops, completed));
        }

        // Strict order: the only Stop a Player may check in at is their current one.
        if (progress.CurrentStop?.Id != stop.Id)
        {
            return Conflict(new { message = "This is not your current Stop. Check in at earlier Stops first." });
        }

        var checkin = new CheckinModel
        {
            PlayerId = player.PlayerId,
            StopId = stop.Id,
            TrailId = stop.TrailId,
            Timestamp = DateTime.UtcNow
        };

        try
        {
            await _checkins.InsertOneAsync(checkin);
        }
        catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
        {
            // Lost a race against a concurrent identical check-in. The unique index
            // (PlayerId, StopId) makes double-scoring impossible — treat as the no-op.
            return Ok(BuildResult(awarded: 0, player.Points, orderedStops, completed));
        }

        // New check-in: update the denormalized Points cache and read back the truth.
        var updated = await _players.FindOneAndUpdateAsync<PlayerDataModel, PlayerDataModel>(
            x => x.PlayerId == player.PlayerId,
            Builders<PlayerDataModel>.Update.Inc(x => x.Points, stop.Points),
            new FindOneAndUpdateOptions<PlayerDataModel> { ReturnDocument = ReturnDocument.After });

        completed.Add(stop.Id!);
        return Ok(BuildResult(stop.Points, updated?.Points ?? player.Points + stop.Points, orderedStops, completed));
    }

    private static CheckinResult BuildResult(int awarded, int totalPoints, List<StopModel> orderedStops, HashSet<string> completed)
    {
        var progress = TrailProgressService.BuildProgress(orderedStops, completed);
        return new CheckinResult(
            Awarded: awarded,
            TotalPoints: totalPoints,
            Completed: progress.Completed,
            Total: progress.Total,
            TrailComplete: progress.IsComplete,
            NextStop: progress.IsComplete ? null : StopDto.From(progress.CurrentStop));
    }
}

public class CheckinRequest
{
    public string? PlayerId { get; set; }
    public string? StopId { get; set; }
}

// The revealed next Stop — never includes Stops beyond the current one.
public record StopDto(string Id, string TrailId, int Order, int Points, string Title, string Riddle, string Coordinates, string? Image)
{
    public static StopDto? From(StopModel? stop) =>
        stop == null ? null : new StopDto(
            stop.Id ?? string.Empty,
            stop.TrailId ?? string.Empty,
            stop.Order,
            stop.Points,
            stop.Title ?? string.Empty,
            stop.Riddle ?? string.Empty,
            stop.Coordinates ?? string.Empty,
            stop.Image);
}

public record CheckinResult(int Awarded, int TotalPoints, int Completed, int Total, bool TrailComplete, StopDto? NextStop);
