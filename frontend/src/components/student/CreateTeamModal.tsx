import React, { useState } from 'react';
import { X, Users, Sparkles, AlertCircle, LogIn, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, switchDemoRole } = useAuth();
  const [teamName, setTeamName] = useState('');
  const [college] = useState(user?.college || 'Sri Eshwar College of Engineering');
  const [track, setTrack] = useState('Software');
  
  // Exactly 3 additional members to make a total team of 4 (1 Leader + 3 Members)
  const [members, setMembers] = useState<Array<{ name: string; email: string; role_in_team: string; gender: string; college_id_no: string; year_of_study: string }>>([
    { name: '', email: '', role_in_team: 'Full Stack Developer', gender: 'Female', college_id_no: '', year_of_study: '3rd Year' },
    { name: '', email: '', role_in_team: 'AI / Data Engineer', gender: 'Male', college_id_no: '', year_of_study: '3rd Year' },
    { name: '', email: '', role_in_team: 'UI / UX & Research', gender: 'Female', college_id_no: '', year_of_study: '3rd Year' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleMemberChange = (idx: number, field: string, value: string) => {
    setMembers(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };

  const handleQuickDemoLogin = async () => {
    try {
      setError(null);
      await switchDemoRole('student');
    } catch {
      setError('Failed to switch to student demo account.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be signed in with your @sece.ac.in student account to register a team.');
      return;
    }

    if (!teamName.trim()) {
      setError('Please provide a unique team name.');
      return;
    }

    // Verify all 3 members are provided
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name.trim()) {
        setError(`Student Member #${i + 2} of 4 is missing a full name.`);
        return;
      }
      if (!m.email.trim()) {
        setError(`Student Member #${i + 2} of 4 is missing an email address.`);
        return;
      }

      const email = m.email.trim().toLowerCase();
      if (!email.endsWith('@sece.ac.in')) {
        setError(`Student Member #${i + 2} (${m.email}) must have an official @sece.ac.in email address.`);
        return;
      }

      if (user?.email && email === user.email.trim().toLowerCase()) {
        setError(`Student Member #${i + 2} cannot have the same email as the Team Leader (${user.email}).`);
        return;
      }
    }

    // Check duplicate emails among members
    const memberEmails = members.map(m => m.email.trim().toLowerCase());
    if (new Set(memberEmails).size !== memberEmails.length) {
      setError('Each of the team members must have a distinct, unique email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await apiClient.post('/teams/create', {
        name: teamName.trim(),
        college,
        track,
        members: members.map(m => ({
          name: m.name.trim(),
          email: m.email.trim().toLowerCase(),
          role_in_team: m.role_in_team,
          gender: m.gender,
          college_id_no: m.college_id_no.trim() || 'SECE-MEM',
          year_of_study: m.year_of_study
        }))
      });

      if (res.data.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.data.error || 'Failed to create team.');
      }
    } catch (err: any) {
      console.error('Create team error:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Cannot connect to the Vyugam backend API server. Please ensure the backend is running on port 5000.');
      } else if (err.response?.status === 401) {
        setError('Your login session has expired. Please sign in again.');
      } else {
        setError('Server error encountered while registering team. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-none max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-none text-[#2e1065]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-serif">Create New Hackathon Team</h3>
              <p className="text-xs font-semibold text-slate-800">Vyugam AI Guideline: Team of exactly 4 students with recommended female participation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 rounded-none bg-slate-200 hover:bg-slate-300 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If user is not authenticated, show sign-in prompt */}
        {!user ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-none flex items-center justify-center mx-auto text-amber-600">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 font-serif">Authentication Required</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                You must be logged in with your official Sri Eshwar College of Engineering (@sece.ac.in) account to form a team and act as Team Leader.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.location.hash = '#login';
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#2e1065] hover:bg-[#3b0764] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-none cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Go to Student Login</span>
              </button>

              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full sm:w-auto px-5 py-2.5 bg-purple-50 hover:bg-purple-100 text-[#2e1065] border border-purple-200 text-xs font-mono font-bold uppercase tracking-wider rounded-none cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Quick Demo Login (Arjun Vikram)</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
            
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-none font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-tight">{error}</span>
              </div>
            )}

            {/* Team Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-900 font-bold mb-1">Team Name *</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Neural Knights"
                  className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-2 text-slate-900 focus:border-[#2e1065] focus:ring-1 focus:ring-[#2e1065] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-1">Track Category</label>
                <select
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-2 text-slate-900 focus:border-[#2e1065] focus:ring-1 focus:ring-[#2e1065] focus:outline-none"
                >
                  <option value="Software">Software Track</option>
                  <option value="Hardware">Hardware & Embedded Track</option>
                </select>
              </div>
            </div>

            {/* Team Leader Badge */}
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-none flex items-center justify-between text-slate-900">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#2e1065] shrink-0" />
                <span className="font-medium text-xs">
                  Team Leader (1 of 4): <strong className="text-[#2e1065] font-bold">{user?.name}</strong>{' '}
                  <span className="text-slate-600">({user?.email})</span>
                </span>
              </div>
              <span className="text-[10px] bg-[#2e1065] text-white px-2 py-0.5 rounded-none font-bold uppercase tracking-wider">Leader</span>
            </div>

            {/* Members List - Fixed to 3 slots for exactly 4 members total */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <span>Student Members (3 Additional for Team of 4)</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-none">
                    4 Members Total
                  </span>
                </h4>
              </div>

              {members.map((m, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-none space-y-2 relative">
                  <div className="flex items-center justify-between text-slate-800 font-bold text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                      <span>Student Member #{idx + 2} of 4</span>
                    </span>
                    <span className="text-[10px] font-mono text-purple-700 bg-purple-100/60 px-2 py-0.5">
                      Required
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name *"
                        required
                        value={m.name}
                        onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-none px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-[#2e1065] focus:ring-1 focus:ring-[#2e1065]"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Student Email (@sece.ac.in) *"
                        required
                        value={m.email}
                        onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-none px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-[#2e1065] focus:ring-1 focus:ring-[#2e1065]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                    <input
                      type="text"
                      placeholder="Role (e.g. AI Dev, Fullstack)"
                      value={m.role_in_team}
                      onChange={(e) => handleMemberChange(idx, 'role_in_team', e.target.value)}
                      className="bg-white border border-slate-300 rounded-none px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-[#2e1065] focus:ring-1 focus:ring-[#2e1065]"
                    />
                    <select
                      value={m.gender}
                      onChange={(e) => handleMemberChange(idx, 'gender', e.target.value)}
                      className="bg-white border border-slate-300 rounded-none px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-[#2e1065] focus:ring-1 focus:ring-[#2e1065]"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      type="text"
                      placeholder="College Roll No (e.g. SECE23CS01)"
                      value={m.college_id_no}
                      onChange={(e) => handleMemberChange(idx, 'college_id_no', e.target.value)}
                      className="bg-white border border-slate-300 rounded-none px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-[#2e1065] focus:ring-1 focus:ring-[#2e1065]"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-none font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#2e1065] hover:bg-[#3b0764] text-white font-bold rounded-none shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Registering Team...' : 'Create Team of 4'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

export default CreateTeamModal;
