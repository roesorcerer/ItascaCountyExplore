using System.ComponentModel.DataAnnotations;

namespace gatherRoundItasca.Server.Models
{
    public class GroupModel
    {
        [Key] // Marks GroupId as the primary key
        public string? GroupId { get; set; } //the ID of the group
        public string? GroupName { get; set; } //the name of the group
        public string? GroupDescription { get; set; } //the description of the group
        public string? GroupImage { get; set; } //the image of the group
        public string? GroupLeader { get; set; } //the leader of the group
        public string? GroupMembers { get; set; } //the members of the group
    }
}
