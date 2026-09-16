import React, { useState, useRef, useCallback } from 'react';
import { UniversalWavRecorder } from '../utils/wavRecorder';

interface PushToTalkButtonProps {
  onTranscript: (text: string, audioSize: number, audioBlob?: Blob, detectedLang?: string, audioBase64?: string, durationSec?: number) => void;
  disabled?: boolean;
  networkMode?: string;
  language?: string;
  onLiveInterimText?: (text: string) => void;
  onStartRecord?: () => void;
}

export const PushToTalkButton: React.FC<PushToTalkButtonProps> = ({
  onTranscript,
  disabled = false,
  networkMode = 'mode-3-ai-mesh',
  language = 'ta',
  onLiveInterimText,
  onStartRecord
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);

  const isPressingRef = useRef(false);
  const startTimeRef = useRef(0);
  const timerRef = useRef<any>(null);
  const recognizedTextRef = useRef('');
  const recognitionRef = useRef<any>(null);
  const wavRecorderRef = useRef<UniversalWavRecorder>(new UniversalWavRecorder());

  // Pre-warm the microphone hardware on mount so pressing button activates in 0ms!
  React.useEffect(() => {
    wavRecorderRef.current.prewarm().catch(() => {});
    return () => {
      wavRecorderRef.current.destroy();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  // START RECORDING (INSTANT 0ms ACTIVATION)
  const startRecording = useCallback(async () => {
    if (disabled || isPressingRef.current) return;
    isPressingRef.current = true;
    setIsRecording(true);
    setRecordDuration(0);
    recognizedTextRef.current = '';
    startTimeRef.current = Date.now();
    onStartRecord?.();
    const promptText = language === 'ta' ? '🎙️ Listening... (பேசுங்கள்)' : '🎙️ Listening... Speak now';
    onLiveInterimText?.(promptText);

    timerRef.current = setInterval(() => {
      setRecordDuration(Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000)));
    }, 300);

    // 1. Android Bridge Native SpeechRecognizer (Priority on Android App)
    const hasAndroidNativeSpeech = Boolean((window as any).AndroidBleMeshBridge?.startSpeechRecognition);
    if (hasAndroidNativeSpeech) {
      try {
        (window as any).AndroidBleMeshBridge.startSpeechRecognition(language || 'ta');
      } catch (e) {
        console.warn('Native SpeechRecognition error:', e);
      }
    } else {
      // 2. Web Speech API (Used in desktop/laptop browser when Native Bridge is absent)
      const SpeechRecClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecClass) {
        try {
          const recog = new SpeechRecClass();
          recog.continuous = true;
          recog.interimResults = true;
          const targetLang = language || 'ta';
          recog.lang = targetLang === 'ta' ? 'ta-IN' : targetLang === 'en' ? 'en-IN' : `${targetLang}-IN`;
          recog.onresult = (event: any) => {
            let fullStr = '';
            for (let i = 0; i < event.results.length; i++) {
              fullStr += event.results[i][0].transcript;
            }
            if (fullStr.trim()) {
              recognizedTextRef.current = fullStr.trim();
              onLiveInterimText?.(fullStr.trim());
            }
          };
          recog.onerror = (err: any) => {
            console.warn('Live SpeechRecognition notice:', err.error);
          };
          recog.start();
          recognitionRef.current = recog;
        } catch (e) {
          console.warn('SpeechRecognition init:', e);
        }
      }
    }

    // 3. Start clean 16kHz PCM WAV recorder for Mode 1 & Mode 2 audio transmission
    try {
      await wavRecorderRef.current.start();
    } catch (err) {
      console.warn('Microphone start error:', err);
    }
  }, [disabled, language, onLiveInterimText, onStartRecord]);

  // STOP RECORDING & TRANSMIT INSTANTLY (ZERO ARTIFICIAL WAIT)
  const stopRecording = useCallback(async () => {
    if (!isPressingRef.current) return;
    isPressingRef.current = false;
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    // Stop Web Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    // Stop Android Native SpeechRecognizer
    if ((window as any).AndroidBleMeshBridge?.stopSpeechRecognition) {
      try {
        const nativeText = (window as any).AndroidBleMeshBridge.stopSpeechRecognition();
        if (nativeText && nativeText.trim()) {
          recognizedTextRef.current = nativeText.trim();
        }
      } catch (e) {}
    }

    const durationSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    let audioBlob: Blob | undefined = undefined;
    let audioBase64: string | undefined = undefined;
    let audioSize = durationSec * 16000;

    try {
      const result = await wavRecorderRef.current.stop();
      audioBlob = result.blob;
      audioBase64 = result.base64;
      audioSize = result.size || audioSize;
    } catch (e) {
      console.warn('Microphone stop error:', e);
    }

    const effectiveLang = language || 'ta';
    const finalText = recognizedTextRef.current.trim();
    onTranscript(finalText, audioSize, audioBlob, effectiveLang as any, audioBase64, durationSec);
    recognizedTextRef.current = '';
  }, [onTranscript, language]);

  const isToggleModeRef = useRef(false);

  return (
    <div className="flex flex-col items-center w-full select-none touch-none">
      <button
        type="button"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          if (isRecording && isToggleModeRef.current) {
            isToggleModeRef.current = false;
            stopRecording();
          } else if (!isRecording) {
            startRecording();
          }
        }}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId);
          const elapsed = Date.now() - startTimeRef.current;
          if (elapsed < 450) {
            // Short tap: Keep recording in toggle mode!
            isToggleModeRef.current = true;
          } else {
            // Held down: Stop on release!
            isToggleModeRef.current = false;
            stopRecording();
          }
        }}
        onPointerCancel={() => {
          if (!isToggleModeRef.current) stopRecording();
        }}
        className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 select-none relative touch-none cursor-pointer outline-none ${
          isRecording
            ? 'bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 text-white scale-105 shadow-[0_0_50px_rgba(239,68,68,0.8)] border-4 border-white/80 animate-pulse'
            : 'bg-gradient-to-tr from-slate-800 via-slate-900 to-blue-950 text-slate-200 hover:brightness-110 shadow-[0_0_30px_rgba(30,58,138,0.5)] border-4 border-cyan-500/50'
        }`}
      >
        <span className="text-4xl mb-1">{isRecording ? '🎙️' : '🎤'}</span>
        <span className="font-black text-xs tracking-wider uppercase text-white">
          {isRecording ? (isToggleModeRef.current ? 'TAP TO SEND' : 'RECORDING...') : 'HOLD / TAP TO TALK'}
        </span>
        <span className="text-[11px] font-bold text-amber-300 font-mono mt-0.5">
          {isRecording ? `${recordDuration}s` : ''}
        </span>
      </button>

      {/* Helper label below button */}
      <div className="mt-3 text-xs font-sans font-medium text-slate-400 flex items-center gap-1.5">
        {isRecording ? (
          <>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-rose-300 font-bold">
              {isToggleModeRef.current ? `🎙️ Recording (${recordDuration}s)... Tap again to send` : `🎙️ Recording (${recordDuration}s)... Release to send`}
            </span>
          </>
        ) : (
          <span className="text-slate-400">Hold or Tap button to speak voice note</span>
        )}
      </div>
    </div>
  );
};
