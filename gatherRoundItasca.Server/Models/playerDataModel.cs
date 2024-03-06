using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using System.Text.Json;

namespace gatherRoundItasca.Server.Models
{
    //Model for the player data
    public class playerDataModel
    {

        //Email for the player with the get and set methods
        [Required]
        public string? Email { get; set; }
        //PlayerID for the player with the get and set methods
        [Required]
        public string? PlayerId { get; set; }

        //FavoriteColor for the player with the get and set methods
        [Required]
        public string? FavoriteColor { get; set; }

        //FavoriteNumber for the player with the get and set methods
        [Required]
        public int? FavoriteFood { get; set; }

        //FavoriteAnimal for the player with the get and set methods
        [Required]
        public string? FavoriteAnimal { get; set; }

        //Points the player has accumulated with the get and set methods
        [Required]
        public int Points { get; set; }

        //Json serializer to serialize the location model
        public override string ToString() => JsonSerializer.Serialize<playerDataModel>(this);
    }
}

