import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowDown, Play } from 'lucide-react';
import { ScrollReveal } from '../common/ScrollReveal';
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
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[88vh] flex flex-col justify-center bg-transparent overflow-hidden border-b border-slate-200/80 pt-8 pb-16">
      
      {/* Background Slideshow Layer - strictly confined to Hero section */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.image}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-85' : 'opacity-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className={`w-full h-full object-cover object-center transition-transform duration-[6000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          );
        })}

        {/* Directional scrim: soft fade on the left for title readability while letting the arena/lab visuals shine across the section */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/65 to-white/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-transparent to-white/40 pointer-events-none" />
        
        {/* Soft atmospheric purple glow */}
        <div className="absolute top-1/3 -right-20 w-[550px] h-[550px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main 2-Column Split Hero Stage */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* LEFT COLUMN: Editorial Typography & Actions */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-7">
          
          {/* Main Headline - Large & Immediate */}
          <ScrollReveal direction="up" distance={8} delay={0} duration={300}>
            <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[108px] font-black text-[#2e1065] leading-none tracking-tight uppercase drop-shadow-[0_2px_12px_rgba(255,255,255,0.9)]">
              <VyugamTitleEffect />
            </h1>
          </ScrollReveal>

          {/* Action Buttons */}
          <ScrollReveal direction="up" distance={15} delay={80} duration={400}>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={() => setActiveTab('student-portal')}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-purple-700 via-purple-900 to-[#1e0a3c] hover:from-purple-800 hover:to-indigo-900 text-white text-xs sm:text-sm font-mono font-black tracking-wider uppercase transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(147,51,234,0.35)] cursor-pointer rounded-none relative group"
              >
                <span>CREATE TEAM</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('problems')}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/90 hover:bg-purple-50 text-slate-800 text-xs sm:text-sm font-mono font-black tracking-wider uppercase border-2 border-purple-200 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs rounded-none backdrop-blur-xs"
              >
                <span>VIEW PROBLEM STATEMENTS</span>
                <ArrowDown className="w-4 h-4 text-purple-600" />
              </button>

              {onWatchIntro && (
                <button
                  onClick={onWatchIntro}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-purple-50/90 hover:bg-purple-100 text-[#2e1065] text-xs sm:text-sm font-mono font-black tracking-wider uppercase border border-purple-200 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs rounded-none backdrop-blur-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-[#2e1065]" />
                  <span>WATCH INTRO</span>
                </button>
              )}
            </div>
          </ScrollReveal>

          {/* Live Hackathon Countdown Timer (Single-Line Slat Mechanical Clock) */}
          <ScrollReveal direction="up" distance={15} delay={150} duration={500}>
            <div className="pt-2">
              <CountdownTimer />
            </div>
          </ScrollReveal>

        </div>

        {/* RIGHT COLUMN: Free-Standing Full-Body 3D Robot Showcase (Complete Till End) */}
        <div className="lg:col-span-5 xl:col-span-5 flex justify-center items-end relative self-stretch">
          <ScrollReveal direction="left" distance={28} duration={850} className="w-full h-full flex justify-center items-end">
            <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl flex flex-col justify-end items-center select-none pt-4 group">
              
              {/* Ambient Cybernetic Radial Glow Auroras */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

              {/* Free-Standing Full-Body Robot Figure */}
              <div className="relative z-10 flex flex-col items-center">
                <img
                  src="/robot_image/vyugam_robot_full_standing.png"
                  alt="Vyugam AI Robot Champion"
                  className="w-auto h-[520px] sm:h-[600px] md:h-[680px] lg:h-[750px] xl:h-[800px] max-h-[88vh] object-contain drop-shadow-[0_24px_48px_rgba(46,16,101,0.35)] hover:scale-105 transition-transform duration-700 pointer-events-auto"
                />

                {/* Ground Perspective Shadow right under feet */}
                <div className="w-56 sm:w-72 h-5 bg-slate-900/25 blur-lg rounded-full -mt-2 pointer-events-none" />
              </div>

            </div>
          </ScrollReveal>
        </div>

      </div>

      {/* Subtle Slide Indicators at bottom center */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 pointer-events-auto">
        {HERO_SLIDES.map((slide, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentSlide
                ? 'w-7 h-1.5 bg-purple-600 shadow-xs'
                : 'w-2 h-1.5 bg-purple-300/60 hover:bg-purple-400'
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
