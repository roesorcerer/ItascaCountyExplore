using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace gatherRoundItasca.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly IMongoCollection<Models.PlayerDataModel> _players;

    public LeaderboardController(MongoCollectionsService collectionsService)
    {
        _players = collectionsService.Players;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Models.LeaderboardModel>>> GetAsync()
    {
        var players = await _players.Find(Builders<Models.PlayerDataModel>.Filter.Empty)
            .SortByDescending(x => x.Points)
            .ThenBy(x => x.PlayerId)
            .ToListAsync();

        // The Leaderboard is derived here, not stored: Rank is the player's
        // 1-based position in the points-sorted list.
        var leaderboard = players.Select((player, index) => new Models.LeaderboardModel(
            player.PlayerId ?? string.Empty,
            player.Points,
            index + 1
        ));

        return Ok(leaderboard);
    }
}
