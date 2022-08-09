namespace Backend.Models
{
    public class RefreshRequest
    {
        public string RefreshToken { get; set; } = null!;
        public string Username { get; set; } = null!;
    }
}
