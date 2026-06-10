using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace gatherRoundItasca.Server.Models
{
    // A Trail is the curated wrapper (name, description, metadata) in the `trails`
    // collection. Its Stops live in a separate `stops` collection and reference it
    // by TrailId — see StopModel and docs/adr/0004. A Trail stores no VisitCount:
    // traffic is derived from the checkins log, never a denormalized counter.
    [BsonIgnoreExtraElements]
    public class TrailModel
    {
        // Server-assigned ObjectId, surfaced as a string (like PlayerDataModel._id).
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string? Name { get; set; }

        [Required]
        public string? Description { get; set; }

        // Metadata carried over from the location wrapper.
        public string? Region { get; set; }
        public string? CoverImage { get; set; }
        public string? Url { get; set; }
        public string? Date { get; set; }

        // The int id of the `locations` record this Trail was migrated from, kept
        // for traceability back to the legacy source. See docs/adr/0004.
        public int LegacyLocationId { get; set; }
    }
}
