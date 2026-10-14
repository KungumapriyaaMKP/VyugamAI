import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import type { LiveStats } from '../../types';
import { CountingNumber } from '@/components/ui/counting-number';
import { ScrollReveal } from './ScrollReveal';
import { Users, FolderKanban, Cpu, Trophy } from 'lucide-react';

export const StatsBanner: React.FC = () => {
  const [stats, setStats] = useState<LiveStats>({
    totalTeams: 0,
    totalSubmissions: 0,
    totalStudents: 0,
    totalProblemStatements: 8,
    prizePool: '50000',
    collegesParticipating: '1'
  });

  useEffect(() => {
    apiClient.get('/public/live-stats')
      .then(res => {
        if (res.data.success && res.data.stats) {
          setStats(res.data.stats);
        }
      })
      .catch(() => {});
  }, []);

  const items = [
    { 
      label: 'STUDENT INNOVATORS', 
      sub: 'SECE Engineering Participants',
      target: stats.totalStudents > 0 ? stats.totalStudents : 150,
      prefix: '',
      suffix: '+',
      icon: Users,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50 border-violet-100/80',
      accentGlow: 'group-hover:shadow-violet-500/10 group-hover:border-violet-300',
      tag: 'Registered'
    },
    { 
      label: 'REGISTERED TEAMS', 
      sub: 'Multi-Disciplinary Squads',
      target: stats.totalTeams > 0 ? stats.totalTeams : 40,
      prefix: '',
      suffix: '+',
      icon: FolderKanban,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50 border-indigo-100/80',
      accentGlow: 'group-hover:shadow-indigo-500/10 group-hover:border-indigo-300',
      tag: 'Teams Formed'
    },
    { 
      label: 'PROBLEM TRACKS', 
      sub: 'Curated AI & Hardware Challenges',
      target: stats.totalProblemStatements > 0 ? stats.totalProblemStatements : 8,
      prefix: '',
      suffix: '',
      icon: Cpu,
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-50 border-sky-100/80',
      accentGlow: 'group-hover:shadow-sky-500/10 group-hover:border-sky-300',
      tag: 'Challenge Tracks'
    },
    { 
      label: 'TOTAL PRIZE POOL', 
      sub: 'Grand Finale Awards & Seed Grants',
      target: Number(stats.prizePool) > 0 ? Number(stats.prizePool) : 50000,
      prefix: '₹',
      suffix: '',
      icon: Trophy,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 border-amber-100/80',
      accentGlow: 'group-hover:shadow-amber-500/10 group-hover:border-amber-300',
      tag: 'Cash Rewards'
    },
  ];

  return (
    <section className="py-10 bg-gradient-to-b from-white via-purple-50/20 to-white border-y border-purple-100/80 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#9333ea_0.5px,transparent_0.5px)] opacity-[0.06] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <ScrollReveal
                key={idx}
                delay={idx * 80}
                distance={20}
                duration={600}
                className="h-full"
              >
                <div 
                  className={`relative bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/90 hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between group overflow-hidden ${item.accentGlow}`}
                >
                  {/* Subtle hover gradient blob */}
                  <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-purple-500/5 group-hover:bg-purple-500/10 blur-xl transition-all duration-500 pointer-events-none" />

                  {/* Card Header: Icon & Live Badge */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-xs ${item.iconBg}`}>
                      <IconComponent className={`w-6 h-6 ${item.iconColor}`} />
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300 group-hover:bg-purple-50 group-hover:text-purple-800 group-hover:border-purple-300 transition-colors">
                      <span className="relative flex h-2 w-2 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                      <span>{item.tag}</span>
                    </div>
                  </div>

                  {/* Metric Display */}
                  <div className="mt-5 relative z-10">
                    <div className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 font-sans flex items-baseline">
                      {item.prefix && (
                        <span className="text-2xl sm:text-3xl font-extrabold text-purple-700 mr-0.5">
                          {item.prefix}
                        </span>
                      )}
                      <CountingNumber 
                        target={item.target} 
                        transition={{ duration: 1.8, ease: "easeOut", type: "tween" }} 
                      />
                      {item.suffix && (
                        <span className="text-2xl sm:text-3xl font-extrabold text-purple-700 ml-0.5">
                          {item.suffix}
                        </span>
                      )}
                    </div>

                    <div className="text-xs sm:text-sm font-bold text-slate-800 tracking-wider uppercase mt-2">
                      {item.label}
                    </div>

                    <div className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                      {item.sub}
                    </div>
                  </div>

                  {/* Bottom Accent Bar on hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/0 to-transparent group-hover:via-purple-600 transition-all duration-300" />
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsBanner;
