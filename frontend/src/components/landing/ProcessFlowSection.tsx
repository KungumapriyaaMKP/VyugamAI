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
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-sans">
            Project Timeline <span className="text-[#2e1065]">2026–2027</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl mx-auto">
            Scroll
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
