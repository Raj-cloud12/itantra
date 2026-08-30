import com.k2fsa.sherpa.onnx.*
import android.content.res.AssetManager

fun test(assetManager: AssetManager) {
    val featConfig = FeatureConfig(sampleRate = 16000, featureDim = 80)
    val modelConfig = OnlineModelConfig(
        transducer = OnlineTransducerModelConfig(
            encoder = "sherpa/model.int8.onnx",
            decoder = "",
            joiner = ""
        ),
        tokens = "sherpa/tokens.txt",
        numThreads = 2,
        debug = false,
        provider = "cpu",
        modelType = "conformer"
    )
    val config = OnlineRecognizerConfig(
        featConfig = featConfig,
        modelConfig = modelConfig,
        enableEndpoint = true,
        rule1MinTrailingSilence = 2.4f,
        rule2MinTrailingSilence = 1.2f,
        rule3MinUtteranceLength = 300.0f
    )
    val recognizer = OnlineRecognizer(assetManager, config)
    val stream = recognizer.createStream()
    val samples = FloatArray(1600)
    stream.acceptWaveform(samples, 16000)
    while (recognizer.isReady(stream)) {
        recognizer.decode(stream)
    }
    val result = recognizer.getResult(stream)
    val text = result.text
}
