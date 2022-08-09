using TorchSharp;
using static TorchSharp.torch;
using static TorchSharp.torch.nn.functional;
using static TorchSharp.TensorExtensionMethods;
using Backend.TextClassification.DataModels;

namespace Backend.TextClassification
{
    public class TextClassifier
    {
        const float PERCENT_NEEDED_FOR_SUCCESS = 0.66f; // Between (0, 1)
        private readonly Glove _glove;
        private readonly SiameseNetwork _model;
        private readonly Loss _lossCriterion;
        private readonly TorchSharp.Modules.Adam _optimizer;
        private readonly IEnumerable<(Tensor, Tensor, Tensor)> _trainData;
        private readonly IEnumerable<(Tensor, Tensor, Tensor)> _testData;
        private readonly IDictionary<int, string> _classificationAnchors;
        private readonly Device _device;

        public TextClassifier(string? modelFilepath = null, string gloveFilepath = "./TextClassification/Data/glove.6B.50d.txt", 
            string dataFilepath = "./TextClassification/Data/inputData.csv", Device? device = null, float trainTestSplitPercentage = 0.8f)
        {
            _device = (device is null) ? CPU : device;
            _glove = new Glove(gloveFilepath);
            _model = new SiameseNetwork();
            _model.to(_device);
            _lossCriterion = binary_cross_entropy_loss();
            _optimizer = optim.Adam(_model.parameters());

            // If a saved model filepath is specified, load it.
            if (modelFilepath is not null)
            {
                Console.WriteLine($"Loading model from {modelFilepath}...");
                _model.load(modelFilepath);
            }

            // Load data from file
            var data = DataLoader.Load(dataFilepath, _glove);

            // Shuffle data
            Random rng = new();
            data = data.OrderBy(a => rng.Next()).ToList();

            // Split into train/test
            int splitIndex = (int)(data.Count() * trainTestSplitPercentage);
            _trainData = data.Take(splitIndex);
            _testData = data.Skip(splitIndex);
            Console.WriteLine($"train size: {_trainData.Count()}, test size: {_testData.Count()}");

            // Load classification anchors
            _classificationAnchors = LoadClassificationAnchors();

            // Collect garbage
            GC.Collect();
        }

        public void Train(int epochs, string? directoryToSaveTo = null)
        {
            Console.WriteLine("Beginning Training.");

            // Keep track of lowest average loss during testing
            float lowestTestLoss = float.MaxValue;

            // Create model save directory if specified
            if (directoryToSaveTo is not null)
            {
                Directory.CreateDirectory(directoryToSaveTo);
            }

            // Train for number of epochs
            for (int epoch = 0; epoch < epochs; epoch++)
            {
                _model.train(); // Put model into training mode
                float avgLoss = TrainOneEpoch();
                Console.WriteLine($"Epoch: {epoch}, avgLoss: {avgLoss}");

                // Test model after each epoch. Save if the loss has dropped.
                float avgTestLoss = Test();
                if (directoryToSaveTo is not null && avgTestLoss < lowestTestLoss)
                {
                    lowestTestLoss = avgTestLoss;
                    string thisModelFilepath = @$"{directoryToSaveTo}\model_{epoch}.dat";
                    Console.WriteLine($"Saving model to {thisModelFilepath}...");
                    _model.save(thisModelFilepath);
                }

                GC.Collect();
            }

            Console.WriteLine("Finished Training.");
            GC.Collect();
        }

        private float TrainOneEpoch()
        {
            float totalLoss = 0.0f;
            foreach (var dataItem in _trainData)
            {
                Tensor input1 = dataItem.Item1.to(_device);
                Tensor input2 = dataItem.Item2.to(_device);
                Tensor target = dataItem.Item3.to(_device);

                // Zero all parameter's gradients
                _optimizer.zero_grad();

                // forward + backward + optimize
                Tensor output = _model.forward(input1, input2).to(_device);
                Tensor loss = _lossCriterion(output, target).to(_device);
                loss.backward();
                _optimizer.step();

                // Keep track of total loss for this epoch
                totalLoss += loss.to(CPU).item<float>();
            }
            return (totalLoss / _trainData.Count());
        }

        public float Test()
        {
            _model.eval();

            float totalLoss = 0.0f;
            int numCorrect = 0;

            foreach (var dataItem in _testData)
            {
                Tensor input1 = dataItem.Item1.to(_device);
                Tensor input2 = dataItem.Item2.to(_device);
                Tensor target = dataItem.Item3.to(_device);

                Tensor output = _model.forward(input1, input2).to(_device);
                Tensor loss = _lossCriterion(output, target).to(_device);
                totalLoss += loss.to(CPU).ToSingle();

                float pred = output.to(CPU).ToSingle();
                numCorrect += ((int)(pred + (1 - PERCENT_NEEDED_FOR_SUCCESS)) == target.ToInt32()) ? 1 : 0;

            }
            GC.Collect();

            // Print results
            Console.WriteLine($"Testing: Average loss: {totalLoss / _testData.Count() } | Accuracy: { (float)numCorrect / _testData.Count() * 100 }%");

            return (totalLoss / _testData.Count());
        }

        // Loads the classification anchors. This is what the model bases sentence classification off of. All classification anchors should
        // be in the training/testing dataset.
        public static IDictionary<int, string> LoadClassificationAnchors()
        {
            Dictionary<int, string> retv = new()
            {
                { 0, "Recommend me a product." },
                { 1, "What products do you have?" },
                { 2, "What can you do?" },
                { 3, "Hello" },
                { 4, "Goodbye" },
                { 5, "Thank you for helping." },
            };
            return retv;
        }

        public int GetClassification(string inputString)
        {
            Tensor userInputVector = _glove.SentenceToWordEmbeddingTensor(inputString).to(_device);
            int highestScoredClassification = -1;
            float highestScore = 0.0f;

            foreach (var pair in _classificationAnchors)
            {
                // Prepare input
                int classification = pair.Key;
                string sentence = pair.Value;
                Tensor inputAnchor = _glove.SentenceToWordEmbeddingTensor(sentence).to(_device);

                // Get result from model
                Tensor output = _model.forward(userInputVector, inputAnchor).to(_device);
                float result = output.ToSingle();
                Console.WriteLine(result);

                // If the model thinks the input string is similar enough to the anchor, return this classification
                if (result > PERCENT_NEEDED_FOR_SUCCESS && result > highestScore)
                {
                    highestScore = result;
                    highestScoredClassification = classification;
                }
            }

            // If the input string doesn't match any anchors, return -1 to indicate that the input string is garbage.
            return highestScoredClassification;
        }
    }
}
