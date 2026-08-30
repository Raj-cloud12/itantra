import React, { useState, useRef, useEffect } from 'react';

interface VoiceNotePlayerProps {
  audioUrl?: string;
  isSentByMe: boolean;
  text?: string;
  durationSeconds?: number;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  audioUrl,
  isSentByMe,
  text,
  durationSeconds
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState<number>(() => {
    return durationSeconds && durationSeconds > 0 ? durationSeconds : 2;
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (durationSeconds && durationSeconds > 0) {
      setTotalDuration(durationSeconds);
    }
  }, [durationSeconds]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        // If durationSeconds was not specified, use audio.duration
        if (!durationSeconds || durationSeconds <= 0) {
          setTotalDuration(Math.round(audio.duration));
        }
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(Math.floor(audio.currentTime));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, durationSeconds]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Pause all other playing audios on page
      document.querySelectorAll('audio').forEach((el) => {
        if (el !== audio) el.pause();
      });
      audio.currentTime = 0;
      audio.play().then(() => setIsPlaying(true)).catch(() => {
        // Fallback: if audio fails, speak text aloud
        if ('speechSynthesis' in window && text) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'ta-IN';
          window.speechSynthesis.speak(u);
        }
      });
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const displayDuration = totalDuration > 0 ? totalDuration : (durationSeconds || 2);

  return (
    <div className={`p-2.5 rounded-2xl flex items-center gap-3 border transition-all ${
      isSentByMe
        ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-100'
        : 'bg-blue-950/70 border-cyan-500/50 text-cyan-100'
    }`}>
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      )}

      {/* Large Round Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-black shadow-lg active:scale-95 transition-all shrink-0 ${
          isSentByMe
            ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
            : 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]'
        }`}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      {/* Animated Waveform Visualizer */}
      <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
        <div className="flex items-center gap-1 h-5 overflow-hidden">
          {[40, 75, 55, 90, 30, 85, 60, 100, 45, 70, 95, 35, 80, 50, 65, 85, 40, 75, 60, 90].map((h, idx) => (
            <span
              key={idx}
              className={`w-1 rounded-full transition-all ${
                isPlaying ? 'animate-pulse' : 'opacity-60'
              } ${
                isSentByMe ? 'bg-emerald-400' : 'bg-cyan-400'
              }`}
              style={{
                height: `${isPlaying ? Math.max(25, (h * (currentTime + 1)) % 100) : h}%`,
                animationDelay: `${idx * 50}ms`
              }}
            />
          ))}
        </div>

        {/* Duration / Progress Text */}
        <div className="flex items-center justify-between text-[9.5px] font-mono font-bold opacity-90">
          <span>{formatTime(currentTime)}</span>
          <span className="text-[8.5px] uppercase tracking-wider text-slate-400">🎙️ Voice Note</span>
          <span>{formatTime(displayDuration)}</span>
        </div>
      </div>
    </div>
  );
};
