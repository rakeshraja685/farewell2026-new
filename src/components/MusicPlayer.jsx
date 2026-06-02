import { useState, useRef, useEffect } from "react";

// Local audio files from public/music/
const tracks = [
  {
    title: "Farewell Theme I",
    artist: "Our Class · 2026",
    src: "/music/theme1.mp3",
  },
  {
    title: "Farewell Theme II",
    artist: "Our Class · 2026",
    src: "/music/theme2.mp3",
  },
];

export default function MusicPlayer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const audioRef = useRef(null);
  const startedRef = useRef(false);

  // Attempt autoplay on mount
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
        setAutoplayBlocked(false);
      })
      .catch(() => {
        // Browser blocked autoplay — wait for first user interaction
        setAutoplayBlocked(true);
      });
  }, []);

  // On first user interaction anywhere on the page, start music
  useEffect(() => {
    if (!autoplayBlocked) return;
    const startOnInteraction = () => {
      if (startedRef.current) return;
      if (!audioRef.current) return;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
          startedRef.current = true;
        })
        .catch(() => {});
    };
    window.addEventListener("click", startOnInteraction, { once: true });
    window.addEventListener("touchstart", startOnInteraction, { once: true });
    window.addEventListener("keydown", startOnInteraction, { once: true });
    return () => {
      window.removeEventListener("click", startOnInteraction);
      window.removeEventListener("touchstart", startOnInteraction);
      window.removeEventListener("keydown", startOnInteraction);
    };
  }, [autoplayBlocked]);

  // Sync volume whenever it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // When track changes: load + play if already playing
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.load();
    audioRef.current.volume = volume;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 0;
    setCurrentTime(cur);
    setDuration(dur);
    setProgress(dur > 0 ? (cur / dur) * 100 : 0);
  };

  // When a track ends, move to next (loops back to first after last)
  const handleEnded = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  };

  const prevTrack = () => {
    // If more than 3 seconds in, restart current track instead
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else {
      setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    audioRef.current.currentTime = ratio * duration;
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Audio Element — local files, no loop (we manually loop across tracks) */}
      <audio
        ref={audioRef}
        src={tracks[currentTrack].src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
        preload="auto"
      />

      <div className="fixed bottom-6 right-6 z-[80]">
        {/* Expanded Player Panel */}
        {isExpanded && (
          <div
            className="mb-3 rounded-[2rem] shadow-2xl p-6 w-72 glass-card border border-white/10 animate-slideUp overflow-hidden relative"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(24px) saturate(150%)",
            }}
          >
            {/* Ambient animated gradient background blob inside player */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-[30px] pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent-cyan/20 rounded-full blur-[30px] pointer-events-none" />

            {/* Track Info + Close */}
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Animated Music Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary to-accent-cyan shadow-lg"
                >
                  <span
                    className="material-symbols-outlined text-white text-base drop-shadow-md"
                    style={{
                      animation: isPlaying ? "spin 4s linear infinite" : "none",
                    }}
                  >
                    album
                  </span>
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  <p className="text-[15px] font-bold text-white font-display truncate tracking-tight leading-tight">
                    {tracks[currentTrack].title}
                  </p>
                  <p className="text-[10px] font-sans text-on-surface-variant font-bold tracking-widest uppercase truncate mt-0.5">
                    {tracks[currentTrack].artist}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer text-white/50 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div
              className="w-full rounded-full mb-1 cursor-pointer overflow-hidden relative z-10"
              style={{ height: "5px", background: "rgba(255,255,255,0.1)" }}
              onClick={handleSeek}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent-cyan"
                style={{
                  width: `${progress}%`,
                  transition: "width 0.1s linear",
                }}
              />
            </div>

            {/* Time */}
            <div className="flex justify-between mb-5 relative z-10">
              <span className="text-[10px] text-white/50 font-mono">
                {formatTime(currentTime)}
              </span>
              <span className="text-[10px] text-white/50 font-mono">
                {formatTime(duration)}
              </span>
            </div>

            {/* Track dots indicator */}
            <div className="flex justify-center gap-2 mb-5 relative z-10">
              {tracks.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTrack(i)}
                  className="border-none cursor-pointer p-0 transition-all duration-300 rounded-full"
                  style={{
                    width: i === currentTrack ? "20px" : "6px",
                    height: "6px",
                    background: i === currentTrack ? "#06B6D4" : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mb-5 relative z-10">
              <button
                onClick={prevTrack}
                className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/5 rounded-full cursor-pointer transition-colors text-white/70 hover:text-white"
              >
                <span className="material-symbols-outlined text-lg">skip_previous</span>
              </button>

              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full flex items-center justify-center border-none cursor-pointer transition-all hover:scale-105 active:scale-95 bg-gradient-to-br from-primary to-accent-cyan shadow-[0_4px_20px_rgba(139,92,246,0.5)]"
              >
                <span className="material-symbols-outlined text-white text-3xl drop-shadow-md">
                  {isPlaying ? "pause" : "play_arrow"}
                </span>
              </button>

              <button
                onClick={nextTrack}
                className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/5 rounded-full cursor-pointer transition-colors text-white/70 hover:text-white"
              >
                <span className="material-symbols-outlined text-lg">skip_next</span>
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 relative z-10">
              <span className="material-symbols-outlined text-white/40 text-base">
                volume_down
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 cursor-pointer"
                style={{
                  height: "4px",
                  borderRadius: "4px",
                  outline: "none",
                  border: "none",
                  accentColor: "#06B6D4",
                  background: `linear-gradient(to right, #06B6D4 0%, #06B6D4 ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%, rgba(255,255,255,0.1) 100%)`,
                }}
              />
              <span className="material-symbols-outlined text-white/40 text-base">
                volume_up
              </span>
            </div>

            {/* Loop badge */}
            <div className="flex justify-center mt-5 relative z-10">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                <span className="material-symbols-outlined text-[13px]">
                  repeat
                </span>
                Looping Playlist
              </span>
            </div>
          </div>
        )}

        {/* Floating Pill Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 rounded-full px-5 py-3.5 border-none cursor-pointer transition-all duration-300 group relative glass-card"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px) saturate(150%)",
            border: isPlaying
              ? "1px solid rgba(6,182,212,0.5)"
              : "1px solid rgba(255,255,255,0.1)",
            boxShadow: isPlaying
              ? "0 4px 24px rgba(6,182,212,0.3), 0 2px 10px rgba(0,0,0,0.5)"
              : "0 4px 16px rgba(0,0,0,0.5)",
          }}
        >
          {/* Pulsing ring hint when autoplay is blocked */}
          {autoplayBlocked && (
            <span
              className="absolute inset-0 rounded-full"
              style={{ animation: "ringPulse 2s ease-out infinite", border: "2px solid rgba(139,92,246,0.6)" }}
            />
          )}
          <span
            className="material-symbols-outlined text-xl"
            style={{
              background: "linear-gradient(to right, #8B5CF6, #06B6D4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: isPlaying ? "pulse 1.5s ease-in-out infinite" : "none",
            }}
          >
            music_note
          </span>
          {!isExpanded && (
            <span
              className="text-xs hidden sm:inline transition-colors font-body font-medium"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              {autoplayBlocked ? "Tap anywhere to play 🎵" : tracks[currentTrack].title}
            </span>
          )}
        </button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.15); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ringPulse {
          0%   { transform: scale(1);    opacity: 0.8; }
          70%  { transform: scale(1.18); opacity: 0; }
          100% { transform: scale(1.18); opacity: 0; }
        }
      `}</style>
    </>
  );
}
