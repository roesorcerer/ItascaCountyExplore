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

        // Consecutive failed login attempts. Reset to 0 on a successful login.
        // The PlayerId is public (it's the leaderboard name) so the 4-digit PIN
        // is the only secret; brute force is mitigated by locking the account
        // after too many wrong attempts. See docs/adr/0002.
        public int FailedLoginAttempts { get; set; }

        // When set and in the future, login is locked out until this time.
        public DateTime? LockoutUntil { get; set; }

        // An Admin may disable a Player without deleting their check-in history.
        public bool IsDisabled { get; set; }
    }
}

