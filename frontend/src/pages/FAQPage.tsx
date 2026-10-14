import React, { useState, useEffect } from 'react';
import { Plus, Minus, HelpCircle, MessageSquare, ArrowRight, Search } from 'lucide-react';
import { apiClient } from '../api/client';

interface FAQPageProps {
  setActiveTab: (tab: string) => void;
}

export const FAQPage: React.FC<FAQPageProps> = ({ setActiveTab }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [pageData, setPageData] = useState<any>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    apiClient.get('/public/pages/faq')
      .then(res => {
        if (res.data.success && res.data.page) {
          setPageData(res.data.page);
        }
      })
      .catch(err => {
        console.warn('Using fallback FAQ data:', err);
      });
  }, []);

  const defaultFaqs = [
    {
      category: 'General',
      question: 'What is VyugamAI 2026?',
      answer: 'VyugamAI 2026 is an internal innovation hackathon organized by the Department of Artificial Intelligence and Data Science at Sri Eshwar College of Engineering, challenging our students to build breakthrough AI, software, and hardware solutions.'
    },
    {
      category: 'Teams & Eligibility',
      question: 'What is the team size and composition?',
      answer: 'Each team must consist of exactly 4 members (1 Team Leader + 3 Members). Inter-departmental and inter-year teams within Sri Eshwar College of Engineering or multi-disciplinary collaborations are enthusiastically encouraged.'
    },
    {
      category: 'Teams & Eligibility',
      question: 'Who is eligible to participate?',
      answer: 'All undergraduate and postgraduate students of Sri Eshwar College of Engineering across all engineering, technology, and computer science departments.'
    },
    {
      category: 'Submissions & Rules',
      question: 'What is the PPT submission format?',
      answer: 'Submissions must include problem statement code, executive summary, methodology flowchart, dataset/architecture schema, and expected impact using the official VyugamAI template.'
    },
    {
      category: 'General',
      question: 'Is there any registration fee?',
      answer: 'Initial round registration and proposal submission is completely free. Shortlisted finalists will receive accommodation and amenities at Sri Eshwar campus.'
    },
    {
      category: 'Grand Finale',
      question: 'Where will the Grand Finale take place?',
      answer: 'The Grand Finale is a 24-hour physical hackathon hosted at the state-of-the-art Innovation Center, Sri Eshwar College of Engineering, Coimbatore.'
    }
  ];

  const faqs = pageData?.faqs || defaultFaqs;
  const categories = pageData?.categories || ['All', 'General', 'Teams & Eligibility', 'Submissions & Rules', 'Grand Finale'];

  const filteredFaqs = faqs.filter((faq: any) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Page Header */}
      <section className="bg-gradient-to-b from-white via-purple-50/30 to-slate-50 border-b border-slate-200 py-12 lg:py-16 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <button onClick={() => setActiveTab('home')} className="hover:text-[#2e1065] transition-colors cursor-pointer">
              Home
            </button>
            <span>/</span>
            <span className="text-[#2e1065]">FAQs</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-purple-50 border border-purple-200 text-[#2e1065] text-xs font-bold shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>KNOWLEDGE BASE & SUPPORT</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight font-serif">
            Frequently Asked <span className="text-[#2e1065]">Questions</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-3xl">
            {pageData?.subtitle || 'Find answers to common queries regarding team registration, proposal submissions, and finale logistics.'}
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search queries, rules, eligibility..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-none border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2e1065] shadow-2xs"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main FAQ Content */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200 flex-grow">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 space-y-10">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-200">
            {categories.map((cat: string) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-none text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#2e1065] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 2-Column Clean Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Heading and Contact Action */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-serif leading-tight">
                  Got Questions? <br />
                  <span className="text-[#2e1065]">We've Got Answers.</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Can't find what you are looking for? Reach out directly to our helpdesk coordinators.
                </p>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-200 rounded-none space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-none bg-purple-100 text-[#2e1065] flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Still need assistance?</h4>
                    <p className="text-xs text-slate-500">We respond promptly within 2-4 hours</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('contact')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-none bg-[#2e1065] hover:bg-[#3b0764] text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
                >
                  <span>Contact Organizing Team</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Accordion */}
            <div className="lg:col-span-7 space-y-3">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No questions match your search. Try another query or clear the filter.
                </div>
              ) : (
                filteredFaqs.map((faq: any, idx: number) => {
                  const isOpen = openIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-none overflow-hidden transition-all bg-white"
                    >
                      <button
                        onClick={() => toggleAccordion(idx)}
                        className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer"
                      >
                        <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {faq.question}
                        </span>
                        
                        <div
                          className={`w-7 h-7 rounded-none flex items-center justify-center shrink-0 border transition-all ${
                            isOpen 
                              ? 'bg-[#2e1065] text-white border-[#2e1065]' 
                              : 'bg-white text-slate-600 border-slate-300'
                          }`}
                        >
                          {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/30">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
