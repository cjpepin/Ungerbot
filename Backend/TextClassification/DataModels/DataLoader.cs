using TorchSharp;
using static TorchSharp.torch;

namespace Backend.TextClassification.DataModels
{
    public static class DataLoader
    {
        private static IEnumerable<FormattedInputData> LoadAndFormatDataToEnumerable(string filepath)
        {
            // Data objects to fill
            List<RawData> rawData = new();
            List<FormattedInputData> formattedData = new();

            if (File.Exists(filepath))
            {
                StreamReader reader = new(File.OpenRead(filepath));
                reader.ReadLine(); // Discard first line from file as it is just headers.

                // Read in the raw data
                while (!reader.EndOfStream)
                {
                    string[] line = reader.ReadLine().Split(',');
                    rawData.Add(new RawData(line[0], int.Parse(line[1])));
                }

                // Iterate through the raw data. Choose an input string and then compare it with all input strings below it.
                // This results in (number of distinct input strings) choose (number of distinct classifications) outputs.
                // If the classes of the two strings match, ClassMatches in FormattedInputData is true, otherwise false.
                for (int i = 0; i < rawData.Count - 1; i++)
                {
                    string chosenInputString = rawData[i].InputString;
                    int chosenClassification = rawData[i].Classification;

                    for (int j = i + 1; j < rawData.Count; j++)
                    {
                        RawData dataAtJ = rawData[j];
                        formattedData.Add(new()
                        {
                            String1 = chosenInputString,
                            String2 = dataAtJ.InputString,
                            ClassMatches = chosenClassification == dataAtJ.Classification ? 1 : 0
                        });
                    }
                }
            }
            else
            {
                throw new FileNotFoundException($"Data file not found at {filepath}!");
            }

            return formattedData;
        }

        public static IEnumerable<(Tensor, Tensor, Tensor)> Load(string filepath, Glove glove)
        {
            // Data struct to fill
            List<(Tensor, Tensor, Tensor)> dataToReturn = new();

            // Load data into enumerable
            IEnumerable<FormattedInputData> formattedData = LoadAndFormatDataToEnumerable(filepath);
            foreach (var item in formattedData)
            {
                Tensor input1 = glove.SentenceToWordEmbeddingTensor(item.String1);
                Tensor input2 = glove.SentenceToWordEmbeddingTensor(item.String2);
                Tensor target = from_array(new float[] { item.ClassMatches }).view(new long[] { 1, 1 });

                dataToReturn.Add((input1, input2, target));
            }

            return dataToReturn;
        }
    }
}
