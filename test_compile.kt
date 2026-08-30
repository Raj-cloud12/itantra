package test

import com.k2fsa.sherpa.onnx.*

fun test() {
    val featConfig = FeatureConfig(sampleRate = 16000, featureDim = 80)
    val modelConfig = OfflineModelConfig(
        nemoCtc = OfflineNemoEncDecCtcModelConfig(
            model = "sherpa/model.int8.onnx"
        ),
        tokens = "sherpa/tokens.txt",
        numThreads = 2,
        debug = false,
        provider = "cpu"
    )
    val config = OfflineRecognizerConfig(
        featConfig = featConfig,
        modelConfig = modelConfig
    )

    val r = OfflineRecognizer(config = config)
    val s = r.createStream()
    val f = FloatArray(16000)
    s.acceptWaveform(f, 16000)
    r.decode(s)
    val res: OfflineRecognizerResult = r.getResult(s)
    val txt = res.text
}
