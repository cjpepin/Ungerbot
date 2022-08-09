using Backend.Models;
using Microsoft.AspNetCore.Identity;

namespace Backend.Services
{
    public interface IUserService
    {
        /// <summary>
        ///  Authenticates user's plain-text password with encrypted 
        ///  password in database using passwordHasher.
        /// </summary>
        /// <param name="user"></param>
        /// <param name="passwordHasher"></param>
        /// <returns> The record of the user in the database if successful, null otherwise. </returns>
        public Task<User?> AuthenticateUser(User? user, IPasswordHasher<User> passwordHasher);

        /// <summary>
        /// Compares userName with database records to find user with matching userName.
        /// </summary>
        /// <param name="userName"></param>
        /// <returns> The record of the user with matching userName if they exist, null otherwise. </returns>
        public Task<User?> GetByNameAsync(string userName);

        /// <summary>
        /// Compares email with database records to find user with matching email.
        /// </summary>
        /// <param name="userName"></param>
        /// <returns> The record of the user with matching email if they exist, null otherwise. </returns>
        public Task<User?> GetByEmailAsync(string email);
        /// <summary>
        /// Compares id with database records to find user with matching id.
        /// </summary>
        /// <param name="id"></param>
        /// <returns> The record of the user with matching id if they exist, null otherwise. </returns>
        public Task<User?> GetByIdAsync(string id);

        /// <summary>
        /// Asynchronously creates a new user.
        /// </summary>
        /// <param name="newUser"></param>
        /// <returns></returns>
        public Task CreateAsync(User newUser);

        /// <summary>
        /// Asynchronously updates an existing user.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="updatedUser"></param>
        /// <returns></returns>
        public Task UpdateAsync(string id, User updatedUser);
    }
}
