namespace gatherRoundItasca.Server.Models
{
    // A derived read projection of the Leaderboard — computed on read as all
    // Players sorted by Points descending. It is never persisted and never a
    // collection. Rank is the 1-based position in that sorted list.
    // See docs/adr/0001-leaderboard-is-a-derived-projection.md.
    public record LeaderboardModel(string PlayerId, int Points, int Rank);
}
