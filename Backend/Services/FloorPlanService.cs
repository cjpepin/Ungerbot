using MongoDB.Driver;
using Backend.Models;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Identity;
using MongoDB.Bson;
using System;
using System.Collections.Generic;

namespace Backend.Services
{
    public class FloorPlanService : IFloorPlanService
    {
        private readonly IMongoCollection<FloorPlan> _floorPlanCollection;

        public FloorPlanService(IOptions<DatabaseSettings> appDBContext)
        {
            MongoClient mongoClient = new(appDBContext.Value.ConnectionString);
            IMongoDatabase mongoDatabase = mongoClient.GetDatabase(appDBContext.Value.DatabaseName);
            _floorPlanCollection = mongoDatabase.GetCollection<FloorPlan>(appDBContext.Value.FloorPlanCollectionName);
        }
        // Constructor used for unit testing
        public FloorPlanService(DatabaseSettings appDBContext)
        {
            MongoClient mongoClient = new(appDBContext.ConnectionString);
            IMongoDatabase mongoDatabase = mongoClient.GetDatabase(appDBContext.DatabaseName);
            _floorPlanCollection = mongoDatabase.GetCollection<FloorPlan>(appDBContext.FloorPlanCollectionName);
        }

        public async Task<FloorPlan?> GetByIdAsync(string userId) =>
            await _floorPlanCollection.Find(x => x.UserId == userId).FirstOrDefaultAsync();
        public async Task CreateAsync(FloorPlan newUser) => 
            await _floorPlanCollection.InsertOneAsync(newUser);

        public async Task PushSceneAsync(string userId, string scene)
        {
            var floorPlanUpdate = Builders<FloorPlan>.Update.Push(doc => doc.Scenes, scene);
            await _floorPlanCollection.UpdateOneAsync(x => x.UserId == userId, floorPlanUpdate);
        }

        public async Task UpdateScene(string userId, string scene, int ind)
        {
            var filter = Builders<FloorPlan>.Filter.Where(x => x.UserId == userId);
            var update = Builders<FloorPlan>.Update.Set(x => x.Scenes[ind], scene);
            var result = _floorPlanCollection.UpdateOneAsync(filter, update).Result;
        }
    }
}
