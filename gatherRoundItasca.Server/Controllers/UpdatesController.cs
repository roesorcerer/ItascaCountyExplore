using gatherRoundItasca.Server.Models;
using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace gatherRoundItasca.Server.Controllers
{
    // Attribute to specify that this class should be treated as a controller with an API interface.
    [ApiController]
    // Route template for this controller to handle HTTP requests.
    [Route("api/[controller]")]
    public class UpdatesController : ControllerBase
    {
        private readonly UpdatesDataService _updatesDataService;

        public UpdatesController(UpdatesDataService updatesDataService)
        {
            _updatesDataService = updatesDataService;
        }
        // HTTP GET method to retrieve a collection of updates.
        // The method is asynchronous to allow non-blocking calls and database operations.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UpdateModel>>> Get()
        {
            try
            {
                var updates = await _updatesDataService.GetUpdatesAsync();
                if (updates == null || !updates.Any())
                {
                    return NotFound("Updates not found.");
                }
                return Ok(updates);
            }
            catch (Exception ex)
            {
                // Log the exception details here
                return StatusCode(500, "An error occurred while retrieving updates.");
            }
        }
        // HTTP POST method to add a new update to the collection.
        // The method is asynchronous to allow non-blocking calls and database operations.

    }
}
