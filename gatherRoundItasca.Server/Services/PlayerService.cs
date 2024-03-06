using gatherRoundItasca.Server.Models;
using Newtonsoft.Json;

namespace gatherRoundItasca.Server.Services
{
    public class PlayerService
    {
        private readonly string _jsonFilePath = @"Data\playerData.json";
        public async Task AddPointsAsync(string playerId, int points)
        {
            // Load the exsisting players from the JSON file
            var jsonData = System.IO.File.ReadAllText(_jsonFilePath);
            var playerList = JsonConvert.DeserializeObject<List<playerDataModel>>(jsonData) ?? new List<playerDataModel>();
            // Find the player with the given playerID
            var player = playerList.FirstOrDefault(p => p.PlayerId == playerId);
            if (player != null)
            { 
                // Initilize the points if it is null
                if (player.Points == null)
                {
                    player.Points = 0;
                }
                // Add the points to the player
                player.Points += points;

                // Save the updated player list to the JSON file
                var updatedJson = JsonConvert.SerializeObject(playerList, Formatting.Indented);
                await System.IO.File.WriteAllTextAsync(_jsonFilePath, updatedJson);
            }
        }
    }
}
