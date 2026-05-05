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
    public class UpdatesController : ControllerBase
    {
        private readonly IMongoCollection<UpdateModel> _updates;

        public UpdatesController(MongoCollectionsService collectionsService)
        {
            _updates = collectionsService.Updates;
        }
        // HTTP GET method to retrieve a collection of updates.
        // The method is asynchronous to allow non-blocking calls and database operations.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UpdateModel>>> Get()
        {
            try
            {
                var updates = await _updates.Find(Builders<UpdateModel>.Filter.Empty)
                    .SortBy(x => x.UpdateNumber)
                    .ToListAsync();

                if (updates == null || !updates.Any())
                {
                    return NotFound("Updates not found.");
                }
                return Ok(updates);
            }
            catch (Exception)
            {
                // Log the exception details here
                return StatusCode(500, "An error occurred while retrieving updates.");
            }
        }
        // HTTP POST method to add a new update to the collection.
        // The method is asynchronous to allow non-blocking calls and database operations.

    }
}
