using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;


namespace gatherRoundItasca.Server.Controllers
{
    // Legacy read endpoint. Since docs/adr/0004 the `locations` collection is retired
    // from reads; this projects the old Location shape from Trails + their Order-1
    // (Trailhead) Stop so any remaining legacy consumer keeps working. New code should
    // read TrailsController (`/api/trails`) instead.
    [ApiController]
    [Route("api/[controller]")]
    public class LocationsController : ControllerBase
    {
        private readonly IMongoCollection<Models.TrailModel> _trails;
        private readonly IMongoCollection<Models.StopModel> _stops;

        public LocationsController(MongoCollectionsService collectionsService)
        {
            _trails = collectionsService.Trails;
            _stops = collectionsService.Stops;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LocationDto>>> Get()
        {
            try
            {
                var trails = await _trails.Find(Builders<Models.TrailModel>.Filter.Empty).ToListAsync();

                // The Trailhead (Order = 1) Stop carries the coordinates/riddle the old
                // Location shape exposed.
                var trailheads = await _stops.Find(x => x.Order == 1).ToListAsync();
                var headByTrail = trailheads
                    .Where(s => s.TrailId != null)
                    .GroupBy(s => s.TrailId!)
                    .ToDictionary(g => g.Key, g => g.First());

                var locations = trails
                    .OrderBy(t => t.LegacyLocationId)
                    .Select(t =>
                    {
                        headByTrail.TryGetValue(t.Id ?? string.Empty, out var head);
                        return new LocationDto(
                            t.Id ?? string.Empty,
                            t.Date ?? string.Empty,
                            t.Region ?? string.Empty,
                            t.CoverImage ?? string.Empty,
                            t.Url ?? string.Empty,
                            t.Name ?? string.Empty,
                            t.Description ?? string.Empty,
                            head?.Coordinates ?? string.Empty,
                            head?.Riddle ?? string.Empty);
                    });

                return Ok(locations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while retrieving locations.", details = ex.Message });
            }
        }

        public record LocationDto(
            string Id,
            string Date,
            string Location,
            string Image,
            string Url,
            string Title,
            string Description,
            string Coordinates,
            string Riddle);
    }
}
