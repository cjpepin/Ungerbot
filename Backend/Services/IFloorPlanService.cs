using Backend.Models;
using MongoDB.Driver;

namespace Backend.Services
{
    public interface IFloorPlanService
    {
        public Task<FloorPlan?> GetByIdAsync(string userId);
        public Task CreateAsync(FloorPlan newUser);
        public Task PushSceneAsync(string userId, string scene);
  /*      public Task UpdateAsync(string userId, FloorPlan scene);*/
        public Task UpdateScene(string userId, string scene, int ind);
    }
}

