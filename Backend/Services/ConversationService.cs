using MongoDB.Driver;
using Microsoft.Extensions.Options;
using Backend.Models;

namespace Backend.Services
{
    public class ConversationService : IConversationService
    {
        private readonly IMongoCollection<Conversation> _conversationCollection;

        public ConversationService(IOptions<DatabaseSettings> appDBContext)
        {
            MongoClient mongoClient = new(appDBContext.Value.ConnectionString);
            IMongoDatabase mongoDatabase = mongoClient.GetDatabase(appDBContext.Value.DatabaseName);
            _conversationCollection = mongoDatabase.GetCollection<Conversation>(appDBContext.Value.ConversationCollectionName);
        }

        public async Task<Conversation?> GetByIdAsync(string id) =>
            await _conversationCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(Conversation newConversation) =>
            await _conversationCollection.InsertOneAsync(newConversation);

        public async Task StoreConversation(Conversation conversation)
        {
            await _conversationCollection.InsertOneAsync(conversation);
        }

        public void PushMessage(string conversationId, Message message)
        {
            var conversationUpdate = Builders<Conversation>.Update.Push(doc => doc.Messages, message);
            _conversationCollection.UpdateOne(x => x.Id == conversationId, conversationUpdate);
        }

        public async Task PushMessageAsync(string conversationId, Message message)
        {
            var conversationUpdate = Builders<Conversation>.Update.Push(doc => doc.Messages, message);
            await _conversationCollection.UpdateOneAsync(x => x.Id == conversationId, conversationUpdate);
        }

        public async Task<List<Conversation>?> GetAllByIdAsync(string id) =>
            await _conversationCollection.Find(x => x.UserId == id).ToListAsync();
    }
}
