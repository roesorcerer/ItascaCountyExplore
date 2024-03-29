using System.ComponentModel.DataAnnotations;

namespace gatherRoundItasca.Server.Models
{
    public class LeaderboardModel
    {
        [Key] // Marks Place as the primary key
        public int? Place { get; set; } //the place the player is in
        public string? PlayerId { get; set; } //the ID of the player
        public int Points { get; set; } //the points the player has
        public int Rank { get; set; } //the rank of the player

        // Navigation property for group pointing to model
        public List<GroupModel> Groups { get; set; } = new List<GroupModel>();



        // Navigation property back to the Location
        public PlayerDataModel? Ranking { get; set; } //the player data model, pointing back to datamodel 
    }
}
