using MongoDB.Bson.Serialization.Attributes;

namespace gatherRoundItasca.Server.Models;

// The Admin is a distinct actor from a Player, not a Player with an isAdmin flag:
// it authenticates with a real username + password (never the 4-digit Player PIN)
// because an Admin can delete every Stop and rewrite any Player's data. There is a
// single Admin account. See docs/adr/0003.
public class AdminModel
{
    // The username is the natural key for the single account, so it doubles as the
    // document _id and is unique by construction.
    [BsonId]
    public string Username { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    // Brute-force defence mirrors the Player login lockout (ADR 0002): even a strong
    // password benefits from throttling repeated guesses against the one account.
    public int FailedLoginAttempts { get; set; }

    public DateTime? LockoutUntil { get; set; }
}
