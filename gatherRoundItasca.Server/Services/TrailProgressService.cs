using gatherRoundItasca.Server.Models;
using MongoDB.Driver;

namespace gatherRoundItasca.Server.Services
{
    // Derives a Player's position within a Trail from the checkins log — the single
    // source of truth (docs/adr/0004). The "current" Stop is the lowest-Order Stop
    // the Player has not yet checked in; the reveal mechanic guarantees completion
    // is contiguous, so this is also the only Stop a Player may validly check in at.
    public class TrailProgressService
    {
        private readonly MongoCollectionsService _collections;

        public TrailProgressService(MongoCollectionsService collections)
        {
            _collections = collections;
        }

        // Stops of a Trail in ascending Order.
        public Task<List<StopModel>> GetOrderedStopsAsync(string trailId) =>
            _collections.Stops.Find(x => x.TrailId == trailId)
                .SortBy(x => x.Order)
                .ToListAsync();

        // StopIds the Player has checked in on this Trail.
        public async Task<HashSet<string>> GetCompletedStopIdsAsync(string playerId, string trailId)
        {
            var ids = await _collections.Checkins
                .Find(x => x.PlayerId == playerId && x.TrailId == trailId)
                .Project(x => x.StopId)
                .ToListAsync();

            return ids.Where(id => id != null).Select(id => id!).ToHashSet();
        }

        public async Task<TrailProgress> GetProgressAsync(string playerId, string trailId)
        {
            var stops = await GetOrderedStopsAsync(trailId);
            var completed = await GetCompletedStopIdsAsync(playerId, trailId);
            return BuildProgress(stops, completed);
        }

        // Pure projection so callers that already have the Stops/check-ins can reuse it.
        public static TrailProgress BuildProgress(List<StopModel> orderedStops, HashSet<string> completedStopIds)
        {
            var completedCount = orderedStops.Count(s => s.Id != null && completedStopIds.Contains(s.Id));
            var current = orderedStops.FirstOrDefault(s => s.Id == null || !completedStopIds.Contains(s.Id));

            return new TrailProgress(
                Total: orderedStops.Count,
                Completed: completedCount,
                CurrentStop: current,
                IsComplete: current == null && orderedStops.Count > 0);
        }
    }

    public record TrailProgress(int Total, int Completed, StopModel? CurrentStop, bool IsComplete);
}
