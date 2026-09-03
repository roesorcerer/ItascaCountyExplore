using gatherRoundItasca.Server.Models;
using MongoDB.Driver;

namespace gatherRoundItasca.Server.Services;

public class LeaderboardService
{
    private readonly IMongoCollection<PlayerDataModel> _players;

    public LeaderboardService(MongoCollectionsService collections)
    {
        _players = collections.Players;
    }

    public async Task<List<PlayerDataModel>> GetRankedPlayersAsync(int? limit = null)
    {
        IFindFluent<PlayerDataModel, PlayerDataModel> query = _players.Find(Builders<PlayerDataModel>.Filter.Empty)
            .SortByDescending(x => x.Points)
            .ThenBy(x => x.PlayerId);

        if (limit is { } count)
        {
            query = query.Limit(count);
        }

        return await query.ToListAsync();
    }
}