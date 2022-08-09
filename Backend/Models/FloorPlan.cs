using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace Backend.Models
{
    public class FloorPlan
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; }
        public List<string> Scenes { get; set; }
        public string TimeStamp { get; set; }

        public FloorPlan(string userId, string timeStamp)
        {
            Scenes = new List<string>();
            UserId = userId;
            TimeStamp = timeStamp;
        }
        public FloorPlan(string userId, string timeStamp, string scene)
        {
            Scenes = new List<string>();
            Scenes.Add(scene);
            UserId = userId;
            TimeStamp = timeStamp;
        }

        public void Add(string scene)
        {
            Scenes.Add(scene);
        }


        
    }
}
