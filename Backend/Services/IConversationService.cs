using Backend.Models;

namespace Backend.Services
{
    public interface IConversationService
    {
        public Task<Conversation?> GetByIdAsync(string id);

        public Task CreateAsync(Conversation newConversation);

        public Task StoreConversation(Conversation conversation);

        public void PushMessage(string conversationId, Message message);

        public Task PushMessageAsync(string conversationId, Message message);

        public Task<List<Conversation>?> GetAllByIdAsync(string id);
    }
}
