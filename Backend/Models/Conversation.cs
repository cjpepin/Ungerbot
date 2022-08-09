using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace Backend.Models
{
    public class Conversation
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;
        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; }
        public List<Message> Messages { get; set; }
        public string TimeStamp { get; set; }

        public Conversation(string userId, string timeStamp)
        {
            Messages = new List<Message>();
            UserId = userId;
            TimeStamp = timeStamp;
        }

        public Conversation()
        {
            Messages = new List<Message>();
            UserId = "";
        }

        public void Add(Message message)
        {
            Messages.Add(message);
        }
    }
}
