import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { scpLayout, scpDelay } from '../ui/slat-count-preloader';

interface SlatDigitProps {
  char: string;
  height?: number;
  slatRatio?: number;
  inkColor?: string;
  accentColor?: string;
}

const SlatDigit: React.FC<SlatDigitProps> = ({
  char,
  height = 30,
  slatRatio = 2,
  inkColor = '#6D15C2',
  accentColor = '#4c0d87',
}) => {
  const bars = scpLayout(char);
  const g = height * 0.024;
  const h = (height - 6 * g) / 7;
  const w = h * slatRatio;
  // Use integer width with safety buffer to prevent subpixel border collisions
  const digitWidth = Math.ceil(3 * w + 2 * g) + 2;
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div
      style={{
        position: 'relative',
        width: digitWidth,
        height: height,
        display: 'inline-block',
        overflow: 'visible',
      }}
      onMouseLeave={() => setHoveredRow(null)}
    >
      {bars.map((b, i) => {
        const r = Math.floor(i / 3);
        const c = i % 3;
        const col = b.col;
        const dy = b.dy;
        const delay = scpDelay(i + 1);
        const isHot = hoveredRow === r + dy;

        return (
          <span
            key={i}
            onMouseEnter={() => setHoveredRow(r + dy)}
            style={{
              position: 'absolute',
              left: c * (w + g),
              top: r * (h + g),
              width: w,
              height: h,
              backgroundColor: isHot ? accentColor : inkColor,
              borderRadius: '1px',
              transform: `translate(${(col - c) * (w + g)}px, ${dy * (h + g)}px) scaleX(${b.flat ? 0 : 1})`,
              transition: `transform 420ms cubic-bezier(0.65, 0, 0.35, 1), background-color 200ms ease`,
              transitionDelay: `${delay}ms, 0ms`,
              willChange: 'transform',
              cursor: 'pointer',
            }}
          />
        );
      })}
    </div>
  );
};

interface TimeUnitProps {
  value: string;
  label: string;
  height?: number;
}

const SlatTimeUnit: React.FC<TimeUnitProps> = ({ value, label, height = 30 }) => {
  const digits = value.padStart(2, '0').slice(-2).split('');

  return (
    <div className="flex flex-col items-center select-none shrink-0">
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-2 bg-purple-50/70 border border-purple-200/90 rounded-none shadow-2xs hover:border-[#6D15C2] transition-colors min-w-[56px] sm:min-w-[64px]">
        <SlatDigit char={digits[0]} height={height} inkColor="#6D15C2" accentColor="#4c0d87" />
        <SlatDigit char={digits[1]} height={height} inkColor="#6D15C2" accentColor="#4c0d87" />
      </div>
      <span className="text-[9px] sm:text-[10px] md:text-[11px] font-mono font-black tracking-widest text-[#6D15C2] uppercase mt-1.5 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
};

export const CountdownTimer: React.FC<{ className?: string }> = ({ className = '' }) => {
  // Target deadline: October 25, 2026 23:59:59 IST
  const targetTime = new Date('2026-10-25T23:59:59').getTime();

  const calculateTimeLeft = () => {
    const diff = targetTime - Date.now();
    if (diff <= 0) {
      return { days: '00', hours: '00', minutes: '00', seconds: '00' };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime]);

  return (
    <div className={`bg-white/95 backdrop-blur-sm p-3.5 sm:p-4 md:p-5 rounded-none border border-purple-200/90 shadow-2xs relative w-full overflow-hidden ${className}`}>
      <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-3 sm:gap-4 md:gap-5">
        
        {/* Left: Clock Icon + Deadline Details */}
        <div className="flex items-center gap-3 text-left w-full lg:w-auto shrink-0 justify-center lg:justify-start">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-none bg-purple-100/70 border border-purple-300 flex items-center justify-center text-[#6D15C2] shrink-0 shadow-2xs">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="font-mono text-xs sm:text-sm font-black text-[#2e1065] uppercase tracking-wider leading-tight">
              REGISTRATION DEADLINE
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold">
              Grand Finale Stage
            </p>
          </div>
        </div>

        {/* Right: Full Time strictly on a Single Line without clipping or overflowing */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-2.5 flex-nowrap shrink-0 overflow-visible">
          <SlatTimeUnit value={timeLeft.days} label="DAYS" height={30} />
          <span className="font-mono text-sm sm:text-base md:text-lg font-black text-[#6D15C2]/40 mb-4 sm:mb-5 select-none">:</span>
          <SlatTimeUnit value={timeLeft.hours} label="HOURS" height={30} />
          <span className="font-mono text-sm sm:text-base md:text-lg font-black text-[#6D15C2]/40 mb-4 sm:mb-5 select-none">:</span>
          <SlatTimeUnit value={timeLeft.minutes} label="MINUTES" height={30} />
          <span className="font-mono text-sm sm:text-base md:text-lg font-black text-[#6D15C2]/40 mb-4 sm:mb-5 select-none">:</span>
          <SlatTimeUnit value={timeLeft.seconds} label="SECONDS" height={30} />
        </div>

      </div>
    </div>
  );
};

export default CountdownTimer;
