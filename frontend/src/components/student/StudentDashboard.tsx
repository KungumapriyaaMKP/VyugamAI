import React, { useEffect, useState } from 'react';
import { Users, FileText, Plus } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { PencilLoader } from '../ui/loader-1';
import type { Team } from '../../types';
import { CreateTeamModal } from './CreateTeamModal';
import { IdeaSubmissionForm } from './IdeaSubmissionForm';

export const StudentDashboard: React.FC = () => {
  const { user, switchDemoRole } = useAuth();
  const [teamData, setTeamData] = useState<Team | null>(null);
  const [hasTeam, setHasTeam] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'submission'>('roster');

  const fetchTeam = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/teams/my-team');
      if (res.data.success) {
        setHasTeam(res.data.hasTeam);
        setTeamData(res.data.team);
      }
    } catch (err) {
      console.error('Error fetching team:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const leaderDisplayName = (() => {
    const leaderMember = teamData?.members?.find((m: any) => 
      m.is_leader || 
      (m.role_in_team && m.role_in_team.toLowerCase().includes('lead')) ||
      (m.role && m.role.toLowerCase().includes('lead'))
    );
    if (leaderMember?.name) {
      return leaderMember.name.replace(/\(.*?\)/g, '').trim();
    }
    if ((teamData as any)?.leader_name) {
      return (teamData as any).leader_name.replace(/\(.*?\)/g, '').trim();
    }
    if (user?.name) {
      return user.name.replace(/\(.*?\)/g, '').trim();
    }
    return 'Leader';
  })();

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <PencilLoader size={160} text="Loading Student Portal Dashboard..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-16 max-w-2xl mx-auto px-4">
        <div className="bg-white p-8 sm:p-10 rounded-none text-center border border-slate-200 space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-purple-50 border border-purple-200 rounded-none flex items-center justify-center mx-auto text-[#2e1065]">
            <Users className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 font-serif">Student Portal Access</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Please sign in with your official Sri Eshwar College of Engineering (@sece.ac.in) student account to form or manage your 4-member hackathon team.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                window.location.hash = '#login';
              }}
              className="w-full sm:w-auto px-6 py-3 bg-[#2e1065] hover:bg-[#3b0764] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              Sign In with SECE Mail
            </button>
            <button
              onClick={async () => {
                await switchDemoRole('student');
                fetchTeam();
              }}
              className="w-full sm:w-auto px-6 py-3 bg-purple-50 hover:bg-purple-100 text-[#2e1065] border border-purple-200 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Quick Demo Login (Arjun Vikram)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasTeam) {
    return (
      <div className="py-12 max-w-4xl mx-auto px-4">
        <div className="bg-white p-10 rounded-none text-center border border-slate-200 space-y-6 shadow-2xs">
          <div className="w-16 h-16 bg-purple-50 border border-purple-200 rounded-none flex items-center justify-center mx-auto text-[#2e1065]">
            <Users className="w-8 h-8" />
          </div>

          <div className="max-w-lg mx-auto space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-sans font-bold text-slate-800 tracking-tight flex items-center justify-center gap-2.5">
              <span>Hello,</span>
              <span className="font-serif italic font-normal tracking-tight vyugam-shimmer-text text-3xl sm:text-4xl">
                {leaderDisplayName}
              </span>
            </h1>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-serif">Register Your Hackathon Team</h2>
            <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
              Form a team of exactly 4 students to select problem statements, collaborate on code repositories, and submit project proposals for Vyugam AI evaluation.
            </p>
          </div>

          <button
            onClick={() => setIsTeamModalOpen(true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-none bg-[#2e1065] hover:bg-[#3b0764] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5 text-white" />
            <span>Create Team Now</span>
          </button>

          <CreateTeamModal
            isOpen={isTeamModalOpen}
            onClose={() => setIsTeamModalOpen(false)}
            onSuccess={fetchTeam}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-none border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-none uppercase">
              Team Portal
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-none">
              Status: {teamData?.status?.toUpperCase()}
            </span>
          </div>

          <div className="pt-0.5 space-y-0.5">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-sans font-bold text-slate-800 tracking-tight flex flex-wrap items-baseline gap-2.5">
              <span>Hello,</span>
              <span className="font-serif italic font-normal tracking-tight vyugam-shimmer-text text-3xl sm:text-4xl md:text-5xl">
                {leaderDisplayName}
              </span>
            </h1>
            <h2 className="text-xl md:text-2xl font-black text-[#2e1065] font-sans">
              Team {teamData?.name}
            </h2>
          </div>

          <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <span>Sri Eshwar College of Engineering</span>
            <span>&bull;</span>
            <span>Track: <strong className="text-slate-800">{teamData?.track}</strong></span>
          </p>
        </div>

        {/* Selected Problem Statement Indicator */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 max-w-md w-full relative z-10">
          <div className="text-[11px] uppercase font-bold text-slate-500 mb-1 flex items-center justify-between">
            <span>Selected Problem Statement</span>
            <span className="text-[#1755a7] font-mono font-bold">{teamData?.problem_statement_id || 'Not Selected'}</span>
          </div>
          <p className="text-xs font-semibold text-slate-800 truncate">
            {teamData?.problem_title || 'No problem statement selected yet. Explore PS portal to lock one.'}
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('roster')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'roster' ? 'bg-blue-50 text-[#1755a7] border border-blue-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Roster ({teamData?.members?.length || 0} Members)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('submission')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'submission' ? 'bg-blue-50 text-[#1755a7] border border-blue-200' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Idea Submission & PPT</span>
        </button>
      </div>

      {/* Tab Content 1: Roster */}
      {activeSubTab === 'roster' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamData?.members.map((m, idx) => (
              <div key={m.id || idx} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 relative shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1755a7] font-bold text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0a2540]">{m.name}</h4>
                      <p className="text-[11px] text-slate-500">{m.email}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Role:</span> <strong className="text-slate-800">{m.role_in_team}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Gender:</span> <strong className="text-slate-800">{m.gender}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 2: Proposal Submission Form */}
      {activeSubTab === 'submission' && (
        <IdeaSubmissionForm
          existingSubmission={teamData?.submission}
          onSuccess={fetchTeam}
        />
      )}

    </div>
  );
};
