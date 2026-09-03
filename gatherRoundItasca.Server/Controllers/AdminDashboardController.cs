using gatherRoundItasca.Server.Authorization;
using gatherRoundItasca.Server.Models;
using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace gatherRoundItasca.Server.Controllers;

[ApiController]
[Route("api/admin")]
[AdminAuthorize]
public class AdminDashboardController : ControllerBase
{
    private readonly IMongoCollection<TrailModel> _trails;
    private readonly IMongoCollection<CheckinModel> _checkins;
    private readonly IMongoCollection<PlayerDataModel> _players;
    private readonly IMongoCollection<UpdateModel> _updates;
    private readonly LeaderboardService _leaderboard;

    public AdminDashboardController(MongoCollectionsService collections, LeaderboardService leaderboard)
    {
        _trails = collections.Trails;
        _checkins = collections.Checkins;
        _players = collections.Players;
        _updates = collections.Updates;
        _leaderboard = leaderboard;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardResponse>> GetDashboardAsync()
    {
        var totalTrails = await _trails.CountDocumentsAsync(Builders<TrailModel>.Filter.Empty);
        var totalUsers = await _players.CountDocumentsAsync(Builders<PlayerDataModel>.Filter.Empty);
        var totalUpdates = await _updates.CountDocumentsAsync(Builders<UpdateModel>.Filter.Empty);
        var visitsByTrail = await VisitCountsByTrailAsync();
        var trails = await _trails.Find(Builders<TrailModel>.Filter.Empty).ToListAsync();
        var topTrails = trails
            .Select(t => new AdminTrailSummaryDto(t.Id ?? string.Empty, t.Name ?? string.Empty, t.Region ?? string.Empty,
                t.Id != null && visitsByTrail.TryGetValue(t.Id, out var count) ? count : 0))
            .OrderByDescending(t => t.VisitCount).ThenBy(t => t.Title).Take(5).ToList();
        var leaderboard = (await _leaderboard.GetRankedPlayersAsync(10))
            .Select(p => new AdminLeaderboardEntryDto(p.PlayerId ?? string.Empty, p.Email ?? string.Empty, p.Points));
        var latestUpdates = await _updates.Find(Builders<UpdateModel>.Filter.Empty).SortByDescending(x => x.UpdateNumber).Limit(5)
            .Project(x => new UpdateSummaryDto(x.UpdateNumber, x.Date ?? string.Empty, x.LocationUpdate ?? string.Empty, x.LeaderboardUpdate ?? string.Empty)).ToListAsync();

        return Ok(new DashboardResponse(totalTrails, totalUsers, totalUpdates, topTrails, leaderboard.ToList(), latestUpdates));
    }

    [HttpGet("leaderboard")]
    public async Task<ActionResult<IEnumerable<AdminLeaderboardEntryDto>>> GetLeaderboardAsync() =>
        Ok((await _leaderboard.GetRankedPlayersAsync())
            .Select(p => new AdminLeaderboardEntryDto(p.PlayerId ?? string.Empty, p.Email ?? string.Empty, p.Points)));

    private async Task<Dictionary<string, int>> VisitCountsByTrailAsync()
    {
        var grouped = await _checkins.Aggregate().Group(x => x.TrailId, g => new { TrailId = g.Key, Count = g.Count() }).ToListAsync();
        return grouped.Where(g => g.TrailId != null).ToDictionary(g => g.TrailId!, g => g.Count);
    }

    public record AdminTrailSummaryDto(string Id, string Title, string Location, int VisitCount);
    public record AdminLeaderboardEntryDto(string PlayerId, string Email, int Points);
    public record UpdateSummaryDto(int UpdateNumber, string Date, string LocationUpdate, string LeaderboardUpdate);
    public record DashboardResponse(long TotalTrails, long TotalUsers, long TotalUpdates, IReadOnlyList<AdminTrailSummaryDto> PopularTrails, IReadOnlyList<AdminLeaderboardEntryDto> Leaderboard, IReadOnlyList<UpdateSummaryDto> LatestUpdates);
}