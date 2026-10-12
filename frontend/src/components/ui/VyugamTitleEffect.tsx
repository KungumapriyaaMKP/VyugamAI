import React from 'react';
import { TextRoll } from './text-roll';

interface VyugamTitleEffectProps {
  className?: string;
}

export const VyugamTitleEffect: React.FC<VyugamTitleEffectProps> = ({ className = '' }) => {
  return (
    <span className={`relative inline-block select-none whitespace-nowrap text-[#2e1065] ${className}`}>
      <TextRoll
        duration={0.5}
        getEnterDelay={(i) => i * 0.04}
        getExitDelay={(i) => i * 0.04 + 0.12}
        className="relative z-10 text-[#2e1065] hover:text-purple-700 transition-colors tracking-tight font-black"
      >
        VYUGAM AI
      </TextRoll>
    </span>
  );
};

export default VyugamTitleEffect;
