import React, { useState } from 'react';
import { Send, FileText, Video, Link, CheckCircle, Code2 } from 'lucide-react';
import { apiClient } from '../../api/client';
import type { Submission } from '../../types';

interface IdeaSubmissionFormProps {
  existingSubmission?: Submission | null;
  onSuccess: () => void;
}

export const IdeaSubmissionForm: React.FC<IdeaSubmissionFormProps> = ({ existingSubmission, onSuccess }) => {
  const [ideaTitle, setIdeaTitle] = useState(existingSubmission?.idea_title || '');
  const [summary, setSummary] = useState(existingSubmission?.executive_summary || '');
  const [solution, setSolution] = useState(existingSubmission?.proposed_solution || '');
  const [techStack, setTechStack] = useState(existingSubmission?.tech_stack || '');
  const [pptUrl, setPptUrl] = useState(existingSubmission?.ppt_url || '');
  const [githubUrl, setGithubUrl] = useState(existingSubmission?.github_url || '');
  const [videoUrl, setVideoUrl] = useState(existingSubmission?.demo_video_url || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setMsg(null);
      const res = await apiClient.post('/submissions/submit', {
        idea_title: ideaTitle,
        executive_summary: summary,
        proposed_solution: solution,
        tech_stack: techStack,
        ppt_url: pptUrl,
        github_url: githubUrl,
        demo_video_url: videoUrl
      });

      if (res.data.success) {
        setMsg({ type: 'success', text: 'Proposal submission saved and sent to evaluation queue!' });
        onSuccess();
      } else {
        setMsg({ type: 'error', text: res.data.error || 'Failed to submit proposal.' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Submission error.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[#1755a7]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0a2540]">Official Idea Proposal Form</h3>
            <p className="text-xs text-slate-500">Submit your architectural PPT, repository links, and solution summary</p>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-semibold border ${
          msg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}>
          {msg.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Idea Title */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Project / Idea Title *
        </label>
        <input
          type="text"
          required
          value={ideaTitle}
          onChange={(e) => setIdeaTitle(e.target.value)}
          placeholder="e.g. CampusGrid AI: Smart Microgrid Optimization Protocol"
          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#1755a7] focus:ring-1 focus:ring-[#1755a7]"
        />
      </div>

      {/* Executive Summary */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Executive Summary & Problem Alignment *
        </label>
        <textarea
          required
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Provide a concise 3 to 4 sentence abstract describing the core problem and how your team's system resolves it."
          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#1755a7] focus:ring-1 focus:ring-[#1755a7]"
        />
      </div>

      {/* Proposed Solution & Tech Architecture */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Proposed Technical Architecture & Methodology *
        </label>
        <textarea
          required
          rows={4}
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          placeholder="Explain your algorithm, hardware components, database schema, data flow pipelines, and AI/ML model choice."
          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#1755a7] focus:ring-1 focus:ring-[#1755a7]"
        />
      </div>

      {/* Tech Stack Tags */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Tech Stack & Frameworks
        </label>
        <input
          type="text"
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          placeholder="e.g. Python, PyTorch, React, Node.js, SQLite, Docker, MQTT"
          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#1755a7] focus:ring-1 focus:ring-[#1755a7]"
        />
      </div>

      {/* URLs Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Link className="w-3.5 h-3.5 text-[#1755a7]" />
            <span>PPT / Presentation PDF Link</span>
          </label>
          <input
            type="url"
            value={pptUrl}
            onChange={(e) => setPptUrl(e.target.value)}
            placeholder="https://drive.google.com/..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1755a7] focus:ring-1 focus:ring-[#1755a7]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-blue-600" />
            <span>GitHub Repository Link</span>
          </label>
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1755a7] focus:ring-1 focus:ring-[#1755a7]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-sky-600" />
            <span>Demo Video Link</span>
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1755a7] focus:ring-1 focus:ring-[#1755a7]"
          />
        </div>
      </div>

      {/* Submit Action */}
      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#1755a7] hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4 text-white" />
          <span>{isSubmitting ? 'Saving Proposal...' : 'Submit Idea Proposal'}</span>
        </button>
      </div>

    </form>
  );
};
