import React from 'react';
import { Search, Filter, RefreshCw, X } from 'lucide-react';

interface ProblemFilterProps {
  search: string;
  setSearch: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  domain: string;
  setDomain: (val: string) => void;
  categories: string[];
  domains: string[];
  onReset: () => void;
}

export const ProblemFilter: React.FC<ProblemFilterProps> = ({
  search,
  setSearch,
  category,
  setCategory,
  domain,
  setDomain,
  categories,
  onReset,
}) => {
  return (
    <div className="bg-white p-5 rounded-none border border-slate-200 shadow-sm space-y-4 mb-8">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by PS Code, Title, Tech Stack..."
            className="w-full bg-slate-50 border border-slate-300 rounded-none pl-10 pr-9 py-2.5 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-none px-3 py-1.5 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-purple-600" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer pr-2"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Domain Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-none px-3 py-1.5 text-xs text-slate-700">
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer pr-2"
            >
              <option value="All">All Domains</option>
              <option value="Software">Software</option>
              <option value="Hardware">Hardware</option>
              <option value="Both">Software & Hardware</option>
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-300 rounded-none hover:border-slate-400 transition-colors"
            title="Reset Filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

        </div>
      </div>
    </div>
  );
};
