import React, { useState } from 'react';
import { Menu, X, User, LogOut, GraduationCap, Home, Info, BookOpen, Layers, Mail, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LimelightNav, type NavItem } from '@/components/ui/limelight-nav';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAuthModal }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navTabs = [
    { id: 'home', label: 'Home', icon: <Home /> },
    { id: 'about', label: 'About Vyugam AI', icon: <Info /> },
    { id: 'problems', label: 'Problem Statements', icon: <BookOpen /> },
    { id: 'process', label: 'Timeline', icon: <Layers /> },
    { id: 'faq', label: 'FAQs', icon: <HelpCircle /> },
    { id: 'contact', label: 'Contact Us', icon: <Mail /> },
    { id: 'student-portal', label: 'Team Portal', icon: <GraduationCap /> },
  ];

  const currentNavIndex = navTabs.findIndex(t => t.id === activeTab);

  const limelightItems: NavItem[] = navTabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon,
    onClick: () => setActiveTab(tab.id),
  }));

  return (
    <header className="bg-white border-b border-slate-200 shadow-2xs sticky top-0 z-50">
      {/* 3px Top Purple Accent Bar */}
      <div className="w-full h-1 bg-[#2e1065]" />

      {/* Clean Single Navbar Row */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        
        {/* Left: SECE Brand Logo */}
        <div className="flex items-center cursor-pointer select-none shrink-0" onClick={() => setActiveTab('home')}>
          <img
            src="/sece_logo/generated-1 (1).png"
            alt="Sri Eshwar College of Engineering"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain shrink-0"
          />
        </div>

        {/* Center: Limelight Spotlight Nav */}
        <div className="hidden lg:flex items-center justify-center flex-1">
          <LimelightNav
            items={limelightItems}
            activeIndex={currentNavIndex !== -1 ? currentNavIndex : 0}
            onTabChange={(index) => {
              if (navTabs[index]) setActiveTab(navTabs[index].id);
            }}
            className="bg-white border-slate-200 shadow-2xs"
            iconContainerClassName="px-3 xl:px-4 py-2"
            showLabels={true}
          />
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-white/95 px-3 py-1.5 rounded-none border border-purple-200 shadow-2xs select-none"
                title={`${user.name} (${user.role.toUpperCase()})`}
              >
                <div className="w-5 h-5 rounded-none bg-purple-100 border border-purple-200 text-[#2e1065] flex items-center justify-center shrink-0">
                  <User className="w-3 h-3 stroke-[2.5]" />
                </div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-slate-600 font-sans font-semibold text-xs">Hello,</span>
                  <span className="font-serif italic font-normal tracking-tight vyugam-shimmer-text text-sm sm:text-base">
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
                className="flex items-center gap-1 px-3 py-1.5 rounded-none border border-rose-300 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="hidden sm:inline-flex items-center px-3.5 py-2 text-xs font-mono font-bold text-slate-700 hover:text-purple-700 transition-colors cursor-pointer"
              >
                <span>Log In</span>
              </button>

              <button
                onClick={() => onOpenAuthModal('register')}
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 hover:from-purple-800 hover:to-pink-700 text-white text-xs font-mono font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(192,38,211,0.4)] cursor-pointer rounded-none group"
              >
                <span>REGISTER SQUAD</span>
                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-none text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-5 py-4 space-y-2 text-sm font-semibold font-mono text-slate-800">
          <button
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2.5 border-b border-slate-100 hover:text-[#1755a7]"
          >
            Home
          </button>
          <button
            onClick={() => { setActiveTab('about'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2.5 border-b border-slate-100 hover:text-[#1755a7]"
          >
            About Vyugam AI
          </button>
          <button
            onClick={() => { setActiveTab('problems'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2.5 border-b border-slate-100 hover:text-[#1755a7]"
          >
            Problem Statements
          </button>
          <button
            onClick={() => { setActiveTab('process'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2.5 border-b border-slate-100 hover:text-[#2e1065]"
          >
            Timeline
          </button>
          <button
            onClick={() => { setActiveTab('faq'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2.5 border-b border-slate-100 hover:text-[#2e1065]"
          >
            FAQs
          </button>
          <button
            onClick={() => { setActiveTab('contact'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2.5 border-b border-slate-100 hover:text-[#2e1065]"
          >
            Contact Us
          </button>
          <button
            onClick={() => { setActiveTab('student-portal'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2.5 border-b border-slate-100 hover:text-[#2e1065]"
          >
            Team Portal
          </button>
        </div>
      )}

    </header>
  );
};
