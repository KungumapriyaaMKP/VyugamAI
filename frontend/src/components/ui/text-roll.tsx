'use client';
import { useState } from 'react';
import {
  motion,
  type VariantLabels,
  type Target,
  type TargetAndTransition,
  type Transition,
} from 'motion/react';

export type TextRollProps = {
  children: string;
  duration?: number;
  getEnterDelay?: (index: number) => number;
  getExitDelay?: (index: number) => number;
  className?: string;
  transition?: Transition;
  variants?: {
    enter: {
      initial: Target | VariantLabels | boolean;
      animate: TargetAndTransition | VariantLabels;
    };
    exit: {
      initial: Target | VariantLabels | boolean;
      animate: TargetAndTransition | VariantLabels;
    };
  };

  onAnimationComplete?: () => void;
};

export function TextRoll({
  children,
  duration = 0.5,
  getEnterDelay = (i) => i * 0.04,
  getExitDelay = (i) => i * 0.04 + 0.1,
  className = '',
  transition = { ease: [0.16, 1, 0.3, 1] },
  variants,
  onAnimationComplete,
}: TextRollProps) {
  const [rollKey, setRollKey] = useState(0);

  const defaultVariants = {
    enter: {
      initial: { rotateX: 0, opacity: 1 },
      animate: { rotateX: 90, opacity: 0 },
    },
    exit: {
      initial: { rotateX: -90, opacity: 0 },
      animate: { rotateX: 0, opacity: 1 },
    },
  } as const;

  const letters = children.split('');

  const triggerRoll = () => {
    setRollKey((prev) => prev + 1);
  };

  return (
    <span
      className={`inline-block cursor-pointer select-none ${className}`}
      onMouseEnter={triggerRoll}
      key={rollKey}
    >
      {letters.map((letter, i) => {
        return (
          <span
            key={i}
            className="relative inline-block [perspective:1000px] [transform-style:preserve-3d] align-baseline"
            aria-hidden="true"
          >
            {/* Top exit / initial roll */}
            <motion.span
              className="absolute inset-0 inline-block [backface-visibility:hidden] [transform-origin:50%_0%]"
              initial={variants?.enter?.initial ?? defaultVariants.enter.initial}
              animate={variants?.enter?.animate ?? defaultVariants.enter.animate}
              transition={{
                ...transition,
                duration,
                delay: getEnterDelay(i),
              }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>

            {/* Bottom arrival / final resting letter */}
            <motion.span
              className="absolute inset-0 inline-block [backface-visibility:hidden] [transform-origin:50%_100%]"
              initial={variants?.exit?.initial ?? defaultVariants.exit.initial}
              animate={variants?.exit?.animate ?? defaultVariants.exit.animate}
              transition={{
                ...transition,
                duration,
                delay: getExitDelay(i),
              }}
              onAnimationComplete={
                letters.length === i + 1 ? onAnimationComplete : undefined
              }
            >
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>

            {/* Placeholder maintaining exact DOM dimensions and line box */}
            <span className="invisible inline-block">
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          </span>
        );
      })}
      <span className="sr-only">{children}</span>
    </span>
  );
}

export default TextRoll;
