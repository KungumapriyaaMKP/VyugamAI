import React from 'react';
import Timeline from '../ui/timeline';
import { ScrollReveal } from '../common/ScrollReveal';

export const ProcessFlowSection: React.FC = () => {
  return (
    <section id="timeline" className="bg-white border-t border-slate-200 relative scroll-mt-20">
      <span id="process" className="absolute -top-20" />

      {/* Lead-in Header */}
      <div className="pt-20 pb-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <ScrollReveal direction="up" distance={20} duration={650} className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-none bg-purple-50 border border-purple-200 text-[#2e1065] text-xs font-mono font-black tracking-widest uppercase shadow-2xs">
            <span>🎮 LEVEL ROADMAP • 2026–2027</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-sans">
            Project Timeline <span className="text-[#2e1065]">2026–2027</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl mx-auto">
            Scroll horizontally through the 5 battle stages — from Squad Assembly and Problem Selection to the 24-Hour Arena Grand Finale Gauntlet.
          </p>
        </ScrollReveal>
      </div>

      {/* Interactive GSAP Pinned Horizontal Timeline */}
      <Timeline
        title="Project Timeline"
        periodLabel="2026 — 2027"
        textColor="#0f172a"
        mutedTextColor="#64748b"
        activeColor="#7e22ce"
        backgroundColor="#ffffff"
        imageUrl="/images/vyugam_timeline_official.jpeg"
        imageAlt="Vyugam AI Hackathon Arena"
        duration={1.2}
      />
    </section>
  );
};

export default ProcessFlowSection;
