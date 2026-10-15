import React, { useEffect, useState } from 'react';
import type { ProblemStatement } from '../../types';
import { ProblemCard } from './ProblemCard';
import { ProblemFilter } from './ProblemFilter';
import { ProblemDetailModal } from './ProblemDetailModal';
import { apiClient } from '../../api/client';
import { PencilLoader } from '../ui/loader-1';
import { FileSearch } from 'lucide-react';

export const ProblemList: React.FC = () => {
  const [problems, setProblems] = useState<ProblemStatement[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [domain, setDomain] = useState('All');

  // Modal state
  const [selectedProblem, setSelectedProblem] = useState<ProblemStatement | null>(null);

  const fetchMeta = async () => {
    try {
      const res = await apiClient.get('/problems/meta/categories');
      if (res.data.success) {
        setCategories(res.data.meta.categories || []);
        setDomains(res.data.meta.domains || []);
      }
    } catch (err) {
      console.error('Meta error:', err);
    }
  };

  const fetchProblems = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (category !== 'All') params.category = category;
      if (domain !== 'All') params.domain = domain;
      if (search.trim()) params.search = search.trim();

      const res = await apiClient.get('/problems', { params });
      if (res.data.success) {
        setProblems(res.data.problems);
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProblems();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, category, domain]);

  const handleReset = () => {
    setSearch('');
    setCategory('All');
    setDomain('All');
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-serif">
          Explore <span className="text-[#2e1065]">Problem Statements</span> & Innovate
        </h2>
      </div>

      {/* Filter Component */}
      <ProblemFilter
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        domain={domain}
        setDomain={setDomain}
        categories={categories}
        domains={domains}
        onReset={handleReset}
      />

      {/* Results Meta Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-6 px-1">
        <span>Showing <strong className="text-[#2e1065] font-mono text-sm">{problems.length}</strong> Problem Statements</span>
      </div>

      {/* Problem Cards Grid */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <PencilLoader size={160} text="Loading Problem Statements..." />
        </div>
      ) : problems.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 space-y-4 max-w-lg mx-auto shadow-sm">
          <FileSearch className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Matching Problem Statements Found</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search terms, domain, or category filter to discover available challenges.
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-[#2e1065] text-white font-bold rounded-xl text-xs hover:bg-purple-900 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((prob) => (
            <ProblemCard
              key={prob.id}
              problem={prob}
              onSelect={(p) => setSelectedProblem(p)}
            />
          ))}
        </div>
      )}

      {/* Problem Detail Modal */}
      <ProblemDetailModal
        problem={selectedProblem}
        onClose={() => setSelectedProblem(null)}
        onSelectSuccess={() => fetchProblems()}
      />

    </div>
  );
};
