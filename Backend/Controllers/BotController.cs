using Backend.Services;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using MongoDB.Bson;
using Backend.TextClassification;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BotController : ControllerBase
    {
        private readonly IBotService _botService;
        private readonly IUserService _userService;
        private readonly IConversationService _conversationService;
        private readonly TextClassifier _textClassifier;

        public BotController(IBotService botService, IUserService userService, IConversationService conversationService, TextClassifier textClassifier)
        {
            _botService = botService;
            _userService = userService;
            _conversationService = conversationService;
            _textClassifier = textClassifier;
        }

        [HttpGet("start-conversation")]
        public async Task<IActionResult> StartConversation([FromQuery] string username)
        {
            User? user = await _userService.GetByNameAsync(username);
            if (user is null) return NotFound($"No user with username: {username} found.");
            string timeStamp = $"{DateTime.Now}";
            // Create new conversation in database.
            string userId = user.Id;
            Conversation conversation = new(userId, timeStamp);
            await _conversationService.CreateAsync(conversation);

            // Return conversation id. This must be kept track of in frontend.
            return Ok(conversation.Id);
        }

        [HttpGet("get-all-conversations")]
        public async Task<IActionResult> GetAllConversations([FromQuery] string username)
        {
            User? user = await _userService.GetByNameAsync(username);
            if (user is null) return NotFound($"No user with username: {username} found.");

            // Create new conversation in database.
            string userId = user.Id;
            Console.WriteLine(userId);

            var conversations = await _conversationService.GetAllByIdAsync(userId);

            // Return conversation all convos
            return Ok(conversations);
        }

        [HttpPost("get-response")]
        public async Task<IActionResult> GetResponse([FromBody] JObject jsonBody)
        {
            // Check for bad json body
            if (jsonBody is null || !jsonBody.ContainsKey("body") || jsonBody["body"] is null)
            {
                return BadRequest("Bad json body");
            }

            // Extract data from json body and sanitize newlines that come over
            JToken? tokens = jsonBody["body"];
            string conversationId = (tokens!["conversationId"] ?? "").ToString().Replace("\n", ""); ;
            string username = (tokens["username"] ?? "").ToString().Replace("\n", ""); ;
            string promptFromUser = (tokens["promptFromUser"] ?? "").ToString().Replace("\n", ""); ;

            //If the message is empty, no point in adding it to db
            if(promptFromUser.Length < 1)
            {
                return Ok();
            }

            // Make sure we have a valid user
            User? user = await _userService.GetByNameAsync(username);
            if (user is null) return NotFound($"Username: {username} not found.");

            // Make sure we have a valid conversation id
            if (!ObjectId.TryParse(conversationId, out _))
            {
                return BadRequest($"ConversationId: {conversationId} is not a valid 24-digit hex string.");
            }

            // See if the conversation exists
            Conversation? conversation = await _conversationService.GetByIdAsync(conversationId);
            if (conversation is null) return NotFound($"ConversationId: {conversationId} not found.");

            // Create the message from the user
            Message messageFromUser = new(promptFromUser, true);

            // Get response from bot
            List<string> responses = await _botService.GetResponse(promptFromUser, _textClassifier, user.AssociatedUserId);
            List<Message> responsesFromBot = new();
            foreach (string resp in responses)
            {
                responsesFromBot.Add(new Message(resp, false));
            }

            // Store message and response in database
            await _conversationService.PushMessageAsync(conversationId, messageFromUser);
            foreach (Message msg in responsesFromBot)
            {
                _conversationService.PushMessage(conversationId, msg); // Don't do these asynchronously. We must maintain ordering.
            }

            foreach (string str in responses)
            {
                Console.WriteLine(str);
            }

            return Ok(responses);
        }

        [HttpPost("recommend-service")]
        public async Task<IActionResult> RecommendService([FromBody] JObject jsonBody)
        {
            // Check for bad json body
            if (jsonBody is null || !jsonBody.ContainsKey("body") || jsonBody["body"] is null)
            {
                return BadRequest("Bad json body");
            }

            // Extract data from json body and sanitize newlines that come over
            JToken? tokens = jsonBody["body"];
            string username = (tokens!["username"] ?? "").ToString().Replace("\n", ""); ;
            // Check for valid username input
            User? user = await _userService.GetByNameAsync(username);
            if (user is null)
            {
                return NotFound("User not found!");
            }

            // If there is no AssociatedUserId, we have no user data. Use default: Recommend most purchased product or whatever
            if (user.AssociatedUserId is null)
            {
                // TODO: [MADDY] - Recommend Most purchased product
                var nullRetv = "Default return value!";
                return Ok(nullRetv);
            }

            // TODO: [MADDY] - Use AssociatedUserId to make your API calls
            var retv = "Making API calls!";

            return Ok(retv);
        }

        [HttpPost("most-popular-products")]
        public async Task<IActionResult> RecommendMostPopularProducts([FromBody] JObject jsonBody)
        {
            // Check for bad json body
            if (jsonBody is null || !jsonBody.ContainsKey("body") || jsonBody["body"] is null)
            {
                return BadRequest("Bad json body");
            }

            // Extract data from json body and sanitize newlines that come over
            JToken? tokens = jsonBody["body"];
            string username = (tokens!["username"] ?? "").ToString().Replace("\n", ""); ;
            // Check for valid username input
            User? user = await _userService.GetByNameAsync(username);
            if (user is null)
            {
                return NotFound("User not found!");
            }

            List<string> response = new();
            response = _botService.GetGeneralProducts().Take(3).ToList();

            return Ok(response);
        }

        [HttpPost("similar-products")]
        public async Task<IActionResult> RecommendSimilarProducts([FromBody] JObject jsonBody)
        {
            // Check for bad json body
            if (jsonBody is null || !jsonBody.ContainsKey("body") || jsonBody["body"] is null)
            {
                return BadRequest("Bad json body");
            }

            // Extract data from json body and sanitize newlines that come over
            JToken? tokens = jsonBody["body"];
            string username = (tokens!["username"] ?? "").ToString().Replace("\n", ""); ;
            // Check for valid username input
            User? user = await _userService.GetByNameAsync(username);
            if (user is null)
            {
                return NotFound("User not found!");
            }

            List<string> response = _botService.GetSimilarProducts(user.AssociatedUserId);
            return Ok(response);
        }

        [HttpPost("associated-products")]
        public async Task<IActionResult> RecommendAssociatedProducts([FromBody] JObject jsonBody)
        {
            return Ok(new List<string>() { "" });
        }
    }
}
