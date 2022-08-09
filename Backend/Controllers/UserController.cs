using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using System.Text.RegularExpressions;
using Newtonsoft.Json.Linq;
using System.Net.Mail;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IPasswordHasher<User> _passwordHasher;

        public UserController(IUserService userService)
        {
            _userService = userService;
            _passwordHasher = new PasswordHasher<User>();
        }

        [HttpGet("check-jwt"), Authorize]
        public IActionResult CheckJWT()
        {
            return Ok();
        }

        [HttpGet("get-email"), Authorize]
        public async Task<IActionResult> GetEmail([FromQuery] string username)
        {
            if (username is null || username == "")
            {
                return BadRequest("Username was invalid.");
            }

            User? user = await _userService.GetByNameAsync(username);
            if (user is null)
            {
                return NotFound("User not found.");
            }

            return Ok(user.Email);
        }

        [HttpPost("update-user"), Authorize]
        public async Task<IActionResult> UpdateUser([FromBody] JObject jsonBody)
        {
            IActionResult retv = Ok();

            // Check for bad json body
            if (jsonBody is null || !jsonBody.ContainsKey("body") || jsonBody["body"] is null)
            {
                return BadRequest("Bad json body");
            }

            // Extract data from json body and sanitize newlines that come over
            JToken? tokens = jsonBody["body"];
            string oldUsername = (tokens!["oldUsername"] ?? "").ToString().Replace("\n", "");
            string newUsername = (tokens["newUsername"] ?? "").ToString().Replace("\n", "");
            string newEmail = (tokens["newEmail"] ?? "").ToString().Replace("\n", "");

            User? existingUser = await _userService.GetByNameAsync(oldUsername);
            if (existingUser is null)
            {
                return NotFound("User not found.");
            }


            // Update the existing user
            if (newEmail != "")
            { 
                existingUser.Email = newEmail; 
            }

            // Check for duplicate username
            User? userWithRequestedUsername = await _userService.GetByNameAsync(newUsername);
            if (userWithRequestedUsername is not null)
            {
                retv = Conflict();
            }
            else
            {
                existingUser.UserName = newUsername;
            }

            // Update in database
            await _userService.UpdateAsync(existingUser.Id, existingUser);

            return retv;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] User user)
        {
            if (user is null)
            {
                return BadRequest("Invalid client request.");
            }

            User? verifiedUser = await _userService.AuthenticateUser(user, _passwordHasher);
            if (verifiedUser == null)
                return NotFound();

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, verifiedUser.UserName),
                new Claim(ClaimTypes.Email, verifiedUser.Email),
            };

            var accessToken = AuthService.GenerateAccessToken(claims);
            var refreshToken = AuthService.GenerateRefreshToken();

            verifiedUser.RefreshToken = refreshToken;
            verifiedUser.RefreshTokenExpiryTime = DateTime.UtcNow.AddMinutes(10);

            // Update user in database
            await _userService.UpdateAsync(verifiedUser.Id, verifiedUser);

            return Ok(new Tokens
            {
                JwtToken = accessToken,
                RefreshToken = refreshToken,
            });
        }

        // Refresh JWT tokens
        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshRequest refreshRequest)
        {
            // Check for user nonexistence
            User? user = await _userService.GetByNameAsync(refreshRequest.Username);
            if (user is null)
                return BadRequest();

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email),
            };

            var accessToken = AuthService.GenerateAccessToken(claims);
            var newRefreshToken = AuthService.GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddMinutes(10);


            // Update user in database
            await _userService.UpdateAsync(user.Id, user);

            return Ok(new Tokens
            {
                JwtToken = accessToken,
                RefreshToken = newRefreshToken,
            });
        }

        [HttpGet("verify-refresh")]
        public async Task<IActionResult> VerifyRefresh([FromQuery] string username)
        {
            User? userRecord = await _userService.GetByNameAsync(username);

            if (userRecord is null)
                return NotFound();

            DateTime currentTime = DateTime.UtcNow;
            DateTime expireTime = userRecord.RefreshTokenExpiryTime;
            if (currentTime > expireTime)
                return BadRequest();
            else
                return Ok(userRecord.UserName);

        }

        // Create
        [HttpPost("create-user")]
        public async Task<IActionResult> CreateUser([FromBody] User newUser)
        {
            Console.WriteLine(newUser);
            // Ensure email, username, and password are secure.
            var emailRegex = new Regex(@"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$");
            var usernameRegex = new Regex(@"^[\w\d#?!@$%^&*-]{4,20}$");
            var passwordRegex1 = new Regex(@"^[\w\d#?!@$%^&*-]{8,}$");
            var passwordRegex2 = new Regex(@"^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$!%*#?&]{8,}$");
            var passwordRegex3 = new Regex(@"^(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$");
            var passwordRegex4 = new Regex(@"(.)\1{4,}");

            // Test all regexes
            if (!usernameRegex.IsMatch(newUser.UserName)) return BadRequest("Username must be between 4 and 20 characters.");
            if (!passwordRegex1.IsMatch(newUser.Password)) return BadRequest("Password must contain at least 8 characters.");
            if (!passwordRegex2.IsMatch(newUser.Password)) return BadRequest("Password must contain at least 1 uppercase and 1 lowercase letter.");
            if (!passwordRegex3.IsMatch(newUser.Password)) return BadRequest("Password must contain at least 1 number and 1 special character.");
            if (passwordRegex4.IsMatch(newUser.Password)) return BadRequest("Password cannot contain 4 or more repeated character.");
            if (!emailRegex.IsMatch(newUser.Email)) return BadRequest("Please put in a valid email address.");

            User? match = await _userService.GetByEmailAsync(newUser.Email);
            if (match is not null)
                return BadRequest("Email is being used for a different account");

            MailAddress address = new MailAddress(newUser.Email);
            if (address.Address != newUser.Email)
                return BadRequest("Please put in a valid email address.");

            // Check for duplicate username
            User? user = await _userService.GetByNameAsync(newUser.UserName);
            if (user is not null)
                return Conflict();

            // We're good to make a new user. Hash/salt the password to store in the database.
            newUser.Password = _passwordHasher.HashPassword(newUser, newUser.Password);

            // Actually store the new user
            await _userService.CreateAsync(newUser);
            return Ok();
        }
        //Get profile picture
        [HttpGet("get-pfp"), Authorize]
        public async Task<IActionResult> GetProfilePicture([FromQuery] string username)
        {
            User? userRecord = await _userService.GetByNameAsync(username);
            if (userRecord is null)
            {
                return NotFound();
            }

            // Return stored base64 encoded string
            return Ok(userRecord.ProfilePicture);
        }
        // Save profile picture
        [HttpPost("save-pfp"), Authorize]
        public async Task<IActionResult> UpdateProfilePicture([FromBody] User user)
        {
            User? userRecord = await _userService.GetByNameAsync(user.UserName);
            if (userRecord is null)
            {
                return NotFound();
            }

            // Update user record
            userRecord.ProfilePicture = user.ProfilePicture;
            await _userService.UpdateAsync(userRecord.Id, userRecord);

            return Ok();
        }

        [HttpGet("get-theme"), Authorize]
        public async Task<IActionResult> GetTheme([FromQuery] string username)
        {
            User? userRecord = await _userService.GetByNameAsync(username);
            if (userRecord is null)
            {
                return NotFound();
            }

            // Return stored base64 encoded string
            return Ok(userRecord.Theme);
        }

        [HttpPost("set-theme"), Authorize]
        public async Task<IActionResult> SetTheme([FromBody] User user)
        {
            User? userRecord = await _userService.GetByNameAsync(user.UserName);
            if (userRecord is null)
            {
                return NotFound();
            }

            // Update user record
            userRecord.Theme = user.Theme;
            await _userService.UpdateAsync(userRecord.Id, userRecord);

            return Ok();
        }

        [HttpGet("get-custom-theme"), Authorize]
        public async Task<IActionResult> GetCustomTheme([FromQuery] string username)
        {
            User? userRecord = await _userService.GetByNameAsync(username);
            if (userRecord is null)
            {
                return NotFound();
            }

            // Return stored base64 encoded string
            return Ok(userRecord.CustomTheme);
        }

        [HttpPost("set-custom-theme"), Authorize]
        public async Task<IActionResult> SetCustomTheme([FromBody] User user)
        {
            User? userRecord = await _userService.GetByNameAsync(user.UserName);
            if (userRecord is null)
            {
                return NotFound();
            }
            // Update user record
            userRecord.CustomTheme = user.CustomTheme;
            await _userService.UpdateAsync(userRecord.Id, userRecord);

            return Ok();
        }

        [HttpGet("verifyToken"), Authorize]
        public async Task<IActionResult> VerifyToken([FromQuery] string username)
        {
            User? userRecord = await _userService.GetByNameAsync(username);
            if (userRecord is null)
            {
                return NotFound();
            }
            return Ok(userRecord.UserName);
        }
    }
}