using gatherRoundItasca.Server.Models;
using MongoDB.Driver;

namespace gatherRoundItasca.Server.Services
{
    public class MongoCollectionsService
    {
        public MongoCollectionsService(IMongoDatabase database)
        {
            Locations = database.GetCollection<LocationModel>("locations");
            Players = database.GetCollection<PlayerDataModel>("players");
            Updates = database.GetCollection<UpdateModel>("updates");
        }

        public IMongoCollection<LocationModel> Locations { get; }
        public IMongoCollection<PlayerDataModel> Players { get; }
        public IMongoCollection<UpdateModel> Updates { get; }
    }
}
