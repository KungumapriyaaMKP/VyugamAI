import React, { useEffect, useState } from 'react';
import {
  Plus,
  Trophy,
  Users,
  FileText,
  Layers,
  Megaphone,
  Search,
  Download,
  RefreshCw,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Award,
  Send,
  Sparkles,
  Shield,
  Lock,
  User,
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { PencilLoader } from '../ui/loader-1';
import { ManageProblemsModal } from './ManageProblemsModal';

export const AdminDashboard: React.FC = () => {
  const { user, login } = useAuth();
  const [adminName, setAdminName] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminLoginErr, setAdminLoginErr] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [data, setData] = useState<any>(null);
  const [problems, setProblems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddPsOpen, setIsAddPsOpen] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState<'teams' | 'submissions' | 'problems' | 'leaderboard'>('teams');
  const [searchQuery, setSearchQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState<'All' | 'Software' | 'Hardware'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Inline Evaluation Scoring State
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [savingEvalId, setSavingEvalId] = useState<string | null>(null);

  // Announcement Broadcaster State
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annCategory, setAnnCategory] = useState('Urgent');
  const [isPostingAnn, setIsPostingAnn] = useState(false);

  // Toast feedback banner
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, psRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/problems'),
      ]);

      const psList: any[] = psRes.data?.problems || [];
      setProblems(psList);

      if (statsRes.data?.success) {
        const rawData = statsRes.data;
        const teamsMap = new Map<string, any>();

        (rawData.teams || []).forEach((t: any) => {
          teamsMap.set(t.id, t);
        });

        // Also merge any localStorage teams so teams registered in this browser always appear immediately
        const savedPsRaw = localStorage.getItem('vyugam_selected_ps');
        const savedPs = savedPsRaw
          ? (() => {
              try {
                return JSON.parse(savedPsRaw);
              } catch {
                return null;
              }
            })()
          : null;

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('vyugam_team_')) {
            try {
              const lt = JSON.parse(localStorage.getItem(key) || '{}');
              if (lt && lt.id) {
                if (savedPs?.id && !lt.problem_statement_id) {
                  lt.problem_statement_id = savedPs.id;
                  lt.problem_title = savedPs.title;
                  lt.problem_category = savedPs.category;
                }
                const matchedPs = psList.find((p) => p.id === lt.problem_statement_id);
                teamsMap.set(lt.id, {
                  ...lt,
                  leader_name: lt.leader_name || lt.members?.[0]?.name || 'Team Lead',
                  leader_email: lt.leader_email || lt.members?.[0]?.email || '',
                  problem_title: lt.problem_title || matchedPs?.title || null,
                  problem_category: lt.problem_category || matchedPs?.category || null,
                  members: lt.members || [],
                  member_count: (lt.members || []).length,
                });
              }
            } catch {
              // ignore
            }
          }
        }

        const mergedTeams = Array.from(teamsMap.values());

        // Merge submissions from backend + local teams
        const subsMap = new Map<string, any>();
        (rawData.submissions || []).forEach((s: any) => subsMap.set(s.id, s));
        mergedTeams.forEach((t: any) => {
          if (t.submission && t.submission.id) {
            const matchedPs = psList.find((p) => p.id === (t.submission.problem_statement_id || t.problem_statement_id));
            subsMap.set(t.submission.id, {
              ...t.submission,
              team_name: t.name,
              team_track: t.track || 'Software',
              college: t.college || 'Sri Eshwar College of Engineering',
              problem_statement_id: t.submission.problem_statement_id || t.problem_statement_id || 'VYUGAM-001',
              problem_title: matchedPs?.title || t.problem_title || 'Problem Statement',
            });
          }
        });

        const customScoresRaw = localStorage.getItem('vyugam_admin_scores');
        const customScores: Record<string, { score: number; feedback: string }> = customScoresRaw
          ? JSON.parse(customScoresRaw)
          : {};

        const mergedSubmissions = Array.from(subsMap.values()).map((s: any) => ({
          ...s,
          avg_score: customScores[s.id]?.score ?? s.avg_score ?? null,
          feedback_remarks: customScores[s.id]?.feedback ?? s.feedback_remarks ?? '',
        }));

        const initialScores: Record<string, string> = {};
        const initialFeedback: Record<string, string> = {};
        mergedSubmissions.forEach((s: any) => {
          if (s.avg_score !== null && s.avg_score !== undefined) {
            initialScores[s.id] = String(Math.round(Number(s.avg_score)));
          }
          if (s.feedback_remarks) {
            initialFeedback[s.id] = s.feedback_remarks;
          }
        });
        setScoreInputs(initialScores);
        setFeedbackInputs(initialFeedback);

        const totalMembers = mergedTeams.reduce(
          (sum, t) => sum + (t.members?.length || t.member_count || 4),
          0
        );

        setData({
          ...rawData,
          teams: mergedTeams,
          submissions: mergedSubmissions,
          stats: {
            ...rawData.stats,
            totalTeams: mergedTeams.length,
            totalStudents: Math.max(totalMembers, rawData.stats?.totalStudents || 0),
            totalSubmissions: mergedSubmissions.length,
            totalProblemStatements: psList.length || rawData.stats?.totalProblemStatements || 8,
            totalEvaluated: mergedSubmissions.filter((s) => s.avg_score !== null && s.avg_score !== undefined).length,
          },
        });
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateTeamStatus = async (teamId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/admin/teams/${teamId}/status`, { status: newStatus });
      showToast(`Team status updated to ${newStatus.toUpperCase()}`);
      fetchAdminData();
    } catch (err) {
      console.error('Error updating team status:', err);
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    try {
      await apiClient.delete(`/admin/teams/${teamId}`);
      showToast(`Removed ${teamName}`);
      fetchAdminData();
    } catch (err) {
      console.error('Error deleting team:', err);
    }
  };

  const handleDeleteProblem = async (psId: string) => {
    try {
      await apiClient.delete(`/problems/${psId}`);
      showToast(`Deleted Problem Statement ${psId}`);
      fetchAdminData();
    } catch (err) {
      console.error('Error deleting problem:', err);
    }
  };

  const handleSaveScore = async (submissionId: string) => {
    const rawScore = scoreInputs[submissionId];
    if (rawScore === undefined || rawScore === '') return;
    const numScore = Math.max(0, Math.min(100, Number(rawScore)));
    try {
      setSavingEvalId(submissionId);
      await apiClient.post('/admin/evaluate', {
        submission_id: submissionId,
        score: numScore,
        feedback: feedbackInputs[submissionId] || 'Evaluated by Admin Panel',
      });
      showToast(`Saved score (${numScore}/100) to Live Leaderboard!`);
      await fetchAdminData();
    } catch (err) {
      console.error('Error saving score:', err);
    } finally {
      setSavingEvalId(null);
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    try {
      setIsPostingAnn(true);
      await apiClient.post('/admin/announcements', {
        title: annTitle.trim(),
        message: annMessage.trim(),
        category: annCategory,
        is_banner: 1,
      });
      setAnnTitle('');
      setAnnMessage('');
      showToast('Announcement published to live ticker banner!');
      fetchAdminData();
    } catch (err) {
      console.error('Error posting announcement:', err);
    } finally {
      setIsPostingAnn(false);
    }
  };

  const handleDeleteAnnouncement = async (annId: string) => {
    try {
      await apiClient.delete(`/admin/announcements/${annId}`);
      showToast('Announcement removed');
      fetchAdminData();
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  const handleExportCSV = () => {
    const teams: any[] = data?.teams || [];
    const headers = [
      'Team ID',
      'Team Name',
      'Track',
      'Status',
      'Problem ID',
      'Problem Title',
      'Leader Name',
      'Leader Email',
      'Roster Members',
    ];
    const rows = teams.map((t) => {
      const rosterStr = (t.members || [])
        .map((m: any) => `${m.name} (${m.college_id_no || 'SECE'} - ${m.role_in_team || 'Member'})`)
        .join(' | ');
      return [
        t.id,
        `"${(t.name || '').replace(/"/g, '""')}"`,
        t.track || 'Software',
        t.status || 'forming',
        t.problem_statement_id || 'Not Selected',
        `"${(t.problem_title || '').replace(/"/g, '""')}"`,
        `"${(t.leader_name || '').replace(/"/g, '""')}"`,
        t.leader_email || '',
        `"${rosterStr.replace(/"/g, '""')}"`,
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vyugam_ai_teams_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Registered Teams CSV!');
  };

  const handleAdminGateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminName.trim().toLowerCase() !== 'vyugamadmin') {
      setAdminLoginErr('Invalid Admin Name. Please enter VyugamAdmin.');
      return;
    }
    if (adminPass !== 'VyugamAI2026@password123') {
      setAdminLoginErr('Invalid Admin Password.');
      return;
    }
    try {
      setIsLoggingIn(true);
      setAdminLoginErr(null);
      const res = await login('VyugamAdmin', adminPass);
      if (res.success) {
        fetchAdminData();
      } else {
        setAdminLoginErr(res.error || 'Admin login failed.');
      }
    } catch {
      setAdminLoginErr('Failed to authenticate Admin.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="py-16 max-w-md mx-auto px-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6 shadow-lg">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-center mx-auto text-[#2e1065]">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-serif">Admin Control Center</h2>
            <p className="text-xs text-slate-500">
              Sign in with official Vyugam AI Coordinator credentials to access the Admin Panel.
            </p>
          </div>

          {adminLoginErr && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {adminLoginErr}
            </div>
          )}

          <form onSubmit={handleAdminGateLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Admin Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="VyugamAdmin"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-[#2e1065] hover:bg-[#3b0764] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <PencilLoader size={160} text="Loading Admin Control Center..." />
      </div>
    );
  }

  const stats = data?.stats || {};
  const allTeams: any[] = data?.teams || [];
  const allSubmissions: any[] = data?.submissions || [];
  const announcements: any[] = data?.announcements || [];

  const filteredTeams = allTeams.filter((t) => {
    if (trackFilter !== 'All' && t.track !== trackFilter) return false;
    if (statusFilter !== 'All' && (t.status || 'forming').toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTeam =
        (t.name || '').toLowerCase().includes(q) ||
        (t.leader_name || '').toLowerCase().includes(q) ||
        (t.leader_email || '').toLowerCase().includes(q) ||
        (t.problem_statement_id || '').toLowerCase().includes(q) ||
        (t.problem_title || '').toLowerCase().includes(q) ||
        (t.members || []).some(
          (m: any) =>
            (m.name || '').toLowerCase().includes(q) ||
            (m.email || '').toLowerCase().includes(q) ||
            (m.college_id_no || '').toLowerCase().includes(q)
        );
      if (!matchTeam) return false;
    }
    return true;
  });

  // Compute live ranked leaderboard from scored submissions + backend topTeams
  const rankedLeaderboard = (() => {
    const scoredSubs = allSubmissions
      .filter((s) => s.avg_score !== null && s.avg_score !== undefined)
      .map((s) => ({
        team_name: s.team_name,
        college: s.college || 'Sri Eshwar College of Engineering',
        track: s.team_track || 'Software',
        idea_title: s.idea_title,
        problem_statement_id: s.problem_statement_id,
        avg_score: Number(s.avg_score),
      }));

    if (scoredSubs.length > 0) {
      return scoredSubs.sort((a, b) => b.avg_score - a.avg_score);
    }
    return data?.topTeams || [];
  })();

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Live Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-emerald-700 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Admin Command Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-none border border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-purple-800 bg-purple-50 border border-purple-200 px-3 py-1 rounded-none uppercase">
              Admin Control Center
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-none flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase Live Sync Active</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-sans font-black text-slate-900 tracking-tight">
            Vyugam AI Hackathon{' '}
            <span className="font-serif italic font-normal vyugam-shimmer-text">Command Panel</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Manage registered student teams, inspect 4-member rosters & locked problem statements, evaluate idea submissions, publish challenges, and broadcast live announcements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10 w-full lg:w-auto">
          <button
            onClick={fetchAdminData}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            title="Refresh live data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Teams CSV</span>
          </button>

          <button
            onClick={() => setIsAddPsOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2e1065] hover:bg-[#3b0764] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Publish Problem Statement</span>
          </button>
        </div>
      </div>

      {/* 4 Key Admin KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Registered Teams',
            val: stats.totalTeams || allTeams.length,
            sub: `${allTeams.filter((t) => t.track === 'Software').length} Software • ${allTeams.filter((t) => t.track === 'Hardware').length} Hardware`,
            icon: Users,
            tab: 'teams' as const,
          },
          {
            label: 'Total Participants',
            val: stats.totalStudents || allTeams.length * 4,
            sub: '4-Member Verified Squads (SECE)',
            icon: Sparkles,
            tab: 'teams' as const,
          },
          {
            label: 'Idea Proposals',
            val: stats.totalSubmissions || allSubmissions.length,
            sub: `${allTeams.filter((t) => t.status === 'shortlisted').length} Shortlisted for Finale`,
            icon: FileText,
            tab: 'submissions' as const,
          },
          {
            label: 'Problem Statements',
            val: problems.length || stats.totalProblemStatements || 8,
            sub: 'Active Hackathon Challenges',
            icon: Layers,
            tab: 'problems' as const,
          },
        ].map((st, idx) => {
          const IconComponent = st.icon;
          return (
            <div
              key={idx}
              onClick={() => setActiveSubTab(st.tab)}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-purple-300 shadow-xs cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>{st.label}</span>
                <IconComponent className="w-4 h-4 text-purple-700 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#2e1065] font-mono my-1.5">{st.val}</div>
              <div className="text-[11px] text-slate-500 font-medium">{st.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'teams', label: `Registered Teams & Rosters (${allTeams.length})`, icon: Users },
          { id: 'submissions', label: `Idea Submissions & Scoring (${allSubmissions.length})`, icon: FileText },
          { id: 'problems', label: `Problem Statements (${problems.length})`, icon: Layers },
          { id: 'leaderboard', label: 'Leaderboard & Announcements', icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#2e1065] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: REGISTERED TEAMS & ROSTERS */}
      {activeSubTab === 'teams' && (
        <div className="space-y-5">
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by team name, leader name, email, roll number (e.g. 24AD001), or PS ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="All">All Tracks</option>
                <option value="Software">Software Track</option>
                <option value="Hardware">Hardware Track</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="forming">Forming</option>
                <option value="submitted">Submitted</option>
                <option value="shortlisted">Shortlisted</option>
              </select>
            </div>
          </div>

          {filteredTeams.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No matching teams found</h4>
              <p className="text-xs text-slate-500">Try clearing your search filter or register a new team from the Team Portal.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTeams.map((team: any) => (
                <div
                  key={team.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-purple-200 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black text-[#2e1065]">Team {team.name}</h3>
                        <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold bg-blue-50 text-[#1755a7] border border-blue-200 rounded-md">
                          {team.track || 'Software'}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase rounded-md border ${
                            team.status === 'shortlisted'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : team.status === 'submitted'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}
                        >
                          {team.status || 'forming'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Lead: <strong className="text-slate-800">{team.leader_name}</strong> ({team.leader_email || 'SECE'}) &bull;{' '}
                        {team.college || 'Sri Eshwar College of Engineering'}
                      </p>
                    </div>

                    {/* Locked Problem Statement & Quick Admin Status Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                        <span className="text-slate-400 font-semibold mr-1.5">Locked PS:</span>
                        <span className="font-mono font-bold text-[#1755a7]">
                          {team.problem_statement_id || 'Not Selected'}
                        </span>
                        {team.problem_title && (
                          <span className="text-slate-600 ml-1.5 hidden sm:inline">
                            — {team.problem_title.slice(0, 42)}
                            {team.problem_title.length > 42 ? '...' : ''}
                          </span>
                        )}
                      </div>

                      {team.status !== 'shortlisted' ? (
                        <button
                          onClick={() => handleUpdateTeamStatus(team.id, 'shortlisted')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Shortlist Team</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateTeamStatus(team.id, 'submitted')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Remove Shortlist
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteTeam(team.id, team.name)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Team"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 4-Member Roster Grid */}
                  {team.members && team.members.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {team.members.map((m: any, idx: number) => (
                        <div
                          key={m.id || idx}
                          className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 truncate">{m.name}</span>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-white border border-slate-200 text-purple-800 rounded">
                              {m.college_id_no || `24AD00${idx + 1}`}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">{m.email}</div>
                          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-600">
                            <span>{m.role_in_team || 'Developer'}</span>
                            <span className="font-semibold">{m.gender || 'Student'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: IDEA SUBMISSIONS & JURY SCORING */}
      {activeSubTab === 'submissions' && (
        <div className="space-y-4">
          {allSubmissions.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No Idea Proposals Submitted Yet</h4>
              <p className="text-xs text-slate-500">
                Once teams submit their Idea Proposal & PPT in the Team Portal, they will appear here for evaluation.
              </p>
            </div>
          ) : (
            allSubmissions.map((sub: any) => (
              <div
                key={sub.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-purple-50 text-purple-900 border border-purple-200 rounded-md">
                        {sub.problem_statement_id || 'VYUGAM-001'}
                      </span>
                      <h3 className="text-lg font-black text-slate-900">{sub.idea_title}</h3>
                    </div>
                    <p className="text-xs text-slate-500">
                      Submitted by <strong className="text-[#2e1065]">Team {sub.team_name}</strong> ({sub.team_track || 'Software'}) &bull;{' '}
                      Problem: <strong className="text-slate-700">{sub.problem_title}</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {sub.ppt_url && (
                      <a
                        href={sub.ppt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1755a7] border border-blue-200 rounded-xl text-xs font-bold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View PPT Deck</span>
                      </a>
                    )}
                    {sub.github_url && (
                      <a
                        href={sub.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>GitHub Repo</span>
                      </a>
                    )}
                    {sub.demo_video_url && (
                      <a
                        href={sub.demo_video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Demo Video</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">Executive Summary</div>
                    <p className="text-slate-600 leading-relaxed">{sub.executive_summary}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                      Proposed Architecture & Tech Stack
                    </div>
                    <p className="text-slate-600 leading-relaxed">{sub.proposed_solution}</p>
                    {sub.tech_stack && (
                      <p className="pt-1 text-[11px] font-mono font-bold text-[#1755a7]">
                        Stack: {sub.tech_stack}
                      </p>
                    )}
                  </div>
                </div>

                {/* Inline Admin Evaluation & Scoring Bar */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-purple-50/40 p-3.5 rounded-xl border border-purple-100">
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-800">Jury Score (0–100):</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={scoreInputs[sub.id] ?? ''}
                        onChange={(e) => setScoreInputs({ ...scoreInputs, [sub.id]: e.target.value })}
                        placeholder="92"
                        className="w-20 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-[#2e1065] focus:outline-none focus:border-purple-600"
                      />
                    </div>
                    <input
                      type="text"
                      value={feedbackInputs[sub.id] ?? ''}
                      onChange={(e) => setFeedbackInputs({ ...feedbackInputs, [sub.id]: e.target.value })}
                      placeholder="Add jury evaluation remarks..."
                      className="flex-1 min-w-[200px] px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <button
                    onClick={() => handleSaveScore(sub.id)}
                    disabled={savingEvalId === sub.id}
                    className="px-4 py-2 bg-[#2e1065] hover:bg-[#3b0764] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {savingEvalId === sub.id ? 'Saving...' : 'Save Score to Leaderboard'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: PROBLEM STATEMENTS MANAGER */}
      {activeSubTab === 'problems' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Problem Statements ({problems.length})</h3>
              <p className="text-xs text-slate-500">
                Publish new hackathon problem statements or manage existing challenges across Software & Hardware domains.
              </p>
            </div>
            <button
              onClick={() => setIsAddPsOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2e1065] hover:bg-[#3b0764] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Problem Statement</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase font-mono font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">PS Code</th>
                    <th className="p-3.5">Title</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Domain</th>
                    <th className="p-3.5">Complexity</th>
                    <th className="p-3.5">Organization</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {problems.map((ps: any) => (
                    <tr key={ps.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#1755a7] whitespace-nowrap">{ps.id}</td>
                      <td className="p-3.5 font-bold text-slate-900 max-w-xs">{ps.title}</td>
                      <td className="p-3.5 text-slate-600">{ps.category}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-purple-50 text-purple-800 border border-purple-200">
                          {ps.domain_bucket}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold">{ps.complexity}</td>
                      <td className="p-3.5 text-slate-500">{ps.organization}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteProblem(ps.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Problem Statement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LEADERBOARD & ANNOUNCEMENTS */}
      {activeSubTab === 'leaderboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Live Evaluator Score Leaderboard */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#2e1065]" />
                <h3 className="text-base font-bold text-slate-900">Live Evaluator Score Leaderboard</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">Ranked Out of 100</span>
            </div>

            {rankedLeaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-mono font-bold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Rank</th>
                      <th className="p-3">Team Name</th>
                      <th className="p-3">Idea Title</th>
                      <th className="p-3">PS ID</th>
                      <th className="p-3 text-right">Jury Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rankedLeaderboard.map((team: any, idx: number) => (
                      <tr key={idx} className="hover:bg-purple-50/30 transition-colors">
                        <td className="p-3 font-mono font-black text-[#2e1065]">#{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900">{team.team_name}</td>
                        <td className="p-3 text-slate-700">{team.idea_title}</td>
                        <td className="p-3 font-mono text-[#1755a7] font-bold">
                          {team.problem_statement_id || 'VYUGAM-001'}
                        </td>
                        <td className="p-3 text-right font-mono font-black text-emerald-700 text-sm">
                          {Math.round(team.avg_score)} / 100
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No evaluations scored yet. Score submissions in the "Idea Submissions & Scoring" tab to populate the leaderboard.
              </div>
            )}
          </div>

          {/* Right Column: Broadcast Live Announcement */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Megaphone className="w-5 h-5 text-purple-700" />
              <h3 className="text-base font-bold text-slate-900">Broadcast Announcement</h3>
            </div>

            <form onSubmit={handlePostAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Headline *</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Round 1 Jury Evaluation Starts at 2:00 PM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Priority Tag</label>
                <select
                  value={annCategory}
                  onChange={(e) => setAnnCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-purple-600"
                >
                  <option value="Urgent">Urgent</option>
                  <option value="General">General</option>
                  <option value="Results">Results</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message Details *</label>
                <textarea
                  rows={3}
                  required
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder="Enter announcement message for all participants..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>

              <button
                type="submit"
                disabled={isPostingAnn}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2e1065] hover:bg-[#3b0764] text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPostingAnn ? 'Broadcasting...' : 'Publish to Live Ticker'}</span>
              </button>
            </form>

            {announcements.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[10px] font-mono uppercase font-bold text-slate-400">Active Announcements</div>
                {announcements.map((a: any) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold text-purple-700 uppercase mr-1.5">
                        [{a.category || 'Notice'}]
                      </span>
                      <strong className="text-slate-900">{a.title}:</strong>{' '}
                      <span className="text-slate-600">{a.message}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer shrink-0"
                      title="Delete announcement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manage PS Modal */}
      <ManageProblemsModal
        isOpen={isAddPsOpen}
        onClose={() => setIsAddPsOpen(false)}
        onSuccess={() => {
          showToast('New Problem Statement published!');
          fetchAdminData();
        }}
      />
    </div>
  );
};
