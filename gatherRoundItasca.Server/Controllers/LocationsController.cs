using gatherRoundItasca.Server.Models;
using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;


namespace gatherRoundItasca.Server.Controllers
{
    // Attribute to specify that this class should be treated as a controller with an API interface.
    [ApiController]
    // Route template for this controller to handle HTTP requests.
    [Route("api/[controller]")]
    public class LocationsController : ControllerBase
    {
        private readonly DataFileService _dataFileService;
        // Constructor injecting the JsonFileAnimesService into the controller.
        public LocationsController(DataFileService dataFileService)
        {
            _dataFileService = dataFileService;
        }
        // HTTP GET method to retrieve a collection of locations.
        // The method is asynchronous to allow non-blocking calls and database operations.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LocationModel>>> Get()
        {
            try
            {
                var locations = await _dataFileService.GetLocationsAsync();
                if (locations == null || !locations.Any())
                {
                    return NotFound("Locations not found.");
                }
                return Ok(locations);
            }
            catch (Exception ex)
            {
                // Log the exception details here
                return StatusCode(500, "An error occurred while retrieving locations.");
            }
  
        }

    }
}