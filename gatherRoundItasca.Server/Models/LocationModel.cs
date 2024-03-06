using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Xml.Linq;

namespace gatherRoundItasca.Server.Models
{
    public class LocationModel
    {
        //ID reference for the location
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

        //ratings of the location by the webdev
        [JsonPropertyName("Ratings-rowan")]
        [Required]
        public List<int>? RatingsRowan { get; set; } = new List<int>();

        //ratings of the location by the enduser
        [JsonPropertyName("Ratings-audience")]
        [Required]
        public List<int>? RatingsUser { get; set; } = new List<int>();

        //Json serializer to serialize the location model
        public override string ToString() => JsonSerializer.Serialize<LocationModel>(this);
    }
}
