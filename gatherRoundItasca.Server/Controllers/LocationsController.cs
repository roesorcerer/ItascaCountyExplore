using gatherRoundItasca.Server.Models;
using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;


namespace gatherRoundItasca.Server.Controllers
{
    // Attribute to specify that this class should be treated as a controller with an API interface.
    [ApiController]
    // Route template for this controller to handle HTTP requests.
    [Route("api/[controller]")]
    public class LocationsController : ControllerBase
    {
        private readonly IMongoCollection<LocationModel> _locations;

        public LocationsController(MongoCollectionsService collectionsService)
        {
            _locations = collectionsService.Locations;
        }
    [HttpGet]
        public async Task<ActionResult<IEnumerable<LocationModel>>> Get()
        {
            try
            {
                var locations = await _locations.Find(Builders<LocationModel>.Filter.Empty)
                    .SortBy(x => x.Id)
                    .ToListAsync();

                return Ok(locations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while retrieving locations.", details = ex.Message });
            }
        }

    }
}