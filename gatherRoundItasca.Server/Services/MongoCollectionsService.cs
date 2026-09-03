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

        // One-off migration: bring existing players' Favorites into their canonical
        // picklist form. Registration now enforces the curated catalog (see
        // docs/adr/0005), but rows written by the old free-text code may hold
        // off-catalog casing/whitespace ("ice cream" instead of "Ice Cream"), which
        // would make Favorites-based recovery (an exact match) miss. Canonicalizing
        // does NOT change any PlayerId — that was minted at registration and is the
        // document _id — it only realigns the stored recovery keys.
        //
        // Idempotent: a second run finds nothing left to change. Values that map to no
        // catalog entry at all (genuine free text) are left untouched and reported, so
        // they can be handled deliberately rather than silently guessed at.
        public async Task<FavoritesNormalizationResult> NormalizeFavoritesAsync()
        {
            var players = await Players.Find(Builders<PlayerDataModel>.Filter.Empty).ToListAsync();
            var writes = new List<WriteModel<PlayerDataModel>>();
            var result = new FavoritesNormalizationResult();

            foreach (var player in players)
            {
                var color = Reconcile(FavoritesCatalog.Colors, player.FavoriteColor, result);
                var food = Reconcile(FavoritesCatalog.Foods, player.FavoriteFood, result);
                var animal = Reconcile(FavoritesCatalog.Animals, player.FavoriteAnimal, result);

                var changed =
                    !string.Equals(color, player.FavoriteColor, StringComparison.Ordinal)
                    || !string.Equals(food, player.FavoriteFood, StringComparison.Ordinal)
                    || !string.Equals(animal, player.FavoriteAnimal, StringComparison.Ordinal);

                if (!changed)
                {
                    continue;
                }

                var update = Builders<PlayerDataModel>.Update
                    .Set(x => x.FavoriteColor, color)
                    .Set(x => x.FavoriteFood, food)
                    .Set(x => x.FavoriteAnimal, animal);
                writes.Add(new UpdateOneModel<PlayerDataModel>(
                    Builders<PlayerDataModel>.Filter.Eq(x => x.PlayerId, player.PlayerId), update));
            }

            if (writes.Count > 0)
            {
                await Players.BulkWriteAsync(writes, new BulkWriteOptions { IsOrdered = false });
            }

            result.PlayersUpdated = writes.Count;
            return result;
        }

        // Returns the canonical catalog form of a stored favorite. A value already in
        // canonical form (or empty) is returned unchanged; an off-catalog value that
        // can't be canonicalized is returned unchanged and counted, never guessed.
        private static string? Reconcile(IReadOnlyList<string> picklist, string? stored, FavoritesNormalizationResult result)
        {
            if (string.IsNullOrWhiteSpace(stored))
            {
                return stored;
            }

            var canonical = FavoritesCatalog.Canonicalize(picklist, stored);
            if (canonical == null)
            {
                result.OffCatalogValues++;
                return stored;
            }

            return canonical;
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

    // Outcome of the one-off Favorites normalization, for logging.
    public class FavoritesNormalizationResult
    {
        // How many player documents had at least one Favorite rewritten.
        public int PlayersUpdated { get; set; }

        // How many stored Favorite values matched no catalog entry and were left as-is
        // (genuine legacy free text needing manual attention).
        public int OffCatalogValues { get; set; }
    }
}
