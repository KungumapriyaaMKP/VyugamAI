import React, { useState, useEffect } from 'react';
import { ArrowRight, Calendar, CheckCircle2, Award, Layers } from 'lucide-react';
import { apiClient } from '../api/client';
import { ProcessFlowSection } from '../components/landing/ProcessFlowSection';

interface ProcessPageProps {
  setActiveTab: (tab: string) => void;
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
}

export const ProcessPage: React.FC<ProcessPageProps> = ({ setActiveTab, onOpenAuthModal }) => {
  const [pageData, setPageData] = useState<any>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    apiClient.get('/public/pages/process')
      .then(res => {
        if (res.data.success && res.data.page) {
          setPageData(res.data.page);
        }
      })
      .catch(err => {
        console.warn('Using fallback process data:', err);
      });
  }, []);

  const phases = pageData?.phases || [
    {
      step: 'Stage 01',
      title: 'Team Formation',
      date: 'November – December 2026',
      status: 'Active',
      desc: 'Assemble teams of 4 students, verify college ID credentials, and finalize official team registration profiles.'
    },
    {
      step: 'Stage 02',
      title: 'Problem Statement Selection',
      date: 'December 2026',
      status: 'Upcoming',
      desc: 'Explore curated real-world problem statements across AI, CyberSecurity, FinTech, and IoT to claim track bounties.'
    },
    {
      step: 'Stage 03',
      title: 'Idea & Architecture Blueprint',
      date: 'December 2026 – January 2027',
      status: 'Upcoming',
      desc: 'Prepare the technical architecture presentation PPT, system block diagrams, and submit comprehensive engineering proposals.'
    },
    {
      step: 'Stage 04',
      title: 'Prototype & Code Walkthrough',
      date: 'January – February 2027',
      status: 'Upcoming',
      desc: 'Build full working code models, submit GitHub repositories, and deliver video walkthrough demonstrations.'
    },
    {
      step: 'Stage 05',
      title: '24-Hour Grand Finale Hackathon',
      date: 'February – March 2027',
      status: 'Grand Finale',
      desc: 'Continuous physical 24-hour hackathon live on campus at Sri Eshwar College with expert juries and grand awards.'
    }
  ];

  const rubrics = pageData?.rubrics || [
    { criteria: 'Originality & Innovation', weight: '25%' },
    { criteria: 'AI & Technical Complexity', weight: '25%' },
    { criteria: 'Practical Feasibility & Scalability', weight: '20%' },
    { criteria: 'UI/UX & User Experience', weight: '15%' },
    { criteria: 'Demo Defense & Q&A Pitch', weight: '15%' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Page Header */}
      <section className="bg-gradient-to-b from-white via-purple-50/40 to-slate-50 border-b border-slate-200 py-12 lg:py-16 relative overflow-hidden">
        <div className="absolute inset-0 vyugam-network-bg opacity-30 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <button onClick={() => setActiveTab('home')} className="hover:text-[#2e1065] transition-colors cursor-pointer">
              Home
            </button>
            <span>/</span>
            <span className="text-[#2e1065]">Project Implementation</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-purple-50 border border-purple-200 text-[#2e1065] text-xs font-bold shadow-xs">
            <Layers className="w-3.5 h-3.5 text-purple-700" />
            <span>COMPREHENSIVE COMPETITION ROADMAP</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#2e1065] tracking-tight font-serif">
            Project <span className="text-purple-700">Implementation</span> & Roadmap
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-3xl">
            {pageData?.subtitle || 'From Idea Inception to the 24-Hour Physical Grand Finale at Sri Eshwar College of Engineering'}
          </p>
        </div>
      </section>

      {/* Main Roadmap & Phases Content */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 space-y-16">
          
          {/* Phase Cards Timeline */}
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2e1065] font-serif">
                4-Stage <span className="text-purple-700">Hackathon Journey</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Each milestone is reviewed transparently by our academic and industry jury panels.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {phases.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-none p-6 border border-slate-200 hover:border-[#2e1065] hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 relative group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#2e1065] font-mono tracking-wider">
                        {item.step}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-none ${
                        item.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#2e1065] transition-colors leading-snug">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-[#2e1065]" />
                      <span>{item.date}</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center gap-1 text-[11px] font-bold text-[#2e1065]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Milestone #{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluation Rubrics & Criteria */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50 p-8 sm:p-10 rounded-none border border-slate-200">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-purple-100 text-[#2e1065] text-xs font-bold">
                <Award className="w-3.5 h-3.5 text-purple-700" />
                <span>OFFICIAL EVALUATION METRICS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2e1065] font-serif">
                How Will Your Idea Be <span className="text-purple-700">Evaluated</span>?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Jury scores are calculated systematically against five weighted dimensions to ensure equitable, merit-based selection.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setActiveTab('problems')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-none bg-[#2e1065] hover:bg-[#3b0764] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <span>Select Problem Statement</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {onOpenAuthModal && (
                  <button
                    onClick={() => onOpenAuthModal('register')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-none bg-[#0a2540] hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>Register Team</span>
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-6 space-y-3">
              {rubrics.map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3.5 bg-white rounded-none border border-slate-200 shadow-xs">
                  <span className="text-xs sm:text-sm font-bold text-slate-800">{r.criteria}</span>
                  <span className="text-xs sm:text-sm font-black font-mono text-[#2e1065] bg-purple-50 px-2.5 py-1 rounded-none border border-purple-200">
                    {r.weight}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Process Flow Timeline with Flag Indicator */}
      <ProcessFlowSection />

    </div>
  );
};
