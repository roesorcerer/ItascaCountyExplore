using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace gatherRoundItasca.Server.Models
{
    // A Stop is a single point on a Trail. It references its Trail by TrailId and
    // carries an Order within that Trail plus a per-Stop point value. The next Stop
    // is not stored as a link — it is derived as the next-higher Order in the same
    // Trail and revealed only after a Player checks in here. A Stop stores no
    // VisitCount: visits are derived from the checkins log. See docs/adr/0004.
    [BsonIgnoreExtraElements]
    public class StopModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        // The owning Trail's id. (TrailId, Order) is unique — see
        // MongoCollectionsService.EnsureIndexesAsync. Not [Required]: it is assigned
        // server-side from the route on create, so the request body omits it — and
        // [ApiController] runs model validation before the action would set it.
        [BsonRepresentation(BsonType.ObjectId)]
        public string? TrailId { get; set; }

        // 1-based position within the Trail. Strict order: a check-in is valid only
        // for the Player's current (lowest un-completed) Order.
        [Required]
        public int Order { get; set; }

        // Points awarded the first time a Player checks in here.
        public int Points { get; set; } = DefaultPoints;

        public const int DefaultPoints = 10;

        // Point-specific content.
        [Required]
        public string? Title { get; set; }

        [Required]
        public string? Riddle { get; set; }

        // "lat, lon" — same string shape locations used.
        [Required]
        public string? Coordinates { get; set; }

        public string? Image { get; set; }
    }
}
