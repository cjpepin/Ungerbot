using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Models
{
    public class Error
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;
        public string UserName { get; set; }
        public string ErrorMessage { get; set; }
        public int ErrorStatus { get; set; }
        public Error(string userName, string error, int errorStatus)
        {
            Id = "";
            UserName = userName;
            ErrorMessage = error;
            ErrorStatus = errorStatus;
        }
    }
}
