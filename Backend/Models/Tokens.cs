namespace Backend.Models
{
    public class Tokens
    {
        public string JwtToken { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
    }
}
