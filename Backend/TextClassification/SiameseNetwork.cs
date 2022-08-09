using TorchSharp;
using static TorchSharp.torch;
using static TorchSharp.torch.nn;
using static TorchSharp.torch.nn.Module;
using static TorchSharp.torch.nn.functional;
using static TorchSharp.TensorExtensionMethods;

namespace Backend.TextClassification
{
    public class SiameseNetwork : Module
    {
        private TorchSharp.Modules.LSTM _commonLSTM;
        private TorchSharp.Modules.CosineSimilarity _cosineSimilarity;
        private TorchSharp.Modules.Linear _dense1;
        private TorchSharp.Modules.Linear _dense2;
        private TorchSharp.Modules.Dropout _dropout;

        public SiameseNetwork()
            : base(nameof(SiameseNetwork))
        {
            // 'Siamese' lstm to be used for both inputs
            _commonLSTM = LSTM(50, 42); // TODO: [NICK] modify the output here

            // Merge inputs with cosine similarity
            _cosineSimilarity = CosineSimilarity(dim: 2);

            // Dense layers
            _dense1 = Linear(20, 32);
            _dense2 = Linear(32, 1);

            // dropout
            _dropout = Dropout(probability: 0.01);

            // Allows for loss to step (I think?)
            RegisterComponents();
        }

        public override Tensor forward(Tensor input1, Tensor input2)
        {
            // Siamese LSTMs
            var vec1 = _commonLSTM.forward(input1.view(new long[] { input1.shape[0], -1, input1.shape[1] }));
            var vec2 = _commonLSTM.forward(input2.view(new long[] { input2.shape[0], -1, input2.shape[1] }));

            // Merge inputs using cosine similarity
            Tensor retv = _cosineSimilarity.forward(vec1.Item1, vec2.Item1).view(new long[] { 1, 20 });

            // Dense layer
            retv = _dense1.forward(retv);
            retv = _dropout.forward(retv);
            retv = _dense2.forward(retv);

            // Sigmoid activation
            retv = sigmoid(retv);

            return retv;
        }

    }
}
