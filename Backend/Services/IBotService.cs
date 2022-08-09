using Backend.TextClassification;

namespace Backend.Services
{
    public interface IBotService
    {
        public Task<List<string>> GetResponse(string message, TextClassifier classifier, string? targetAcctID = null);

        public List<string> GetGeneralProducts();

        public List<string> GetSimilarProducts(string associatedUserId);
    }
}
