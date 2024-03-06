using gatherRoundItasca.Server.Models;
using System.Text.Json;

namespace gatherRoundItasca.Server.Services
{
    public class UpdatesDataService
    {
        private readonly string _jsonFilePath;

        public static object? UpdatesService { get; private set; }

        public UpdatesDataService(IWebHostEnvironment webHostEnvironment)
        {
            _jsonFilePath = Path.Combine(webHostEnvironment.ContentRootPath,
                                         "Data", "updatesData.json");
        }

        public async Task<List<UpdateModel>> GetUpdatesAsync()
        {
            using (var jsonFileReader = File.OpenText(_jsonFilePath))
            {
                var json = await jsonFileReader.ReadToEndAsync();
                return JsonSerializer.Deserialize<List<UpdateModel>>(json,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
            }
        }

    }



}
