import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

interface FAQSectionProps {
  setActiveTab?: (tab: string) => void;
}

export const FAQSection: React.FC<FAQSectionProps> = () => {
  const faqs = [
    {
      q: 'Who is eligible to participate in Vyugam AI Hackathon 2026?',
      a: 'All undergraduate and postgraduate students of Sri Eshwar College of Engineering across all engineering, technology, and science departments are eligible to participate.'
    },
    {
      q: 'What is the team size and composition requirement?',
      a: 'Each team must consist of exactly 4 members (1 Team Leader + 3 Members). Multi-disciplinary teams across departments and years are encouraged.'
    },
    {
      q: 'How many problem statements can a team select?',
      a: 'A team can select only one problem statement to ensure focused architectural design, high-quality development, and thorough prototype execution.'
    },
    {
      q: 'Is there any registration fee for the hackathon?',
      a: 'No, registration and initial proposal submission is completely free for all student teams across both software and hardware tracks.'
    },
    {
      q: 'What deliverables are required during proposal submission?',
      a: 'Teams must submit an Executive Summary, Technical Architecture description, PPT Presentation PDF link, and optional GitHub repository URL or demo video.'
    },
    {
      q: 'How does the jury evaluation and scoring process work?',
      a: 'Jury members evaluate submissions across 5 official metrics: Innovation & Uniqueness, Technical Feasibility, Feasibility, UI/UX, and Presentation on a 100-point rubric.'
    }
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 sm:py-24 bg-white border-t border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-purple-50 border border-purple-200 text-[#2e1065] text-xs font-bold tracking-wide uppercase">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>HELP & SUPPORT</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-slate-900 font-serif leading-[1.15] tracking-tight">
              Got Questions?<br />
              <span className="text-[#2e1065]">We've Got Answers.</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-sm">
              Everything you need to know about joining Vyugam AI Hackathon, our problem statements, and the evaluation process.
            </p>
          </div>

          {/* Right Column: Clean Accordion List */}
          <div className="lg:col-span-7 divide-y divide-slate-200">
            {faqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={idx} className="py-6 first:pt-0">
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full text-left flex items-start justify-between gap-6 cursor-pointer group"
                  >
                    <span className="font-serif text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#2e1065] transition-colors leading-snug">
                      {faq.q}
                    </span>
                    <div className={`w-8 h-8 rounded-none flex items-center justify-center shrink-0 transition-all ${
                      isOpen 
                        ? 'bg-[#2e1065] text-white shadow-sm' 
                        : 'bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-[#2e1065]'
                    }`}>
                      {isOpen ? (
                        <Minus className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="pt-4 pr-12 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};
