using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace gatherRoundItasca.Server.Models
{
    [BsonIgnoreExtraElements]
    public class UpdateModel
    {
        //ID reference for the update
        [Key]
        [BsonId]
        [BsonRepresentation(BsonType.Int32)]
        public int UpdateNumber { get; set; }
        //date the update was made
        [Required]
        public string? Date { get; set; }
        //locations updates
        [Required]
        public string? LocationUpdate { get; set; }

        //Leaderboard update for the locations
        [Required]
        public string? LeaderboardUpdate { get; set; }

        //update image for the location - teaser image
        [Required]
        public string? Image { get; set; }

        //Json serializer to serialize the location model
        public override string ToString() => JsonSerializer.Serialize<UpdateModel>(this);
    }
}
