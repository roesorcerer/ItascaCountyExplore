using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Xml;
using Newtonsoft.Json;
using Formatting = Newtonsoft.Json.Formatting;
using gatherRoundItasca.Server.Services;
using gatherRoundItasca.Server.Models;
namespace gatherRoundItasca.Server.Controllers;

//Lots of excess here between the PlayerRegistration and the playerDataModel. Need to clean up the code and make it more efficient.

[Route("api/[controller]")]
[ApiController]
public class PlayerController : ControllerBase
{
    private readonly EmailService _emailService;
    private readonly string _jsonFilePath = @"Data\playerData.json";

    public PlayerController(EmailService emailService)
    {
        _emailService = emailService;
    }

    [HttpPost]
    [Route("register")]
    public async Task<IActionResult> RegisterPlayer([FromBody] PlayerRegistration registration)
    {
        // Code to save registration details to JSON file
        var jsonData = System.IO.File.ReadAllText(_jsonFilePath);
        var playerList = JsonConvert.DeserializeObject<List<PlayerRegistration>>(jsonData) ?? new List<PlayerRegistration>();
        playerList.Add(new PlayerRegistration
        {
            Email = registration.Email,
            FavoriteColor = registration.FavoriteColor,
            FavoriteFood = registration.FavoriteFood,
            FavoriteAnimal = registration.FavoriteAnimal,
            PlayerId = registration.PlayerId, // Use the PlayerId from the frontend
            Points = 0 // Initialize points to 0
        });
        System.IO.File.WriteAllText(_jsonFilePath, JsonConvert.SerializeObject(playerList, Formatting.Indented));

        // Code to send email
        await _emailService.SendEmailAsync(registration.Email, "Your Player ID", $"Your unique player ID is: {registration.PlayerId}");

        return Ok(new { PlayerId = registration.PlayerId });
    }

    [HttpGet("retrieveID")]
    public IActionResult RetrievePlayerId([FromQuery] string playerID)
    {
        Console.WriteLine($"Looking for playerID: {playerID}");
        var jsonData = System.IO.File.ReadAllText(_jsonFilePath);
        var playerList = JsonConvert.DeserializeObject<List<PlayerRegistration>>(jsonData) ?? new List<PlayerRegistration>();
        Console.WriteLine($"Loaded {playerList.Count} players");

        // Find the player with the given playerID
        var player = playerList.FirstOrDefault(p => string.Equals(p.PlayerId, playerID, StringComparison.OrdinalIgnoreCase));
        if (player == null)
        {
            Console.WriteLine("Player not found");
            return NotFound(new { Message = "Player not found" });
        }
        Console.WriteLine($"Found player ID: {player.PlayerId}");
        return Ok(new { PlayerId = player.PlayerId });
    }



    [HttpGet("retrieveByEmail")]
    public IActionResult PlayerEmailRetrival([FromQuery] string email)
    {
        Console.WriteLine($"Looking for email: {email}");
        var jsonData = System.IO.File.ReadAllText(_jsonFilePath);
        var playerList = JsonConvert.DeserializeObject<List<PlayerRegistration>>(jsonData) ?? new List<PlayerRegistration>();
        Console.WriteLine($"Loaded {playerList.Count} players");

        // Find the player with the given email
        var player = playerList.FirstOrDefault(p => string.Equals(p.Email, email, StringComparison.OrdinalIgnoreCase));
        if (player == null)
        {
            Console.WriteLine("Player not found");
            return NotFound(new { Message = "Player not found" });
        }
        Console.WriteLine($"Found player ID: {player.PlayerId}");
        return Ok(new { PlayerId = player.PlayerId });
    }

    [HttpPatch("updateScore")]
public async Task AddPointsAsync(string playerId, int pointsToAdd)
    {
        var jsonData = await System.IO.File.ReadAllTextAsync(_jsonFilePath);
        var playerList = JsonConvert.DeserializeObject<List<PlayerRegistration>>(jsonData) ?? new List<PlayerRegistration>();

        var player = playerList.FirstOrDefault(p => p.PlayerId == playerId);
        if (player != null)
        {
            player.Points += pointsToAdd; // Directly add points here

            var updatedJsonData = JsonConvert.SerializeObject(playerList, Formatting.Indented);
            await System.IO.File.WriteAllTextAsync(_jsonFilePath, updatedJsonData);
        }
    }

}
public class PlayerRegistration
{
    public string? Email { get; set; }
    public string? FavoriteColor { get; set; }
    public string? FavoriteFood { get; set; }
    public string? FavoriteAnimal { get; set; }
    public string? PlayerId { get; set; }

    public int Points { get; set; } //non nullable initialization set to 0
}

