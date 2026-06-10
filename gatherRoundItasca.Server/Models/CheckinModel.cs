using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace gatherRoundItasca.Server.Models
{
    // A single entry in the check-in log (`checkins` collection) — the single
    // source of truth from which Points, a Stop's visit count, a Player's per-Trail
    // progress, the Leaderboard, and Admin traffic are all derived. A unique index
    // on (PlayerId, StopId) makes scoring idempotent: a repeat check-in is a
    // harmless duplicate-key no-op. See docs/adr/0004.
    [BsonIgnoreExtraElements]
    public class CheckinModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string? PlayerId { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string? StopId { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string? TrailId { get; set; }

        public DateTime Timestamp { get; set; }
    }
}
