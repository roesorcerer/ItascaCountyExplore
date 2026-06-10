using gatherRoundItasca.Server.Models;
using MongoDB.Driver;

namespace gatherRoundItasca.Server.Services
{
    public class MongoCollectionsService
    {
        // Name of the unique index that enforces one account per email. Shared so
        // duplicate-key errors can be attributed to it precisely. See docs/adr/0002.
        public const string EmailUniqueIndexName = "Email_unique";

        // One Stop per Order per Trail — enforces strict order physically. See docs/adr/0004.
        public const string TrailOrderUniqueIndexName = "TrailOrder_unique";

        // One check-in per (Player, Stop) — makes scoring idempotent and double-scoring
        // impossible; a repeat check-in surfaces as a duplicate-key no-op. See docs/adr/0004.
        public const string PlayerStopUniqueIndexName = "PlayerStop_unique";

        public MongoCollectionsService(IMongoDatabase database)
        {
            Locations = database.GetCollection<LocationModel>("locations");
            Players = database.GetCollection<PlayerDataModel>("players");
            Updates = database.GetCollection<UpdateModel>("updates");
            Admins = database.GetCollection<AdminModel>("admins");
            Trails = database.GetCollection<TrailModel>("trails");
            Stops = database.GetCollection<StopModel>("stops");
            Checkins = database.GetCollection<CheckinModel>("checkins");
        }

        public IMongoCollection<LocationModel> Locations { get; }
        public IMongoCollection<PlayerDataModel> Players { get; }
        public IMongoCollection<UpdateModel> Updates { get; }

        // The Admin is a distinct actor from a Player, with its own collection and
        // its own (stronger) credential. See docs/adr/0003.
        public IMongoCollection<AdminModel> Admins { get; }

        // The Trail / Stop / Check-in log data model. See docs/adr/0004.
        public IMongoCollection<TrailModel> Trails { get; }
        public IMongoCollection<StopModel> Stops { get; }
        public IMongoCollection<CheckinModel> Checkins { get; }

        // Schema setup, kept independent of data seeding so the uniqueness
        // invariant is enforced even in environments that don't seed. Email is
        // unique (one account per person); PlayerId uniqueness is already given by
        // it being the document _id. The index is sparse so any legacy player
        // without an email doesn't collide.
        public async Task EnsureIndexesAsync()
        {
            var emailKeys = Builders<PlayerDataModel>.IndexKeys.Ascending(x => x.Email);
            var emailOptions = new CreateIndexOptions { Unique = true, Sparse = true, Name = EmailUniqueIndexName };
            await Players.Indexes.CreateOneAsync(new CreateIndexModel<PlayerDataModel>(emailKeys, emailOptions));

            // Strict order: at most one Stop per (Trail, Order). See docs/adr/0004.
            var stopKeys = Builders<StopModel>.IndexKeys.Ascending(x => x.TrailId).Ascending(x => x.Order);
            var stopOptions = new CreateIndexOptions { Unique = true, Name = TrailOrderUniqueIndexName };
            await Stops.Indexes.CreateOneAsync(new CreateIndexModel<StopModel>(stopKeys, stopOptions));

            // Idempotent scoring: at most one check-in per (Player, Stop). See docs/adr/0004.
            var checkinKeys = Builders<CheckinModel>.IndexKeys.Ascending(x => x.PlayerId).Ascending(x => x.StopId);
            var checkinOptions = new CreateIndexOptions { Unique = true, Name = PlayerStopUniqueIndexName };
            await Checkins.Indexes.CreateOneAsync(new CreateIndexModel<CheckinModel>(checkinKeys, checkinOptions));
        }

        // Ensures the single Admin account exists, seeded from configuration (the
        // username + password supplied via Admin:Username / Admin:Password, which
        // come from env vars in deployment). It is created once and never
        // overwritten, so rotating the password is a deliberate DB operation rather
        // than a silent side effect of a config change. The password is BCrypt-
        // hashed; the plaintext is never stored. See docs/adr/0003.
        public async Task EnsureAdminAsync(string username, string password)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                return;
            }

            var exists = await Admins.Find(Builders<AdminModel>.Filter.Empty).AnyAsync();
            if (exists)
            {
                return;
            }

            await Admins.InsertOneAsync(new AdminModel
            {
                Username = username.Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
            });
        }
    }
}
