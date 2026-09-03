using gatherRoundItasca.Server.Authorization;
using gatherRoundItasca.Server.Models;
using gatherRoundItasca.Server.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace gatherRoundItasca.Server.Controllers;

[ApiController]
[Route("api/admin/updates")]
[AdminAuthorize]
public class AdminUpdatesController : ControllerBase
{
    private readonly IMongoCollection<UpdateModel> _updates;
    public AdminUpdatesController(MongoCollectionsService collections) => _updates = collections.Updates;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UpdateModel>>> GetUpdatesAsync() =>
        Ok(await _updates.Find(Builders<UpdateModel>.Filter.Empty).SortBy(x => x.UpdateNumber).ToListAsync());

    [HttpPost]
    public async Task<ActionResult<UpdateModel>> CreateUpdateAsync([FromBody] UpdateModel model)
    {
        if (model == null || model.UpdateNumber <= 0) return BadRequest(new { message = "UpdateNumber is required and must be greater than zero." });
        if (await _updates.Find(x => x.UpdateNumber == model.UpdateNumber).AnyAsync()) return Conflict(new { message = "An update with this number already exists." });
        await _updates.InsertOneAsync(model);
        return Ok(model);
    }

    [HttpPut("{updateNumber:int}")]
    public async Task<IActionResult> UpdateUpdateAsync(int updateNumber, [FromBody] UpdateModel model)
    {
        if (model == null) return BadRequest(new { message = "Update payload is required." });
        model.UpdateNumber = updateNumber;
        var result = await _updates.ReplaceOneAsync(x => x.UpdateNumber == updateNumber, model);
        return result.MatchedCount == 0 ? NotFound(new { message = "Update not found." }) : Ok(model);
    }

    [HttpDelete("{updateNumber:int}")]
    public async Task<IActionResult> DeleteUpdateAsync(int updateNumber)
    {
        var result = await _updates.DeleteOneAsync(x => x.UpdateNumber == updateNumber);
        return result.DeletedCount == 0 ? NotFound(new { message = "Update not found." }) : NoContent();
    }
}