using System.Globalization;
using System.Text;

namespace gatherRoundItasca.Server.Services
{
    // Builds a PlayerId from a Player's three Favorites.
    //
    // The PlayerId is the PascalCase concatenation of the chosen colour, food and
    // animal (e.g. "Purple", "Tacos", "Otter" -> "PurpleTacosOtter"). When that
    // base is already taken, the smallest unused integer starting at 2 is appended
    // ("PurpleTacosOtter2", "PurpleTacosOtter3", ...). Picklist values may contain
    // spaces ("Ice Cream"); those are folded into PascalCase ("IceCream").
    //
    // See docs/adr/0002-player-identity-and-authentication.md and
    // docs/adr/0005-playerid-generation-from-favorites.md.
    public static class PlayerIdGenerator
    {
        // The unsuffixed PlayerId for a Favorites combination.
        public static string BuildBase(string color, string food, string animal)
        {
            return Pascalize(color) + Pascalize(food) + Pascalize(animal);
        }

        // The candidate PlayerId for a given suffix: the base for 1, base+suffix
        // for 2 and up. Suffixes below 2 never appear in a stored PlayerId.
        public static string Candidate(string baseId, int suffix)
        {
            return suffix <= 1 ? baseId : baseId + suffix;
        }

        private static string Pascalize(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return string.Empty;
            }

            var sb = new StringBuilder(value.Length);
            bool startOfWord = true;
            foreach (var ch in value.Trim())
            {
                if (char.IsWhiteSpace(ch))
                {
                    startOfWord = true;
                    continue;
                }

                sb.Append(startOfWord ? char.ToUpper(ch, CultureInfo.InvariantCulture) : ch);
                startOfWord = false;
            }

            return sb.ToString();
        }
    }
}
