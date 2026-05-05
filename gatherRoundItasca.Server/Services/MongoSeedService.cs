using System.Text.Json;
using gatherRoundItasca.Server.Models;
using MongoDB.Driver;

namespace gatherRoundItasca.Server.Services
{
    public class MongoSeedService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<MongoSeedService> _logger;
        private readonly MongoCollectionsService _collections;

        public MongoSeedService(
            IWebHostEnvironment environment,
            ILogger<MongoSeedService> logger,
            MongoCollectionsService collections)
        {
            _environment = environment;
            _logger = logger;
            _collections = collections;
        }

        public async Task SeedAsync()
        {
            await SeedLocationsAsync();
            await SeedPlayersAsync();
            await SeedUpdatesAsync();
        }

        private async Task SeedLocationsAsync()
        {
            var count = await _collections.Locations.CountDocumentsAsync(Builders<LocationModel>.Filter.Empty);
            if (count > 0)
            {
                return;
            }

            var filePath = Path.Combine(_environment.ContentRootPath, "Data", "bestitascalocations.json");
            if (!File.Exists(filePath))
            {
                _logger.LogWarning("Skipping locations seed: file not found at {Path}", filePath);
                return;
            }

            var json = await File.ReadAllTextAsync(filePath);
            var locations = JsonSerializer.Deserialize<List<LocationModel>>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<LocationModel>();

            if (locations.Count == 0)
            {
                return;
            }

            await _collections.Locations.InsertManyAsync(locations);
            _logger.LogInformation("Seeded {Count} locations into MongoDB.", locations.Count);
        }

        private async Task SeedPlayersAsync()
        {
            var count = await _collections.Players.CountDocumentsAsync(Builders<PlayerDataModel>.Filter.Empty);
            if (count > 0)
            {
                return;
            }

            var filePath = Path.Combine(_environment.ContentRootPath, "Data", "playerData.json");
            if (!File.Exists(filePath))
            {
                _logger.LogWarning("Skipping players seed: file not found at {Path}", filePath);
                return;
            }

            var json = await File.ReadAllTextAsync(filePath);
            var players = JsonSerializer.Deserialize<List<PlayerDataModel>>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<PlayerDataModel>();

            if (players.Count == 0)
            {
                return;
            }

            await _collections.Players.InsertManyAsync(players);
            _logger.LogInformation("Seeded {Count} players into MongoDB.", players.Count);
        }

        private async Task SeedUpdatesAsync()
        {
            var count = await _collections.Updates.CountDocumentsAsync(Builders<UpdateModel>.Filter.Empty);
            if (count > 0)
            {
                return;
            }

            var filePath = Path.Combine(_environment.ContentRootPath, "Data", "updatesData.json");
            if (!File.Exists(filePath))
            {
                _logger.LogWarning("Skipping updates seed: file not found at {Path}", filePath);
                return;
            }

            var json = await File.ReadAllTextAsync(filePath);
            var updates = JsonSerializer.Deserialize<List<UpdateModel>>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<UpdateModel>();

            if (updates.Count == 0)
            {
                return;
            }

            await _collections.Updates.InsertManyAsync(updates);
            _logger.LogInformation("Seeded {Count} updates into MongoDB.", updates.Count);
        }
    }
}
