import React, { useState } from 'react';
import { Menu, X, User, LogOut, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAuthModal }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navTabs = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Vyugam AI' },
    { id: 'problems', label: 'Problem Statements' },
    { id: 'process', label: 'Timeline' },
    { id: 'faq', label: 'FAQs' },
    { id: 'contact', label: 'Contact Us' },
    { id: 'student-portal', label: 'Team Portal' },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-2xs transition-all">
      {/* Top Gradient Accent Line */}
      <div className="w-full h-1 bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800" />

      {/* Main Navbar Row */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        
        {/* Left: SECE Brand Logo */}
        <div 
          className="flex items-center cursor-pointer select-none shrink-0 group" 
          onClick={() => setActiveTab('home')}
        >
          <img
            src="/sece_logo/generated-1 (1).png"
            alt="Sri Eshwar College of Engineering"
            className="h-10 sm:h-12 w-auto object-contain shrink-0 group-hover:opacity-90 transition-opacity"
          />
        </div>

        {/* Center: Modern Floating Pill Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/70 shadow-xs backdrop-blur-sm">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors duration-200 cursor-pointer select-none ${
                  isActive ? 'text-purple-950 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 bg-white rounded-full shadow-xs border border-slate-200/60"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-2 text-xs font-semibold text-slate-800 bg-purple-50/80 px-3 py-1.5 rounded-full border border-purple-200 shadow-2xs select-none"
                title={`${user.name} (${user.role.toUpperCase()})`}
              >
                <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <User className="w-3 h-3 stroke-[2.5]" />
                </div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-slate-500 font-sans text-xs">Hello,</span>
                  <span className="font-semibold text-purple-900 text-xs sm:text-sm">
                    {(() => {
                      const clean = user.name.replace(/\(.*?\)/g, '').trim();
                      const parts = clean.split(/\s+/);
                      if (parts.length > 1 && (parts[0].endsWith('.') || ['Dr', 'Prof', 'Mr', 'Ms', 'Mrs'].includes(parts[0]))) {
                        return parts[1];
                      }
                      return parts[0] || 'User';
                    })()}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="hidden sm:inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-purple-700 hover:bg-purple-50/80 rounded-full transition-colors cursor-pointer"
              >
                <span>Log In</span>
              </button>

              <button
                onClick={() => onOpenAuthModal('register')}
                className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-800 hover:to-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-[0_2px_12px_rgba(109,40,217,0.25)] hover:shadow-[0_4px_16px_rgba(109,40,217,0.35)] transition-all active:scale-95 cursor-pointer group"
              >
                <span>REGISTER TEAM</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 space-y-1 text-sm font-semibold text-slate-800">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-purple-50 text-purple-900 font-bold' 
                    : 'text-slate-700 hover:bg-slate-50 hover:text-purple-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

    </header>
  );
};

export default Navbar;
