namespace Backend.Models
{
    public class Message
    {
        public string MessageData { get; set; }
        public bool IsFromUser { get; set; }
        public DateTime Timestamp { get; set; }

        public Message(string messageData, bool isFromUser)
        {
            MessageData = messageData;
            IsFromUser = isFromUser;
            Timestamp = DateTime.UtcNow;
        }
    }
}
