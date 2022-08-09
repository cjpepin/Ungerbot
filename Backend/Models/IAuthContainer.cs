using System.Security.Claims;

namespace Backend.Models
{
    public interface IAuthContainer
    {
        string SecretKey { get; set; }
        string SecurityAlgorithm { get; set; }
        int ExpireMinutes { get; set; }

        Claim[] Claims { get; set; }
    }
}
