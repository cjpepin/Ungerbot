using Backend.Models;
using Microsoft.AspNetCore.Identity;
using MongoDB.Driver;
using System.Runtime.CompilerServices;

namespace TestProjects.BackendTests
{
    public class DatabaseFixture
    {
        public DatabaseSettings DBSettings { get; private set; }
        private readonly MongoClient _mongoClient;

        public DatabaseFixture()
        {
            DBSettings = new()
            {
                ConnectionString = "mongodb://localhost:27018",
                DatabaseName = "test",
                UserCollectionName = "User"
            };

            _mongoClient = new(DBSettings.ConnectionString);

            InitDummyDatabase();
        }

        private void InitDummyDatabase()
        {
            _mongoClient.DropDatabase(DBSettings.DatabaseName);
            IMongoDatabase mongoDatabase = _mongoClient.GetDatabase(DBSettings.DatabaseName);
            IMongoCollection<User> userCollection = mongoDatabase.GetCollection<User>(DBSettings.UserCollectionName);

            // Insert existing 'test' user
            PasswordHasher<User> passwordHasher = new();
            User user = new()
            {
                Id = "",
                UserName = "test",
                Password = "test",
                Email = "test",
                RefreshToken = "test",
                RefreshTokenExpiryTime = new DateTime(0),
            };
            user.Password = passwordHasher.HashPassword(user, user.Password);
            userCollection.InsertOne(user);
        }

        private static string GetPathToProject([CallerFilePath] string? callerFilePath = null)
        {
            callerFilePath ??= "";
            return callerFilePath;
        }
    }
}
