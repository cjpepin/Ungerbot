
using Backend.Models;

namespace Backend.Services
{
    public interface IErrorService
    {
        public Task<Error?> GetByIdAsync(string id);
        public Task<List<Error>?> GetAllAsync();
        public Task CreateAsync(Error newError);

        public Task StoreError(Error error);
        public Task DeleteError(string id);
    }
}
