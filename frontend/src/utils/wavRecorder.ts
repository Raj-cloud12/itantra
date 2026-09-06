// Studio-Grade High-Fidelity Audio Recorder for Android & Web
// Produces 100% standard 16kHz RIFF/WAVE PCM (Compatible with Sherpa ONNX, AI4Bharat, & Android)

export class UniversalWavRecorder {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private inputNode: MediaStreamAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private pcmChunks: Float32Array[] = [];
  private nativeSampleRate = 16000;
  private recording = false;
  private isInitialized = false;

  // 250ms circular pre-roll buffer to prevent losing the start of words
  private preRollBuffer: Float32Array[] = [];
  private readonly MAX_PREROLL_CHUNKS = 4;

  /**
   * Pre-warms the microphone hardware ahead of time.
   * Eliminates the 1.5-2.0 second OS audio driver initialization latency.
   */
  async prewarm(): Promise<void> {
    if (this.isInitialized && this.mediaStream?.active) return;

    try {
      // 1. Request Pristine Microphone Stream with Hardware Echo & Noise Cancellation
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        },
        video: false
      });

      // 2. High-Fidelity 16kHz PCM AudioContext
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      try {
        this.audioContext = new AudioContextClass({ sampleRate: 16000 });
      } catch {
        this.audioContext = new AudioContextClass();
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.nativeSampleRate = this.audioContext.sampleRate || 16000;
      this.inputNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);

      // Mute gain node so microphone audio NEVER plays into speaker while recording
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 0.0;

      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const chunk = new Float32Array(inputData);

        if (this.recording) {
          this.pcmChunks.push(chunk);
        } else {
          // Keep rolling pre-roll history while idle
          this.preRollBuffer.push(chunk);
          if (this.preRollBuffer.length > this.MAX_PREROLL_CHUNKS) {
            this.preRollBuffer.shift();
          }
        }
      };

      this.inputNode.connect(this.processor);
      this.processor.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
      this.isInitialized = true;
    } catch (e) {
      console.warn('UniversalWavRecorder prewarm error:', e);
    }
  }

  async start(): Promise<void> {
    if (!this.isInitialized || !this.mediaStream?.active) {
      await this.prewarm();
    } else if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.pcmChunks = [];
    // Inject pre-roll buffer (last ~250ms) so first word ("வணக்கம்", "நான்") is never clipped
    if (this.preRollBuffer.length > 0) {
      this.pcmChunks.push(...this.preRollBuffer);
      this.preRollBuffer = [];
    }

    this.recording = true;
  }

  async stop(): Promise<{ blob: Blob; base64: string; size: number }> {
    this.recording = false;

    let totalLength = 0;
    for (const chunk of this.pcmChunks) {
      totalLength += chunk.length;
    }

    if (totalLength === 0) {
      const emptyBlob = this.encodeWAV(new Float32Array(0), this.nativeSampleRate);
      return { blob: emptyBlob, base64: '', size: 0 };
    }

    const mergedPcm = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of this.pcmChunks) {
      mergedPcm.set(chunk, offset);
      offset += chunk.length;
    }
    this.pcmChunks = [];

    // === ACOUSTIC CONDITIONING & NOISE CANCELLATION ===
    // 1. High-Pass Filter (85Hz Cutoff) to remove handling rumble, DC bias, and sub-bass ambient noise
    const filtered = new Float32Array(mergedPcm.length);
    let prevX = 0;
    let prevY = 0;
    const rc = 1.0 / (2.0 * Math.PI * 85.0);
    const dt = 1.0 / this.nativeSampleRate;
    const alpha = rc / (rc + dt);
    for (let i = 0; i < mergedPcm.length; i++) {
      const x = mergedPcm[i];
      const y = alpha * (prevY + x - prevX);
      filtered[i] = y;
      prevX = x;
      prevY = y;
    }

    // 2. Soft Noise Gate: Attenuate low-level stationary background hiss
    const noiseGateThreshold = 0.003;
    for (let i = 0; i < filtered.length; i++) {
      const val = filtered[i];
      if (Math.abs(val) < noiseGateThreshold) {
        filtered[i] = val * 0.2;
      }
    }

    // 3. Dynamic Peak Normalization (Boost speech clarity up to 0.92 for Sherpa ONNX)
    let maxPeak = 0.0001;
    for (let i = 0; i < filtered.length; i++) {
      const absVal = Math.abs(filtered[i]);
      if (absVal > maxPeak) maxPeak = absVal;
    }
    const gain = Math.min(12.0, Math.max(1.0, 0.92 / maxPeak));
    for (let i = 0; i < filtered.length; i++) {
      filtered[i] = Math.max(-1.0, Math.min(1.0, filtered[i] * gain));
    }

    // 4. Voice Activity Trimming with generous 250ms margins so soft Tamil phonemes are never cut
    let startIndex = 0;
    let endIndex = filtered.length - 1;
    const voiceThreshold = 0.006;
    while (startIndex < filtered.length && Math.abs(filtered[startIndex]) < voiceThreshold) {
      startIndex++;
    }
    while (endIndex > startIndex && Math.abs(filtered[endIndex]) < voiceThreshold) {
      endIndex--;
    }
    const safetyMargin = Math.floor(this.nativeSampleRate * 0.25);
    startIndex = Math.max(0, startIndex - safetyMargin);
    endIndex = Math.min(filtered.length, endIndex + safetyMargin);
    const cleanSamples = (endIndex > startIndex + 800) ? filtered.subarray(startIndex, endIndex) : filtered;

    const wavBlob = this.encodeWAV(cleanSamples, this.nativeSampleRate);
    const base64 = await this.blobToBase64(wavBlob);

    return {
      blob: wavBlob,
      base64,
      size: wavBlob.size
    };
  }

  destroy(): void {
    this.recording = false;
    this.isInitialized = false;
    if (this.processor) {
      try { this.processor.disconnect(); } catch {}
      this.processor = null;
    }
    if (this.gainNode) {
      try { this.gainNode.disconnect(); } catch {}
      this.gainNode = null;
    }
    if (this.inputNode) {
      try { this.inputNode.disconnect(); } catch {}
      this.inputNode = null;
    }
    if (this.audioContext) {
      try { this.audioContext.close(); } catch {}
      this.audioContext = null;
    }
    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach((track) => track.stop());
      } catch {}
      this.mediaStream = null;
    }
    this.pcmChunks = [];
    this.preRollBuffer = [];
  }

  private encodeWAV(samples: Float32Array, sampleRate: number): Blob {
    let finalSamples = samples;
    let finalSampleRate = sampleRate;

    // Guaranteed 16kHz resampling for on-device Sherpa ONNX Whisper model
    if (sampleRate !== 16000 && sampleRate > 0 && samples.length > 0) {
      const ratio = sampleRate / 16000;
      const newLen = Math.max(1, Math.floor(samples.length / ratio));
      const resampled = new Float32Array(newLen);
      for (let i = 0; i < newLen; i++) {
        const srcIdx = i * ratio;
        const idx0 = Math.floor(srcIdx);
        const idx1 = Math.min(idx0 + 1, samples.length - 1);
        const frac = srcIdx - idx0;
        resampled[i] = samples[idx0] * (1 - frac) + samples[idx1] * frac;
      }
      finalSamples = resampled;
      finalSampleRate = 16000;
    }

    const buffer = new ArrayBuffer(44 + finalSamples.length * 2);
    const view = new DataView(buffer);

    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + finalSamples.length * 2, true);
    this.writeString(view, 8, 'WAVE');

    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // Mono channel
    view.setUint32(24, finalSampleRate, true);
    view.setUint32(28, finalSampleRate * 2, true); // Byte rate
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // 16-bit depth

    this.writeString(view, 36, 'data');
    view.setUint32(40, finalSamples.length * 2, true);

    let index = 44;
    for (let i = 0; i < finalSamples.length; i++) {
      let s = Math.max(-1, Math.min(1, finalSamples[i]));
      view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      index += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }
}
