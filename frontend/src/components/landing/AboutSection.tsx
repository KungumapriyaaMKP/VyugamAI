import React from 'react';
import { ChevronUp } from 'lucide-react';
import { ScrollReveal } from '../common/ScrollReveal';

export const AboutSection: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="about" className="py-16 sm:py-20 bg-white/70 backdrop-blur-[2px] border-y border-slate-200/80 relative scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Style */}
        <ScrollReveal direction="up" distance={20} duration={700} className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-serif">
            Why <span className="text-[#2e1065]">VyugamAI</span>?
          </h2>

          <p className="text-xs sm:text-sm text-purple-600 font-bold tracking-wide">
            Ideas &times; Intelligence &times; Impact
          </p>
        </ScrollReveal>

        {/* Narrative & Story Section */}
        <ScrollReveal direction="up" distance={24} delay={100} duration={750} className="space-y-6 text-slate-800 text-sm sm:text-base leading-relaxed max-w-4xl mx-auto">
          <p className="font-serif text-base sm:text-lg text-slate-900 leading-relaxed font-normal">
            VyugamAI is our premier internal innovation hackathon, organized exclusively for the students of Sri Eshwar College of Engineering by the Department of Artificial Intelligence &amp; Data Science. Conceived to cultivate an active culture of campus innovation and hands-on problem-solving, VyugamAI offers our students a dedicated platform to engineer breakthrough solutions for real-world and campus challenges. By encouraging critical inquiry and collaborative creativity, the hackathon bridges classroom theory with industry-grade software, hardware, and AI development.
          </p>

          <p className="text-slate-600 leading-relaxed">
            Open to students across all engineering branches and academic years, VyugamAI empowers participants to form interdisciplinary teams, ideate boldly, and build functional prototypes under direct faculty and industry mentorship. The initiative serves as a launchpad for practical skills, portfolio enhancement, and project incubation right here at Sri Eshwar, preparing our students to lead and excel in modern technology ecosystems.
          </p>
        </ScrollReveal>

      </div>

      {/* Floating Scroll to Top Button */}
      <div className="absolute bottom-6 right-6">
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-none bg-[#2e1065] hover:bg-purple-900 text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
          title="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>

    </section>
  );
};

export default AboutSection;
