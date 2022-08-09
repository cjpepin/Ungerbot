using static TorchSharp.torch;

namespace Backend.TextClassification
{
    public class Glove
    {
        // Consts
        public const int MAX_SEQUENCE_LEN = 20;
        public const int WORD_VECTOR_SIZE = 50;
        
        private readonly IList<string> _words;
        private readonly IDictionary<string, int> _word2idx;
        private readonly IList<float[]> _vectors;
        private readonly int _vectorSize;

        public Glove(string filepath)
        {
            _words = new List<string>();
            _word2idx = new Dictionary<string, int>();
            _vectors = new List<float[]>();

            // Read in the glove file
            if (File.Exists(filepath))
            {
                using (StreamReader reader = new(File.OpenRead(filepath)))
                {
                    int idx = 0;
                    int lineCount = File.ReadLines(filepath).Count();

                    while (!reader.EndOfStream)
                    {
                        string[] line = reader.ReadLine().Split(' ');
                        string word = line[0];
                        _words.Add(word);
                        _word2idx[word] = idx;
                        float[] floatVec = line
                            .Skip(1)
                            .Select(x => Convert.ToSingle(x))
                            .ToArray();
                        _vectors.Add(floatVec);
                        
                        idx++;
                    }

                    _vectorSize = _vectors[0].Length;
                }
            }
        }

        // Tokenize a sentence
        private static string[] Tokenize(string sentence)
        {
            // Make everything lowercase
            string lowerSentence = sentence.ToLower();

            // TODO: [NICK] DO more work on converting contractions correctly!
            string strippedSentence = lowerSentence.Replace(",", " ,")
                .Replace(".", " .")
                .Replace("!", " !")
                .Replace("?", " ?")
                .Replace("'t", " not")
                .Replace("'m", " am")
                .Replace("'s", " is")
                .Trim();

            // Split into separate tokens
            string[] retv = strippedSentence.Split(new char[] { ' ' });
            return retv;
        }

        // Create and return word embedding layer for use in a TorchSharp network
        public Tensor SentenceToWordEmbeddingTensor(string sentence)
        {
            string[] tokens = Tokenize(sentence);
            float[,] wordEmbeddingArray = new float[MAX_SEQUENCE_LEN, _vectorSize];

            // Load the word embedding vectors into the array for each token.
            int i;
            for (i = 0; i < tokens.Length && i < MAX_SEQUENCE_LEN-1; i++)
            {
                float[] thisTokenEmbedding = this[tokens[i]]; // Access the GloVe dictionary
                for (int j = 0; j < thisTokenEmbedding.Length; j++)
                {
                    wordEmbeddingArray[i, j] = thisTokenEmbedding[j];
                }
            }

            // Fill the rest of the array with vectors of zeroes.
            while(i < MAX_SEQUENCE_LEN)
            {
                for (int j = 0; j < _vectorSize; j++)
                {
                    wordEmbeddingArray[i, j] = 0;
                }
                i++;
            }

            // Make a tensor from the 2d array
            Tensor wordEmbeddings = from_array(wordEmbeddingArray);
            return wordEmbeddings;
        }

        // Dictionary accessor operator overload
        public float[] this[string word]
        {
            get
            {
                try
                {
                    int idx = _word2idx[word];
                    return _vectors[idx];
                }
                catch (KeyNotFoundException _)
                {
                    // If the word was not found, generate a random vector with values in the range (-1, 1).
                    // Console.WriteLine($"Exception caught: {e}! Word not found: {word}.");
                    float[] randVec = new float[WORD_VECTOR_SIZE];
                    Random rand = new();
                    for (int i = 0; i < randVec.Length; i++)
                    {
                        randVec[i] = (float)(rand.NextDouble() * 2 - 1);
                    }
                    return randVec;
                }
            }
        }
    }
}
