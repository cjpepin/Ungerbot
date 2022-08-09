using Xunit;
using Backend.Services;
using Backend.Models;
using Microsoft.AspNetCore.Identity;

namespace TestProjects.BackendTests.Services
{
    public class UserServiceTests : IClassFixture<DatabaseFixture>
    {
        private readonly DatabaseFixture _dbSettingsFixture;
        private readonly UserService _userService;

        public UserServiceTests(DatabaseFixture dbSettingsFixture)
        {
            _dbSettingsFixture = dbSettingsFixture;
            _userService = new UserService(_dbSettingsFixture.DBSettings);
        }

        [Fact]
        public async void AuthenticateUser_ForNonExistentUser_ReturnsNull()
        {
            // This user doesn't exist
            User user = new()
            {
                UserName = "",
                Password = "",
            };

            PasswordHasher<User> passwordHasher = new();
            User? authenticatedUser = await _userService.AuthenticateUser(user, passwordHasher);
            Assert.Null(authenticatedUser);
        }

        [Fact]
        public async void AuthenticateUser_ForExistingUser_ReturnsNotNull()
        {
            // This user does exist
            User user = new()
            {
                Id = "",
                UserName = "test",
                Password = "test",
                Email = "test",
                RefreshToken = "test",
                RefreshTokenExpiryTime = new DateTime(0),
            };

            PasswordHasher<User> passwordHasher = new();
            User? authenticatedUser = await _userService.AuthenticateUser(user, passwordHasher);
            Assert.NotNull(authenticatedUser);
        }

        [Fact]
        public async void GetByName_ForNonExistentUser_ReturnsNull()
        {
            // This user doesn't exist
            User user = new()
            {
                UserName = "",
            };

            User? userRecord = await _userService.GetByNameAsync(user.UserName);
            Assert.Null(userRecord);
        }

        [Fact]
        public async void GetByName_ForExistingUser_ReturnsNotNull()
        {
            // This user does exist
            User user = new()
            {
                UserName = "test",
            };

            User? userRecord = await _userService.GetByNameAsync(user.UserName);
            Assert.NotNull(userRecord);
        }

        [Fact]
        public async void CreateUser_ThenGetByName_ReturnsNotNull()
        {
            // Make a new user
            User newUser = new()
            {
                UserName = "new",
                Password = "new",
                Email = "new",
            };

            await _userService.CreateAsync(newUser);
            User? userRecord = await _userService.GetByNameAsync(newUser.UserName);
            Assert.NotNull(userRecord);
        }
    }
}
