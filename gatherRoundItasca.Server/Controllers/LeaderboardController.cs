using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace gatherRoundItasca.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly LeaderboardService _leaderboard;

    public LeaderboardController(LeaderboardService leaderboard)
    {
        _leaderboard = leaderboard;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Models.LeaderboardModel>>> GetAsync()
    {
        var players = await _leaderboard.GetRankedPlayersAsync();

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
