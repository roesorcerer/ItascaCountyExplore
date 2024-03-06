using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using System.Xml.Linq;
using gatherRoundItasca.Server.Models;
using Microsoft.AspNetCore.Hosting;
using gatherRoundItasca.Server.Controllers;

namespace gatherRoundItasca.Server.Services
{
    public class DataFileService
    {
        private readonly string _jsonFilePath;

        public static object? LocationService { get; private set; }

        public DataFileService(IWebHostEnvironment webHostEnvironment)
        {
            _jsonFilePath = Path.Combine(webHostEnvironment.ContentRootPath,
                                         "Data", "bestitascalocations.json");
        }

        public async Task<List<LocationModel>> GetLocationsAsync()
        {
            using (var jsonFileReader = File.OpenText(_jsonFilePath))
            {
                var json = await jsonFileReader.ReadToEndAsync();
                return JsonSerializer.Deserialize<List<LocationModel>>(json,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
            }
        }



        public async Task SaveLocationsAsync(List<LocationModel> locations)
        {
            using (var outputStream = File.Create(_jsonFilePath))
            {
                await JsonSerializer.SerializeAsync(outputStream, locations, new JsonSerializerOptions { WriteIndented = true });
            }
        }

        // Asynchronously add a rating to an anime identified by its ID
        public async Task AddRatingAsync(string locationId, int rating)
        {
            using (var outputStream = File.Create(_jsonFilePath))
            {
                await JsonSerializer.SerializeAsync(outputStream, locationId, new JsonSerializerOptions { WriteIndented = true });
            }
        }


    }
}
