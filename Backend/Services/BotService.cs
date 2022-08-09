// Import all bot dependencies
using Backend.TextClassification;
using Backend.TheBrain;
using MongoDB.Driver;
using Backend.Models;
using Microsoft.Extensions.Options;

namespace Backend.Services
{
    public class BotService : IBotService
    {
        private readonly IMongoCollection<Account> _accountCollection;
        private readonly IMongoCollection<Product> _productCollection; 
        public BotService(IOptions<DatabaseSettings> appDBContext)
        {
            MongoClient mongoClient = new(appDBContext.Value.ConnectionString);
            IMongoDatabase maddyDatabase = mongoClient.GetDatabase(appDBContext.Value.MaddyDatabaseName);
            _accountCollection = maddyDatabase.GetCollection<Account>(appDBContext.Value.AccountCollectionName);
            _productCollection = maddyDatabase.GetCollection<Product>(appDBContext.Value.ProductCollectionName);
        }

        public List<string> GetGeneralProducts()
        {
            List<string> response = new();
            List<Product> returned_prod = _productCollection.Find(_ => true).ToList();
            foreach(Product prod in returned_prod)
            {
                response.Add(prod.Description);
            }

            return response;
        }

        public List<string> GetSimilarProducts(string associatedUserId)
        {
            Account? foundAccount = _accountCollection.Find(a => a.AcctID == associatedUserId).FirstOrDefault();
            if (foundAccount is null)
            { 
                return new List<string>() { "Redbull" };
            }

            List<Product> products = foundAccount.ProdsGivenSimilarAcct.Take(3).ToList();

            if (products.Count == 0)
            {
                return new List<string>() { "Redbull" };
            }

            List<string> response = new();

            foreach(Product prod in products)
            {
                response.Add(prod.Description);
            }

            return response;
        }

        public async Task<List<string>> GetResponse(string message, TextClassifier classifier, string? targetAcctID = null)
        {
            var result = classifier.GetClassification(message);
            
            // Repsond based on classification
            List<string> response = new();
            switch (result)
            {
                case 0:
                    if(targetAcctID != null)
                    {
                        //return most popular product. targetAcctID == null -> overall. == AcctID -> based on account 
                        Account? foundAccount = await _accountCollection.Find(a => a.AcctID == targetAcctID).FirstOrDefaultAsync();
                        Console.WriteLine($"TargetAccID: {targetAcctID}\nFound account: {foundAccount}");

                        if (foundAccount is null)
                        {
                            Product? prod = await _productCollection.Find(_ => true).FirstOrDefaultAsync();
                            if (prod is not null)
                                response.Add(prod.Description);
                        }
                        else
                        {
                            //list of type products. it is sorted by frequency and will return the best selling product. 
                            if (foundAccount.PopProds.Count >= 1)
                            {
                                response.Add(foundAccount.PopProds[0].Description);
                            }
                        }
                    }
                    else
                    {
                        //return overall best seller 
                        List<Product> returned_prod = _productCollection.Find(_ => true).Limit(1).ToList();
                        foreach(Product product in returned_prod)
                            response.Add(product.Description);
                    }

                    break;
                case 1:
                    if(targetAcctID != null)
                    {
                        //return top 3 most popular products. targetAcctID == null -> overall. == AcctID -> based on account .
                        Account? multiFoundAccount = await _accountCollection.Find(a => a.AcctID == targetAcctID).FirstOrDefaultAsync();
                        if (multiFoundAccount is null)
                        {
                            Product? prod = await _productCollection.Find(_ => true).FirstOrDefaultAsync();
                            if (prod is not null)
                                response.Add(prod.Description);
                        }
                        else
                        {
                            foreach (Product prod in multiFoundAccount.PopProds)
                            {
                                response.Add(prod.Description);
                            }
                        }
                    }
                    else
                    {
                        List<Product> returned_prods = _productCollection.Find(_ => true).Limit(3).ToList();
                        //return top 3 overall best sellers 
                        foreach(Product product in returned_prods)
                        {
                            response.Add(product.Description);
                        }
                    }
                    break;
                case 2:
                    response = new List<string>() { "Ask me to recommend you a product, or ask about what products we can offer you." };
                    break;
                case 3:
                    response = new List<string>() { "Hello!" };
                    break;
                case 4:
                    response = new List<string>() { "Goodbye!" };
                    break;
                case 5:
                    response = new List<string>() { "You're welcome." };
                    break;
                default:
                    response = new List<string>() { "Sorry, I can't do that." };
                    break;
            }

            // Final check. If the response is empty, add some redbull!
            if (response.Count == 0)
            {
                response.Add("Redbull");
            }

            return response;
        }
    }
}
