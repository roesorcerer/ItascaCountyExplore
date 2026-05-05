using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace gatherRoundItasca.Server.Models
{
    [BsonIgnoreExtraElements]
    public class LocationModel
    {
        //ID reference for the location
        [Key]
        [BsonId]
        [BsonRepresentation(BsonType.Int32)]
        public int Id { get; set; }
        //date that the phto was taken at the location
        [Required]
        public string? Date { get; set; }
        //location of the photo
        [Required]
        public string? Location { get; set; }

        //image of the location
        [Required]
        public string? Image { get; set; }
        //url of the location
        [Required]
        public string? Url { get; set; }
        //title of the location
        [Required]
        public string? Title { get; set; }
        //description of the location
        [Required]
        public string? Description { get; set; }
        //coordinates of the location
        [Required]
        public string? Coordinates { get; set; }
        //riddle of the location
        [Required]
        public string? Riddle { get; set; }

        // Tracks how often a trail/location is visited for admin analytics.
        public int VisitCount { get; set; } = 0;

        //Json serializer to serialize the location model
       // public override string ToString() => JsonSerializer.Serialize<LocationModel>(this);
    }
}
