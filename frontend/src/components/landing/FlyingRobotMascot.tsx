import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, MessageSquare, Volume2, RotateCcw, ArrowRight } from 'lucide-react';

export type MascotFlightState =
  | 'start_left'        // 1. Initialized on left side, ready to launch
  | 'arc_sweep_right'   // 2. Flying along a curved arc from left to right like a rotation
  | 'come_to_front'     // 3. Swooping dynamically into the foreground FRONT
  | 'say_hi'            // 4. Holding in front, greeting "Hi!" with speech bubble & audio chime
  | 'returning_home'    // 5. Accelerating and flying back to original corner place
  | 'docked_original';  // 6. Docked in original place, gentle idle levitation

const ROBOT_TIPS = [
  "👋 Player 1 detected! Sri Eshwar College welcomes you to Vyugam Arena! 🚀",
  "⚡ 8 Curated AI Problem Statements ready for your team!",
  "👥 Form your 4-student team & nominate a Leader!",
  "🏆 ₹5,00,000+ Prize Pool & Incubation rewards await the winners!",
  "📅 Registration Deadline: Register your team before 25th October 2026!",
  "🚀 Scroll down to level up through the 5 battle stages!",
];

// Cheerful sci-fi synthesizer chime using Web Audio API
const playCuteRobotChime = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    // 3-tone cheerful upward robotic chime (440Hz -> 659Hz -> 880Hz)
    osc1.frequency.setValueAtTime(440, now);
    osc1.frequency.exponentialRampToValueAtTime(659, now + 0.12);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.28);

    osc2.frequency.setValueAtTime(554, now + 0.06);
    osc2.frequency.exponentialRampToValueAtTime(1108, now + 0.32);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.06);
    osc1.stop(now + 0.55);
    osc2.stop(now + 0.55);
  } catch {
    // Gracefully ignore autoplay restrictions
  }
};

const triggerConfettiSparkle = () => {
  try {
    confetti({
      particleCount: 30,
      spread: 70,
      origin: { y: 0.45, x: 0.5 },
      colors: ['#0284c7', '#38bdf8', '#1755a7', '#fbbf24', '#ffffff'],
    });
  } catch {
    // ignore
  }
};

export const FlyingRobotMascot: React.FC = () => {
  const [flightState, setFlightState] = useState<MascotFlightState>('start_left');
  const [currentTipIdx, setCurrentTipIdx] = useState(0);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [isClickSpinning, setIsClickSpinning] = useState(false);

  const cornerAnchorRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Choreographed Flight Sequence:
  // 1. Start on left -> 2. Arc sweep left to right (rotation) -> 3. Swoop to FRONT -> 4. Say HI -> 5. Fly back to original place -> 6. Dock
  const launchFlightSequence = useCallback((isReplay = false) => {
    clearAllTimers();
    setShowSpeechBubble(false);

    if (isReplay) {
      setIsClickSpinning(true);
      setTimeout(() => setIsClickSpinning(false), 500);
    }

    // Step 1: Initialize on left side
    setFlightState('start_left');

    // Step 2: Arc sweep from left to right like a 3D orbital rotation
    const t1 = setTimeout(() => {
      setFlightState('arc_sweep_right');
    }, isReplay ? 350 : 250);
    timersRef.current.push(t1);

    // Step 3: Swoop dynamically from the right curve directly into FRONT foreground
    const t2 = setTimeout(() => {
      setFlightState('come_to_front');
    }, isReplay ? 1750 : 1600);
    timersRef.current.push(t2);

    // Step 4: Arrive in FRONT -> pop open speech bubble & say "Hi!" with sound & sparkles
    const t3 = setTimeout(() => {
      setFlightState('say_hi');
      setShowSpeechBubble(true);
      playCuteRobotChime();
      triggerConfettiSparkle();
    }, isReplay ? 2750 : 2600);
    timersRef.current.push(t3);

    // Step 5: After greeting (~3.4s), close speech bubble and fly back to original place
    const t4 = setTimeout(() => {
      setShowSpeechBubble(false);
      setFlightState('returning_home');
    }, isReplay ? 6200 : 6000);
    timersRef.current.push(t4);

    // Step 6: Settle cleanly into docked original place in the corner
    const t5 = setTimeout(() => {
      setFlightState('docked_original');
    }, isReplay ? 7350 : 7150);
    timersRef.current.push(t5);
  }, [clearAllTimers]);

  // Initial automatic flight on mount
  useEffect(() => {
    launchFlightSequence(false);
    return () => {
      clearAllTimers();
    };
  }, [launchFlightSequence, clearAllTimers]);

  // Skip and return to corner dock immediately
  const handleSkipToOriginalPlace = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    clearAllTimers();
    setShowSpeechBubble(false);
    setFlightState('returning_home');
    const t = setTimeout(() => {
      setFlightState('docked_original');
    }, 1100);
    timersRef.current.push(t);
  };

  // Click handler when docked in corner
  const handleDockedRobotClick = () => {
    setIsClickSpinning(true);
    playCuteRobotChime();
    setTimeout(() => setIsClickSpinning(false), 800);

    // Cycle tips
    setCurrentTipIdx(prev => (prev + 1) % ROBOT_TIPS.length);
    setShowSpeechBubble(true);

    const t = setTimeout(() => {
      setShowSpeechBubble(false);
    }, 4500);
    timersRef.current.push(t);
  };

  const isDocked = flightState === 'docked_original';
  const isSayingHi = flightState === 'say_hi';

  // Compute flight transform & coordinates
  const getFlightStyles = (): React.CSSProperties => {
    const anchorRect = cornerAnchorRef.current?.getBoundingClientRect();
    const cornerX = anchorRect ? anchorRect.left + anchorRect.width / 2 : viewport.width - 90;
    const cornerY = anchorRect ? anchorRect.top + anchorRect.height / 2 : 90;

    switch (flightState) {
      case 'start_left':
        return {
          left: `${Math.max(20, viewport.width * 0.06)}px`,
          top: `${viewport.height * 0.38}px`,
          transform: 'translate(-50%, -50%) scale(0.72) rotate(-18deg) rotateY(40deg)',
          transition: 'all 350ms ease-out',
          zIndex: 50,
        };

      case 'arc_sweep_right':
        // Flying in a curved arc from left to right like a rotation
        return {
          left: `${viewport.width * 0.82}px`,
          top: `${viewport.height * 0.20}px`,
          transform: 'translate(-50%, -50%) scale(0.96) rotate(26deg) rotateY(-38deg)',
          transition: 'left 1300ms cubic-bezier(0.25, 1, 0.4, 1), top 1300ms cubic-bezier(0.25, 1, 0.4, 1), transform 1300ms cubic-bezier(0.25, 1, 0.4, 1)',
          zIndex: 50,
        };

      case 'come_to_front':
        // Swooping directly into the close-up foreground in FRONT of the user
        return {
          left: `${viewport.width * 0.5}px`,
          top: `${viewport.height * 0.46}px`,
          transform: 'translate(-50%, -50%) scale(1.45) rotate(0deg) rotateY(0deg)',
          transition: 'left 980ms cubic-bezier(0.16, 1, 0.3, 1), top 980ms cubic-bezier(0.16, 1, 0.3, 1), transform 980ms cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 50,
        };

      case 'say_hi':
        // In front, saying Hi
        return {
          left: `${viewport.width * 0.5}px`,
          top: `${viewport.height * 0.46}px`,
          transform: 'translate(-50%, -50%) scale(1.45) rotate(0deg) rotateY(0deg)',
          transition: 'transform 300ms ease-out',
          zIndex: 50,
        };

      case 'returning_home':
        // Flying smoothly back to original corner place
        return {
          left: `${cornerX}px`,
          top: `${cornerY}px`,
          transform: 'translate(-50%, -50%) scale(1.0) rotate(-10deg) rotateY(25deg)',
          transition: 'left 1150ms cubic-bezier(0.25, 0.85, 0.25, 1), top 1150ms cubic-bezier(0.25, 0.85, 0.25, 1), transform 1150ms cubic-bezier(0.25, 0.85, 0.25, 1)',
          zIndex: 45,
        };

      default:
        return {};
    }
  };

  // Reusable 3D Mascot Figure Visual
  const renderRobotVisual = (isInFront = false) => (
    <div className="relative flex flex-col items-center">
      {/* Ambient Ion Halo Glow */}
      <div
        className={`absolute inset-0 -m-5 bg-gradient-to-t from-cyan-400/35 via-sky-300/25 to-transparent blur-2xl rounded-full pointer-events-none transition-all duration-300 ${
          isInFront ? 'scale-125 opacity-100' : 'opacity-70 animate-pulse'
        }`}
      />

      {/* Physics Levitation Bobbing */}
      <div
        className={`relative ${isDocked ? 'animate-bounce' : ''}`}
        style={{
          animationDuration: '2.5s',
          animationTimingFunction: 'ease-in-out',
        }}
      >
        <img
          src="/images/robot_mascot.png"
          alt="VyugamAI Flying AI Robot Mascot"
          className={`h-auto object-contain select-none transition-transform duration-300 ${
            isInFront
              ? 'w-44 sm:w-52 md:w-60 drop-shadow-[0_25px_35px_rgba(2,132,199,0.45)]'
              : 'w-28 sm:w-36 md:w-44 drop-shadow-[0_15px_22px_rgba(2,132,199,0.35)]'
          } ${isClickSpinning ? 'rotate-[360deg] scale-110' : ''}`}
        />

        {/* Dynamic Dual Jet Flames Beneath Thrusters */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-6 pointer-events-none">
          <div
            className={`bg-gradient-to-b from-cyan-400 via-sky-300 to-transparent blur-[2px] transition-all duration-300 ${
              flightState === 'arc_sweep_right' || flightState === 'returning_home'
                ? 'w-4 h-14 scale-y-150 animate-pulse'
                : 'w-3 h-8 animate-pulse'
            }`}
          />
          <div
            className={`bg-gradient-to-b from-cyan-400 via-sky-300 to-transparent blur-[2px] transition-all duration-300 ${
              flightState === 'arc_sweep_right' || flightState === 'returning_home'
                ? 'w-4 h-14 scale-y-150 animate-pulse'
                : 'w-3 h-8 animate-pulse'
            }`}
          />
        </div>

        {/* Dynamic Motion Blur Stream Trail (Active while sweeping left-to-right & returning) */}
        {(flightState === 'arc_sweep_right' || flightState === 'returning_home') && (
          <div className="absolute top-1/2 -left-8 -translate-y-1/2 w-20 h-1 bg-gradient-to-l from-cyan-400/80 to-transparent blur-xs pointer-events-none" />
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. ORIGINAL PLACE (CORNER DOCK ANCHOR) */}
      <div
        ref={cornerAnchorRef}
        className="absolute top-3 sm:top-5 right-3 sm:right-6 lg:right-10 z-30 pointer-events-auto"
      >
        {isDocked && (
          <div className="relative flex flex-col items-center">
            
            {/* Docked Speech Bubble (Tips) */}
            <div
              className={`transition-all duration-300 ease-out mb-2.5 max-w-xs ${
                showSpeechBubble
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-2 scale-90 pointer-events-none'
              }`}
            >
              <div className="relative bg-white/95 backdrop-blur-md border-2 border-sky-400 text-[#0a2540] px-4 py-2.5 rounded-none shadow-xl shadow-sky-500/15">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-sky-500 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '4s' }} />
                  <p className="text-xs sm:text-sm font-bold leading-snug">
                    {ROBOT_TIPS[currentTipIdx]}
                  </p>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-sky-400 rotate-45" />
              </div>
            </div>

            {/* Clickable Mascot at Original Place */}
            <div
              onClick={handleDockedRobotClick}
              className="cursor-pointer group"
              title="Click Vyu-Bot for hackathon tips & energy!"
            >
              {renderRobotVisual(false)}

              {/* Hover Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-[#0a2540] text-sky-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-none border border-sky-500 shadow-md">
                CLICK FOR TIPS
              </div>
            </div>

            {/* Dock Action Bar: Replay Flight Loop, Tips, Sound */}
            <div className="flex items-center gap-1.5 mt-3 bg-white/90 backdrop-blur-md border border-slate-300/80 p-1.5 rounded-none shadow-sm">
              <button
                onClick={() => launchFlightSequence(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-white bg-[#1755a7] hover:bg-blue-700 transition-colors cursor-pointer"
                title="Replay: Fly left to right rotation, come to front, say hi, come back home!"
              >
                <RotateCcw className="w-3 h-3 animate-spin" style={{ animationDuration: '10s' }} />
                <span>Fly Again</span>
              </button>

              <button
                onClick={handleDockedRobotClick}
                className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Next Tip"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={playCuteRobotChime}
                className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Play Chime"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}
      </div>

      {/* 2. DYNAMIC FULL-SCREEN FLIGHT STAGE (Active during all flight phases) */}
      {!isDocked && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div
            style={getFlightStyles()}
            className="fixed pointer-events-auto select-none"
          >
            <div className="relative flex flex-col items-center">
              
              {/* Foreground Holographic Greeting Speech Bubble ("SAY HI") */}
              <div
                className={`transition-all duration-400 ease-out mb-4 max-w-sm sm:max-w-md ${
                  showSpeechBubble && isSayingHi
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-4 scale-80 pointer-events-none'
                }`}
              >
                <div className="relative bg-white/95 backdrop-blur-lg border-2 border-sky-400 text-[#0a2540] px-5 py-3.5 rounded-none shadow-2xl shadow-sky-500/30">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl animate-bounce">👋</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-widest text-[#1755a7] uppercase mb-0.5">
                        <Sparkles className="w-3 h-3 text-sky-500" />
                        <span>Vyu-Bot &bull; AI Companion</span>
                      </div>
                      <p className="text-sm sm:text-base font-extrabold text-[#0a2540] leading-snug">
                        Hi! Sri Eshwar College welcomes you to VyugamAI! 🚀
                      </p>
                      <p className="text-[11px] font-medium text-slate-500 mt-1">
                        Ideas &times; Intelligence &times; Impact &bull; 8 Problem Statements
                      </p>
                      
                      <button
                        onClick={handleSkipToOriginalPlace}
                        className="mt-2 text-[10px] font-mono font-bold text-sky-600 hover:text-sky-800 tracking-wider inline-flex items-center gap-1 uppercase cursor-pointer"
                      >
                        <span>[Skip & Return to Corner]</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Speech pointer */}
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-sky-400 rotate-45" />
                </div>
              </div>

              {/* Flying 3D Robot Figure */}
              <div onClick={isSayingHi ? handleSkipToOriginalPlace : undefined} className="cursor-pointer">
                {renderRobotVisual(isSayingHi)}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FlyingRobotMascot;
