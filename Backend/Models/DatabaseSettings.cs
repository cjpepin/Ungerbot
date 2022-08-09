namespace Backend.Models
{
    public class DatabaseSettings
    {
        public string ConnectionString { get; set; } = null!;
        public string DatabaseName { get; set; } = null!;
        public string MaddyDatabaseName { get; set; } = null!;
        public string UserCollectionName { get; set; } = null!;
        public string ConversationCollectionName { get; set; } = null!;
        public string ProductCollectionName { get; set; } = null!;
        public string AccountCollectionName { get; set; } = null!;
        public string ErrorCollectionName { get; set; } = null!;
        public string FloorPlanCollectionName { get; set; } = null!;
    }
}
