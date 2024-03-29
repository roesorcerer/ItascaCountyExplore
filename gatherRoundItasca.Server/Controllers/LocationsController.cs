using gatherRoundItasca.Server.Data;
using gatherRoundItasca.Server.Models;
using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
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
        private readonly ExploreItascaContext _context;
        // Constructor injecting the JsonFileAnimesService into the controller.
        public LocationsController(ExploreItascaContext context)
        {
            _context = context;
        }
        // HTTP GET method to retrieve a collection of locations.
        // The method is asynchronous to allow non-blocking calls and database operations.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LocationModel>>> Get()
        {
            try
            {
                var locations = await _context.Location.ToListAsync();
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