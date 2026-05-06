using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace gatherRoundItasca.Server.Models
{
    //Model for the player data
    [BsonIgnoreExtraElements]
    public class PlayerDataModel
    {
        //PlayerID for the player with the get and set methods
        [Key]
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string? PlayerId { get; set; }
        //Email for the player with the get and set methods
        [Required]
        public string? Email { get; set; }


        //FavoriteColor for the player with the get and set methods
        [Required]
        public string? FavoriteColor { get; set; }

        //FavoriteNumber for the player with the get and set methods
        [Required]
        public string? FavoriteFood { get; set; }

        //FavoriteAnimal for the player with the get and set methods
        [Required]
        public string? FavoriteAnimal { get; set; }

        //Points the player has accumulated with the get and set methods
        [Required]
        public int Points { get; set; }

        //PIN for login (hashed) with the get and set methods
        [Required]
        public string? PinHash { get; set; }
    }
}

