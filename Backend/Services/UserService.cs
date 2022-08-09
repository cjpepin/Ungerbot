using MongoDB.Driver;
using Backend.Models;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Identity;

namespace Backend.Services
{
    public class UserService : IUserService
    {
        private readonly IMongoCollection<User> _userCollection;

        public UserService(IOptions<DatabaseSettings> appDBContext)
        {
            MongoClient mongoClient = new(appDBContext.Value.ConnectionString);
            IMongoDatabase mongoDatabase = mongoClient.GetDatabase(appDBContext.Value.DatabaseName);
            _userCollection = mongoDatabase.GetCollection<User>(appDBContext.Value.UserCollectionName);
        }

        // Constructor used for unit testing
        public UserService(DatabaseSettings appDBContext)
        {
            MongoClient mongoClient = new(appDBContext.ConnectionString);
            IMongoDatabase mongoDatabase = mongoClient.GetDatabase(appDBContext.DatabaseName);
            _userCollection = mongoDatabase.GetCollection<User>(appDBContext.UserCollectionName);
        }

        public async Task<User?> AuthenticateUser(User? user, IPasswordHasher<User> passwordHasher)
        {
            if (user is null)
                return null;

            User? userRecord = await GetByNameAsync(user.UserName);
            if (userRecord is null)
                return null;

            if (passwordHasher.VerifyHashedPassword(user, userRecord.Password, user.Password) == PasswordVerificationResult.Success)
            {
                return userRecord;
            }

            return null;
        }

        public async Task<User?> GetByNameAsync(string userName) =>
            await _userCollection.Find(x => x.UserName == userName).FirstOrDefaultAsync();
        public async Task<User?> GetByEmailAsync(string email) =>
            await _userCollection.Find(x => x.Email == email).FirstOrDefaultAsync();

        public async Task<User?> GetByIdAsync(string id) =>
            await _userCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(User newUser) =>
            await _userCollection.InsertOneAsync(newUser);

        public async Task UpdateAsync(string id, User updatedUser) =>
            await _userCollection.ReplaceOneAsync(x => x.Id == id, updatedUser);
    }
}
