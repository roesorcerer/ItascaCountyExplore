namespace gatherRoundItasca.Server.Services
{
    // The fixed, curated picklists the three Favorites (colour, food, animal) are
    // chosen from. This is the *authoritative* copy: a Favorite is only valid if it
    // matches an entry here, so a client can never submit free text and mint a
    // PlayerId from it.
    //
    // Favorites are reproducible identity material — a Player must re-enter the exact
    // same three things months later to recover their ID — and the PlayerId built
    // from them is shown publicly. Picklists (over free text) make recovery reliable
    // and remove profanity/typo risk. See docs/adr/0005-playerid-generation-from-favorites.md
    // and docs/adr/0002-player-identity-and-authentication.md.
    public static class FavoritesCatalog
    {
        // Kept in sync with the client picklist (gatherrounditasca.client/src/constants.ts,
        // FORM_OPTIONS), which the client also fetches from GET /api/player/favorites so
        // the two cannot silently drift.
        public static readonly IReadOnlyList<string> Colors = new[]
        {
            "Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Black", "White", "Pink", "Grey"
        };

        public static readonly IReadOnlyList<string> Foods = new[]
        {
            "Pizza", "Sushi", "Pasta", "Burger", "Salad", "Steak", "Tacos", "Curry", "Ice Cream", "Chocolate"
        };

        public static readonly IReadOnlyList<string> Animals = new[]
        {
            "Dog", "Cat", "Bird", "Fish", "Lion", "Tiger", "Bear", "Elephant", "Wolf", "Fox"
        };

        // Resolves a submitted value to its canonical catalog entry, case- and
        // whitespace-insensitively (so "ice cream" -> "Ice Cream"). Returns the
        // canonical string, or null if the value is not in the picklist. Storing the
        // canonical form keeps Favorites-based recovery (an exact match) reliable.
        public static string? Canonicalize(IReadOnlyList<string> picklist, string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            var trimmed = value.Trim();
            foreach (var entry in picklist)
            {
                if (string.Equals(entry, trimmed, StringComparison.OrdinalIgnoreCase))
                {
                    return entry;
                }
            }

            return null;
        }
    }
}
