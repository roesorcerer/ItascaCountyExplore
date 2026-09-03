using gatherRoundItasca.Server.Models;
using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace gatherRoundItasca.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UpdatesController : ControllerBase
    {
        private readonly IMongoCollection<UpdateModel> _updates;

        public UpdatesController(MongoCollectionsService collectionsService)
        {
            _updates = collectionsService.Updates;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UpdateModel>>> Get()
        {
            var updates = await _updates.Find(Builders<UpdateModel>.Filter.Empty)
                .SortBy(x => x.UpdateNumber)
                .ToListAsync();

            return Ok(updates);
        }
    }
}
