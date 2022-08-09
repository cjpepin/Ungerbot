using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace Backend.Models
{
    public class User
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
        public DateTime RefreshTokenExpiryTime { get; set; }
        public string ProfilePicture { get; set; } = "";
        public int Theme { get; set; } = 0!;
        public string CustomTheme { get; set; } = "";
        public string? AssociatedUserId { get; set; }

        // Stores the top products in a dictionary with <key, val> = <Prod_Id, score> ordered by score.
        public Dictionary<string, double> TopProducts { get; set; } = new Dictionary<string, double>();

        // Stores the top similar users to this user in a dictionary with <key, val> = <User_Id, score> ordered by score.
        public Dictionary<string, double> SimilarUsers { get; set; } = new Dictionary<string, double>();
    }
}
