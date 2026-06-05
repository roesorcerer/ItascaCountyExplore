using gatherRoundItasca.Server.Models;
using MongoDB.Driver;

namespace gatherRoundItasca.Server.Services
{
    public class MongoCollectionsService
    {
        // Name of the unique index that enforces one account per email. Shared so
        // duplicate-key errors can be attributed to it precisely. See docs/adr/0002.
        public const string EmailUniqueIndexName = "Email_unique";

        public MongoCollectionsService(IMongoDatabase database)
        {
            Locations = database.GetCollection<LocationModel>("locations");
            Players = database.GetCollection<PlayerDataModel>("players");
            Updates = database.GetCollection<UpdateModel>("updates");
        }

        public IMongoCollection<LocationModel> Locations { get; }
        public IMongoCollection<PlayerDataModel> Players { get; }
        public IMongoCollection<UpdateModel> Updates { get; }

        // Schema setup, kept independent of data seeding so the uniqueness
        // invariant is enforced even in environments that don't seed. Email is
        // unique (one account per person); PlayerId uniqueness is already given by
        // it being the document _id. The index is sparse so any legacy player
        // without an email doesn't collide.
        public Task EnsureIndexesAsync()
        {
            var keys = Builders<PlayerDataModel>.IndexKeys.Ascending(x => x.Email);
            var options = new CreateIndexOptions { Unique = true, Sparse = true, Name = EmailUniqueIndexName };
            return Players.Indexes.CreateOneAsync(new CreateIndexModel<PlayerDataModel>(keys, options));
        }
    }
}
