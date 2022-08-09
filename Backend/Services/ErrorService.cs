using MongoDB.Driver;
using Backend.Models;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Identity;
using MongoDB.Bson;
using System;
using System.Collections.Generic;

namespace Backend.Services
{
    public class ErrorService : IErrorService
    {
        private readonly IMongoCollection<Error> _errorCollection;

        public ErrorService(IOptions<DatabaseSettings> appDBContext)
        {
            MongoClient mongoClient = new(appDBContext.Value.ConnectionString);
            IMongoDatabase mongoDatabase = mongoClient.GetDatabase(appDBContext.Value.DatabaseName);
            _errorCollection = mongoDatabase.GetCollection<Error>(appDBContext.Value.ErrorCollectionName);
        }
        // Constructor used for unit testing
        public ErrorService(DatabaseSettings appDBContext)
        {
            MongoClient mongoClient = new(appDBContext.ConnectionString);
            IMongoDatabase mongoDatabase = mongoClient.GetDatabase(appDBContext.DatabaseName);
            _errorCollection= mongoDatabase.GetCollection<Error>(appDBContext.ErrorCollectionName);
        }

        public async Task<Error?> GetByIdAsync(string id) =>
            await _errorCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task<List<Error>?> GetAllAsync() =>
            await _errorCollection.Find(Builders<Error>.Filter.Empty).ToListAsync();

        public async Task CreateAsync(Error newError) =>
            await _errorCollection.InsertOneAsync(newError);

        public async Task StoreError(Error error) =>
            await _errorCollection.InsertOneAsync(error);
        public async Task DeleteError(string id) =>
            await _errorCollection.FindOneAndDeleteAsync(x => x.Id == id);
    }
}
