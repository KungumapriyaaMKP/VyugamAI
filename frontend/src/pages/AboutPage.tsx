import React, { useState, useEffect } from 'react';
import { ArrowRight, Brain, Users, Trophy, Target, Compass, Building2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { StatsBanner } from '../components/common/StatsBanner';

interface AboutPageProps {
  setActiveTab: (tab: string) => void;
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ setActiveTab, onOpenAuthModal }) => {
  const [pageData, setPageData] = useState<any>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    apiClient.get('/public/pages/about')
      .then(res => {
        if (res.data.success && res.data.page) {
          setPageData(res.data.page);
        }
      })
      .catch(err => {
        console.warn('Using default about page data:', err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Page Header / Breadcrumb Hero */}
      <section className="bg-gradient-to-b from-white via-sky-50/40 to-slate-50 border-b border-slate-200 py-12 lg:py-16 relative overflow-hidden">
        <div className="absolute inset-0 vyugam-network-bg opacity-30 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <button onClick={() => setActiveTab('home')} className="hover:text-[#1755a7] transition-colors cursor-pointer">
              Home
            </button>
            <span>/</span>
            <span className="text-[#1755a7]">About VyugamAI</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0a2540] tracking-tight font-serif">
            Why <span className="text-[#1755a7]">VyugamAI</span>?
          </h1>

          <p className="text-base sm:text-lg text-[#1755a7] font-bold max-w-3xl">
            Ideas × Intelligence × Impact
          </p>
        </div>
      </section>

      {/* Main Narrative & Story Section */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Story Text */}
            <div className="lg:col-span-8 space-y-6 text-slate-800 text-base sm:text-lg leading-relaxed">
              <p className="font-serif text-lg sm:text-xl text-slate-900 leading-relaxed font-normal">
                {pageData?.paragraphs?.[0] || `VyugamAI is our premier internal innovation hackathon, organized exclusively for the students of Sri Eshwar College of Engineering by the Department of Artificial Intelligence & Data Science. Conceived to cultivate an active culture of campus innovation and hands-on problem-solving, VyugamAI offers our students a dedicated platform to engineer breakthrough solutions for real-world and campus challenges. By encouraging critical inquiry and collaborative creativity, the hackathon bridges classroom theory with industry-grade software, hardware, and AI development.`}
              </p>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {pageData?.paragraphs?.[1] || `Open to students across all engineering branches and academic years, VyugamAI empowers participants to form interdisciplinary teams, ideate boldly, and build functional prototypes under direct faculty and industry mentorship. The initiative serves as a launchpad for practical skills, portfolio enhancement, and project incubation right here at Sri Eshwar, preparing our students to lead and excel in modern technology ecosystems.`}
              </p>

              {/* Mission & Vision Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-none space-y-3">
                  <div className="w-10 h-10 rounded-none bg-blue-100/70 text-[#1755a7] flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#0a2540]">Our Mission</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {pageData?.mission || 'To cultivate a campus-wide hub of deep-tech innovation where Sri Eshwar engineering students transform conceptual AI and engineering theories into tangible, high-impact solutions.'}
                  </p>
                </div>

                <div className="p-6 bg-slate-50 border border-slate-200 rounded-none space-y-3">
                  <div className="w-10 h-10 rounded-none bg-sky-100/70 text-[#1755a7] flex items-center justify-center">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#0a2540]">Our Vision</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {pageData?.vision || 'To pioneer student-driven research, collaboration, and entrepreneurship across all departments at Sri Eshwar College of Engineering.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Fact Sidebar Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#061826] text-white p-7 rounded-none shadow-xl space-y-6 border border-slate-800">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-sky-400 font-bold uppercase tracking-wider">At a Glance</span>
                  <h3 className="text-xl font-bold font-serif text-white">Event Credentials</h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3 pb-3 border-b border-slate-800">
                    <Building2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-slate-400">Host Campus</div>
                      <div className="font-bold text-white mt-0.5">Sri Eshwar College of Engineering</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pb-3 border-b border-slate-800">
                    <Brain className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-slate-400">Organizing Body</div>
                      <div className="font-bold text-white mt-0.5">Dept. of AI & Data Science</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pb-3 border-b border-slate-800">
                    <Users className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-slate-400">Eligibility</div>
                      <div className="font-bold text-white mt-0.5">SECE Students (All Departments &amp; Years)</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Trophy className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-slate-400">Grand Finale</div>
                      <div className="font-bold text-white mt-0.5">24-Hour Offline Physical Hackathon</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => setActiveTab('problems')}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-none bg-[#1755a7] hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>View Problem Statements</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {onOpenAuthModal && (
                    <button
                      onClick={() => onOpenAuthModal('register')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-none bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                    >
                      <span>Register Team</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Pillars of Innovation */}
          <div className="space-y-6 pt-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a2540] font-serif">
                Pillars of <span className="text-[#1755a7]">Innovation</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Core values anchoring the VyugamAI hackathon experience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Practical Problem Solving',
                  desc: 'Tackling real-world challenges curated by industry pioneers, government bodies, and social enterprises.',
                  icon: Brain,
                  tag: 'Real-world Focus'
                },
                {
                  title: 'Industry & Jury Mentorship',
                  desc: 'Direct interaction and guidance from senior AI researchers, tech leads, and venture investors.',
                  icon: Users,
                  tag: 'Expert Guidance'
                },
                {
                  title: 'Incubation & Grand Prizes',
                  desc: 'Cash awards, startup incubation pathways, and intellectual property support for winning teams.',
                  icon: Trophy,
                  tag: 'Ecosystem Backing'
                }
              ].map((pillar, i) => (
                <div key={i} className="p-6 bg-slate-50 border border-slate-200 rounded-none hover:border-blue-300 hover:shadow-md transition-all space-y-4">
                  <div className="w-12 h-12 rounded-none bg-white border border-slate-200 text-[#1755a7] flex items-center justify-center shadow-xs">
                    <pillar.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#1755a7] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-none border border-blue-200">
                      {pillar.tag}
                    </span>
                    <h4 className="text-lg font-bold text-[#0a2540] mt-2">{pillar.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Embedded Live Stats Banner on About Page */}
      <div className="bg-slate-50">
        <StatsBanner />
      </div>

    </div>
  );
};
