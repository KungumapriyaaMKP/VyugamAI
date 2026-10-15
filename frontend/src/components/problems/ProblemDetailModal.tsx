import React, { useState } from 'react';
import { X, Building, Layers, Target, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import type { ProblemStatement } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';

interface ProblemDetailModalProps {
  problem: ProblemStatement | null;
  onClose: () => void;
  onSelectSuccess?: () => void;
}

export const ProblemDetailModal: React.FC<ProblemDetailModalProps> = ({ problem, onClose, onSelectSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const [isSelecting, setIsSelecting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!problem) return null;

  const handleSelectProblem = async () => {
    if (!isAuthenticated || user?.role !== 'student') {
      setMessage({ type: 'error', text: 'You must be logged in as a Team Leader to select a problem statement.' });
      return;
    }

    try {
      setIsSelecting(true);
      setMessage(null);
      const res = await apiClient.post('/teams/select-problem', { problemId: problem.id });
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Problem statement locked for your team successfully!' });
        if (onSelectSuccess) onSelectSuccess();
      } else {
        setMessage({ type: 'error', text: res.data.error || 'Failed to select problem statement.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error selecting problem statement.' });
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-none max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#2e1065] text-white font-mono font-bold px-3 py-1 rounded-none text-xs">
                {problem.id}
              </span>
              <span className="bg-slate-200 text-slate-800 px-3 py-1 rounded-none text-xs font-semibold">
                {problem.category}
              </span>
              <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-none text-xs font-bold border border-purple-200">
                {problem.domain_bucket}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-snug">
              {problem.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-none bg-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          
          {message && (
            <div className={`p-4 rounded-none flex items-center gap-3 border text-xs font-bold ${
              message.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-rose-50 border-rose-300 text-rose-700'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Organization Info */}
          <div className="bg-slate-50 p-4 rounded-none flex items-center gap-3 border border-slate-200">
            <Building className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <div className="text-xs text-slate-500 font-semibold">Ministry / Organization</div>
              <div className="text-slate-900 font-extrabold">{problem.organization}</div>
            </div>
          </div>

          {/* Problem Statement Detail */}
          <div>
            <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Problem Background & Challenge Description</span>
            </h4>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-none border border-slate-200">
              {problem.description}
            </p>
          </div>

          {/* Expected Outcome */}
          <div>
            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Expected Deliverable & Solution Specs</span>
            </h4>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-none border border-slate-200">
              {problem.desired_outcome}
            </p>
          </div>

          {/* Dataset URL if available */}
          {problem.dataset_url && (
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-none">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-slate-700 font-semibold">Dataset / Reference Code Repository</span>
              </div>
              <a
                href={problem.dataset_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1"
              >
                <span>View Repository</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 font-medium">
            Selected by <span className="font-bold text-purple-700 font-mono">{problem.submissions_count} Teams</span> so far
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-none bg-slate-200 text-slate-800 hover:bg-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleSelectProblem}
              disabled={isSelecting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-none bg-[#2e1065] hover:bg-purple-900 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSelecting ? 'Locking...' : 'Select PS for My Team'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
