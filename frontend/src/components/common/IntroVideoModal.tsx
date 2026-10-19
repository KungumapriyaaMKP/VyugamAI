import React, { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX, SkipForward } from 'lucide-react';

interface IntroVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntroVideoModal: React.FC<IntroVideoModalProps> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMobileView, setIsMobileView] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767px)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsMobileView(e.matches);
    };
    setIsMobileView(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  const videoSrc = isMobileView ? '/intro-video-vertical-6.mp4' : '/intro-video.mp4';

  useEffect(() => {
    if (!isOpen) {
      setIsExiting(false);
      setProgress(0);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    setIsExiting(false);
    video.volume = 1.0;
    video.muted = false;
    setIsMuted(false);

    const startPlayback = async () => {
      const v = videoRef.current;
      if (!v) return;
      try {
        v.volume = 1.0;
        v.muted = false;
        await v.play();
        setIsMuted(false);
      } catch (err: any) {
        // Ignore AbortError caused by initial media loading; only mute if browser strictly throws NotAllowedError
        if (err?.name === 'NotAllowedError' && videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => {});
        }
      }
    };

    startPlayback();

    // If browser required a gesture on cold load, unmute immediately on any interaction
    const unlockAudio = () => {
      const v = videoRef.current;
      if (v && v.muted) {
        v.volume = 1.0;
        v.muted = false;
        v.play()
          .then(() => {
            setIsMuted(false);
          })
          .catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play().catch(() => {});
            }
          });
      }
    };

    const events = [
      'pointerdown',
      'mousedown',
      'mousemove',
      'pointermove',
      'touchstart',
      'keydown',
      'wheel',
      'click',
      'focus',
    ];
    events.forEach((evt) => window.addEventListener(evt, unlockAudio, { passive: true }));

    // Keyboard shortcut ESC to skip
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      events.forEach((evt) => window.removeEventListener(evt, unlockAudio));
    };
  }, [isOpen, videoSrc]);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(pct);
    }
  };

  const handleDismiss = () => {
    setIsExiting(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setTimeout(() => {
      onClose();
      setIsExiting(false);
    }, 450);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      if (!nextMuted) {
        videoRef.current.volume = 1.0;
        videoRef.current.play().catch(() => {});
      }
      setIsMuted(nextMuted);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={() => {
        if (videoRef.current && videoRef.current.muted) {
          videoRef.current.muted = false;
          videoRef.current.volume = 1.0;
          videoRef.current.play().catch(() => {});
          setIsMuted(false);
        }
      }}
      className={`fixed inset-0 z-[9999] w-screen h-screen bg-black overflow-hidden select-none transition-opacity duration-500 ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Video Player: Vertical video for mobile (< 768px), Landscape video for desktop */}
      <video
        key={videoSrc}
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-cover"
        playsInline
        autoPlay
        preload="auto"
        onCanPlay={() => {
          const v = videoRef.current;
          if (v && v.paused) {
            v.volume = 1.0;
            v.muted = false;
            v.play()
              .then(() => setIsMuted(false))
              .catch((err: any) => {
                if (err?.name === 'NotAllowedError' && videoRef.current) {
                  videoRef.current.muted = true;
                  setIsMuted(true);
                  videoRef.current.play().catch(() => {});
                }
              });
          }
        }}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleDismiss}
      />

      {/* Top Bar: Skip Button */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-end pointer-events-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white border border-white/20 backdrop-blur-md font-mono text-xs font-bold tracking-wider uppercase transition-all hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
        >
          <span>SKIP INTRO</span>
          <span className="text-white/50 text-[10px] px-1 py-0.5 rounded bg-white/10 font-mono">ESC</span>
          <SkipForward className="w-3.5 h-3.5 text-purple-400" />
        </button>
      </div>

      {/* Bottom Bar: Sound Toggle & Playback Progress */}
      <div className="absolute bottom-6 left-6 right-6 z-20 flex items-end justify-end pointer-events-auto">
        <button
          type="button"
          onClick={toggleMute}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white border border-white/20 backdrop-blur-md font-mono text-xs font-bold tracking-wider uppercase transition-all hover:scale-105 active:scale-95 shadow-lg cursor-pointer ml-auto"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-amber-300">Click to Unmute</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Audio On</span>
            </>
          )}
        </button>
      </div>

      {/* Top Border Progress Indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/15 z-30 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 transition-all duration-150 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default IntroVideoModal;
