import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowDown, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { VyugamTitleEffect } from '../ui/VyugamTitleEffect';
import { CountdownTimer } from '../common/CountdownTimer';

interface HeroSectionProps {
  setActiveTab: (tab: string) => void;
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
  onWatchIntro?: () => void;
}

const HERO_SLIDES = [
  {
    image: '/hero_slides/slide1_arena.jpg',
    alt: 'VyugamAI Innovation Arena',
    title: 'Hackathon Arena'
  },
  {
    image: '/hero_slides/slide2_robotics.jpg',
    alt: 'AI & Robotics Innovation Lab',
    title: 'Robotics & AI Labs'
  },
  {
    image: '/hero_slides/slide3_teamwork.jpg',
    alt: 'Engineering Teamwork & Sprint',
    title: 'Student Innovation Teams'
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ setActiveTab, onWatchIntro }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center items-center bg-transparent overflow-hidden border-b border-slate-200/80 pt-10 pb-20">
      
      {/* Background Slideshow Layer - Rotates every 3 seconds */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.image}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-90' : 'opacity-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className={`w-full h-full object-cover object-center transition-transform duration-[3500ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          );
        })}

        {/* Focused radial spotlight: illuminates only the center behind text without washing out the rest of the arena */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.35)_45%,rgba(255,255,255,0.05)_80%)] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white pointer-events-none" />
        
        {/* Soft atmospheric center glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Centered Main Hero Stage */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center relative z-10 space-y-6 sm:space-y-7">
        

        {/* Main Title & Subtitle with Staggered Entrance Animation */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Main Title: VYUGAM AI */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[112px] font-black text-[#2e1065] leading-none tracking-tight uppercase drop-shadow-[0_4px_30px_rgba(255,255,255,0.95)]"
          >
            <VyugamTitleEffect />
          </motion.h1>
          
          {/* Tagline: Ideas × Intelligence × Impact */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-2 font-mono text-xs sm:text-sm md:text-base font-black tracking-[0.25em] sm:tracking-[0.3em] uppercase text-purple-900 drop-shadow-xs"
          >
            <span>Ideas</span>
            <span className="text-purple-500 font-bold">×</span>
            <span>Intelligence</span>
            <span className="text-purple-500 font-bold">×</span>
            <span>Impact</span>
          </motion.div>
        </div>

        {/* Action CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 pt-2"
        >
          <button
            onClick={() => setActiveTab('student-portal')}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-purple-700 via-purple-900 to-[#1e0a3c] hover:from-purple-800 hover:to-indigo-900 text-white text-xs sm:text-sm font-mono font-black tracking-wider uppercase transition-all hover:scale-105 active:scale-95 shadow-[0_0_24px_rgba(147,51,234,0.35)] cursor-pointer rounded-none relative group"
          >
            <span>CREATE TEAM</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => setActiveTab('problems')}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/95 hover:bg-purple-50 text-slate-800 text-xs sm:text-sm font-mono font-black tracking-wider uppercase border-2 border-purple-200 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs rounded-none backdrop-blur-xs"
          >
            <span>VIEW PROBLEM STATEMENTS</span>
            <ArrowDown className="w-4 h-4 text-purple-600" />
          </button>

          {onWatchIntro && (
            <button
              onClick={onWatchIntro}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-purple-50/95 hover:bg-purple-100 text-[#2e1065] text-xs sm:text-sm font-mono font-black tracking-wider uppercase border border-purple-200 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs rounded-none backdrop-blur-xs"
            >
              <Play className="w-3.5 h-3.5 fill-[#2e1065]" />
              <span>WATCH INTRO</span>
            </button>
          )}
        </motion.div>

        {/* Live Hackathon Countdown Timer (Centered Box) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl mx-auto pt-2"
        >
          <CountdownTimer />
        </motion.div>

      </div>

      {/* 3-Second Slideshow Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 pointer-events-auto">
        {HERO_SLIDES.map((slide, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentSlide
                ? 'w-7 h-1.5 bg-purple-600 shadow-xs'
                : 'w-2 h-1.5 bg-purple-400/60 hover:bg-purple-600'
            }`}
            title={slide.title}
            aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
          />
        ))}
      </div>

    </section>
  );
};

export default HeroSection;
