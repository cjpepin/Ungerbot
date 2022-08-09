namespace Backend.TextClassification.DataModels
{
    public class RawData
    {
        public string InputString { get; set; }
        public int Classification { get; set; }

        public RawData(string inputString, int classification)
        {
            InputString = inputString;
            Classification = classification;
        }
    }
}
