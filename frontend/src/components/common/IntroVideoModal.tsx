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

  useEffect(() => {
    if (!isOpen) {
      setIsExiting(false);
      setProgress(0);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    setIsExiting(false);

    // Try unmuted autoplay first
    video.muted = false;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsMuted(false);
        })
        .catch(() => {
          // If browser blocks unmuted playback on initial page load, fall back to muted autoplay
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch((err) => {
              console.warn('Autoplay playback warning:', err);
            });
          }
        });
    }

    // Keyboard shortcut ESC to skip
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] w-screen h-screen bg-black overflow-hidden select-none transition-opacity duration-500 ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Video Player */}
      <video
        ref={videoRef}
        src="/intro-video.mp4"
        className="w-full h-full object-cover"
        playsInline
        autoPlay
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleDismiss}
      >
        <source src="/intro-video.mp4" type="video/mp4" />
        <source src="/Intro Video/Untitled design (6).mp4" type="video/mp4" />
      </video>

      {/* Top Bar: Skip Button */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-end pointer-events-auto">

        <button
          type="button"
          onClick={handleDismiss}
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
