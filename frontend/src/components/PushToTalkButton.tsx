import React, { useState, useRef, useCallback } from 'react';
import { UniversalWavRecorder } from '../utils/wavRecorder';

interface PushToTalkButtonProps {
  onTranscript: (text: string, audioSize: number, audioBlob?: Blob, detectedLang?: string, audioBase64?: string, durationSec?: number) => void;
  disabled?: boolean;
  networkMode?: string;
  language?: string;
  onLiveInterimText?: (text: string) => void;
}

export const PushToTalkButton: React.FC<PushToTalkButtonProps> = ({
  onTranscript,
  disabled = false,
  networkMode = 'mode-3-ai-mesh',
  language = 'ta',
  onLiveInterimText
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);

  const isPressingRef = useRef(false);
  const startTimeRef = useRef(0);
  const timerRef = useRef<any>(null);
  const recognizedTextRef = useRef('');
  const wavRecorderRef = useRef<UniversalWavRecorder | null>(null);
  const recognitionRef = useRef<any>(null);

  // START RECORDING
  const startRecording = useCallback(async () => {
    if (disabled || isPressingRef.current) return;
    isPressingRef.current = true;
    setIsRecording(true);
    setRecordDuration(0);
    recognizedTextRef.current = '';
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setRecordDuration(Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000)));
    }, 400);

    // 0. Native Android Offline Speech Recognition Bridge (Mode 3 only)
    if (networkMode === 'mode-3-ai-mesh') {
      if ((window as any).AndroidBleMeshBridge && (window as any).AndroidBleMeshBridge.startSpeechRecognition) {
        (window as any).onNativeSpeechResult = (text: string, _isFinal: boolean) => {
          if (text && text.trim()) {
            recognizedTextRef.current = text.trim();
            onLiveInterimText?.(text.trim());
          }
        };
        try {
          (window as any).AndroidBleMeshBridge.startSpeechRecognition(language || 'ta');
        } catch (e) {}
      }

      // 1. Real-Time Live Speech Recognition (Zero-Latency Offline / Mobile Browser ASR)
      try {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRec) {
          const recog = new SpeechRec();
          recog.continuous = true;
          recog.interimResults = true;
          recog.lang = language === 'ta' ? 'ta-IN' : (language ? `${language}-IN` : 'ta-IN');
          recog.onresult = (e: any) => {
            let text = '';
            for (let i = 0; i < e.results.length; ++i) {
              text += e.results[i][0].transcript;
            }
            if (text.trim()) {
              recognizedTextRef.current = text.trim();
              onLiveInterimText?.(text.trim());
            }
          };
          recog.onerror = () => {};
          recog.start();
          recognitionRef.current = recog;
        }
      } catch {}
    }

    // 2. Start clean 16kHz PCM WAV recorder for pristine audio capture & AI transcription
    try {
      const recorder = new UniversalWavRecorder();
      await recorder.start();
      wavRecorderRef.current = recorder;
    } catch (err) {}

  }, [disabled, language, onLiveInterimText, networkMode]);

  // STOP RECORDING & TRANSMIT INSTANTLY
  const stopRecording = useCallback(async () => {
    if (!isPressingRef.current) return;
    isPressingRef.current = false;
    setIsRecording(false);
    clearInterval(timerRef.current);

    // Stop real-time speech recognizer
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }

    // Stop native Android speech recognizer
    if ((window as any).AndroidBleMeshBridge && (window as any).AndroidBleMeshBridge.stopSpeechRecognition) {
      try {
        (window as any).AndroidBleMeshBridge.stopSpeechRecognition();
      } catch (e) {}
    }

    const durationSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    // Allow 300ms only in Mode 3 for speech-to-text to flush results; Mode 1 and Mode 2 are instant audio!
    if (networkMode === 'mode-3-ai-mesh') {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    let audioBlob: Blob | undefined = undefined;
    let audioBase64: string | undefined = undefined;
    let audioSize = 45000;

    if (wavRecorderRef.current) {
      try {
        const result = await wavRecorderRef.current.stop();
        audioBlob = result.blob;
        audioBase64 = result.base64;
        audioSize = result.size;
      } catch (e) {}
      wavRecorderRef.current = null;
    }

    if (!audioSize || audioSize < 100) audioSize = durationSec * 16000;

    // Mode 1 and Mode 2 send pure audio note; Mode 3 sends recognized Tamil text
    let recognized = networkMode === 'mode-3-ai-mesh' ? recognizedTextRef.current.trim() : '';
    const effectiveLang = language || 'ta';
    onTranscript(recognized, audioSize, audioBlob, effectiveLang as any, audioBase64, durationSec);
    recognizedTextRef.current = '';
  }, [onTranscript, language, networkMode]);

  return (
    <div className="flex flex-col items-center w-full select-none touch-none">
      <button
        type="button"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); startRecording(); }}
        onPointerUp={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); stopRecording(); }}
        onPointerCancel={() => { stopRecording(); }}
        className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 select-none relative touch-none cursor-pointer outline-none ${
          isRecording
            ? 'bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 text-white scale-105 shadow-[0_0_50px_rgba(239,68,68,0.8)] border-4 border-white/80 animate-pulse'
            : 'bg-gradient-to-tr from-slate-800 via-slate-900 to-blue-950 text-slate-200 hover:brightness-110 shadow-[0_0_30px_rgba(30,58,138,0.5)] border-4 border-cyan-500/50'
        }`}
      >
        <span className="text-4xl mb-1">{isRecording ? '🎙️' : '🎤'}</span>
        <span className="font-black text-xs tracking-wider uppercase text-white">
          {isRecording ? 'RECORDING...' : 'HOLD TO TALK'}
        </span>
        <span className="text-[11px] font-bold text-amber-300 font-mono mt-0.5">
          {isRecording ? `${recordDuration}s` : 'PTT VOICE'}
        </span>
      </button>

      {/* Helper label below button */}
      <div className="mt-3 text-xs font-sans font-medium text-slate-400 flex items-center gap-1.5">
        {isRecording ? (
          <>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-rose-300 font-bold">Recording Voice Note ({recordDuration}s)... Release to send</span>
          </>
        ) : (
          <span className="text-slate-400">Hold button to record voice note</span>
        )}
      </div>
    </div>
  );
};
