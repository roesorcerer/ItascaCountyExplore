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
    public async Task<ActionResult<IEnumerable<object>>> GetAsync()
    {
        var players = await _players.Find(Builders<Models.PlayerDataModel>.Filter.Empty)
            .SortByDescending(x => x.Points)
            .ThenBy(x => x.PlayerId)
            .ToListAsync();

        var leaderboard = players.Select((player, index) => new
        {
            playerId = player.PlayerId,
            ranking = index + 1,
            locationsVisited = player.Points
        });

        return Ok(leaderboard);
    }
}
