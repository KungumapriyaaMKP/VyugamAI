import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { AnnouncementTicker } from './components/common/AnnouncementTicker';
import { Footer } from './components/common/Footer';
import { HeroSection } from './components/landing/HeroSection';
import { AboutSection } from './components/landing/AboutSection';
import { ProcessFlowSection } from './components/landing/ProcessFlowSection';
import { SectorsSection } from './components/landing/SectorsSection';
import { StatsBanner } from './components/common/StatsBanner';
import { FAQSection } from './components/landing/FAQSection';
import { ContactSection } from './components/landing/ContactSection';
import CursorMultifollow from './components/ui/motion-cursor-multifollow';
import { ScrollReveal } from './components/common/ScrollReveal';
import { useAuth } from './context/AuthContext';
import { PencilLoader } from './components/ui/loader-1';
import { BookOpen, Layers, HelpCircle, Info, ArrowRight } from 'lucide-react';

// Lazy loaded dynamic modules to keep the initial landing page bundle ultra-light and lightning fast
const ProblemList = React.lazy(() => import('./components/problems/ProblemList').then(m => ({ default: m.ProblemList })));
const StudentDashboard = React.lazy(() => import('./components/student/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const EvaluatorDashboard = React.lazy(() => import('./components/evaluator/EvaluatorDashboard').then(m => ({ default: m.EvaluatorDashboard })));
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AuthModal = React.lazy(() => import('./components/common/AuthModal').then(m => ({ default: m.AuthModal })));
const LoginPage = React.lazy(() => import('./components/ui/sign-in-page').then(m => ({ default: m.LoginPage })));
const IntroVideoModal = React.lazy(() => import('./components/common/IntroVideoModal').then(m => ({ default: m.IntroVideoModal })));
const ChatBotWidget = React.lazy(() => import('./components/common/ChatBotWidget').then(m => ({ default: m.ChatBotWidget })));

const MainAppContent: React.FC = () => {
  const { isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showIntroVideo, setShowIntroVideo] = useState<boolean>(() => {
    // Only auto-play once per browser session to prevent blocking returning users and save 14MB bandwidth
    return !sessionStorage.getItem('vyugam_intro_shown');
  });
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login'
  });

  // Synchronize state with browser URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['home', 'about', 'problems', 'process', 'timeline', 'faq', 'contact', 'student-portal', 'evaluator-portal', 'admin-portal', 'login-page', 'login', 'signup-page', 'signup', 'register'];
      if (validTabs.includes(hash)) {
        const normalizedTab = hash === 'login' ? 'login-page' : (hash === 'signup' || hash === 'register') ? 'signup-page' : hash === 'timeline' ? 'process' : hash;
        setActiveTab(normalizedTab);
        if (normalizedTab === 'about') {
          setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 120);
        } else if (normalizedTab === 'process') {
          setTimeout(() => (document.getElementById('timeline') || document.getElementById('process'))?.scrollIntoView({ behavior: 'smooth' }), 120);
        } else if (normalizedTab === 'faq') {
          setTimeout(() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }), 120);
        } else if (normalizedTab === 'contact') {
          setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 120);
        }
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync activeTab with scroll position when on main page
  useEffect(() => {
    if (!['home', 'about', 'process', 'faq', 'contact'].includes(activeTab)) return;

    const handleScroll = () => {
      const aboutEl = document.getElementById('about');
      const timelineEl = document.getElementById('timeline');
      const faqEl = document.getElementById('faq');
      const contactEl = document.getElementById('contact');

      const scrollPos = window.scrollY + 250;

      if (contactEl && scrollPos >= contactEl.offsetTop) {
        if (activeTab !== 'contact') setActiveTab('contact');
      } else if (faqEl && scrollPos >= faqEl.offsetTop) {
        if (activeTab !== 'faq') setActiveTab('faq');
      } else if (timelineEl && scrollPos >= timelineEl.offsetTop) {
        if (activeTab !== 'process') setActiveTab('process');
      } else if (aboutEl && scrollPos >= aboutEl.offsetTop) {
        if (activeTab !== 'about') setActiveTab('about');
      } else {
        if (activeTab !== 'home') setActiveTab('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    if (tab === 'about') {
      setActiveTab('about');
      window.location.hash = '#about';
      const el = document.getElementById('about');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        setTimeout(() => {
          document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
      return;
    }

    if (tab === 'process' || tab === 'timeline') {
      setActiveTab('process');
      window.location.hash = '#timeline';
      const el = document.getElementById('timeline') || document.getElementById('process');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        setTimeout(() => {
          (document.getElementById('timeline') || document.getElementById('process'))?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
      return;
    }

    if (tab === 'faq') {
      setActiveTab('faq');
      window.location.hash = '#faq';
      const el = document.getElementById('faq');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        setTimeout(() => {
          document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
      return;
    }

    if (tab === 'contact' || tab === 'contact-us') {
      setActiveTab('contact');
      window.location.hash = '#contact';
      const el = document.getElementById('contact');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        setTimeout(() => {
          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
      return;
    }

    if (tab === 'home') {
      setActiveTab('home');
      window.location.hash = '#home';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (tab === 'login') {
      setActiveTab('login-page');
      window.location.hash = '#login';
    } else if (tab === 'signup' || tab === 'register') {
      setActiveTab('signup-page');
      window.location.hash = '#signup';
    } else {
      setActiveTab(tab === 'login-page' ? 'login-page' : tab === 'signup-page' ? 'signup-page' : tab);
      window.location.hash = '#' + (tab === 'login-page' ? 'login' : tab === 'signup-page' ? 'signup' : tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuthModal = (mode: 'login' | 'register') => {
    if (mode === 'login') {
      handleTabChange('login');
    } else {
      handleTabChange('signup');
    }
  };

  const handleCloseAuthModal = () => {
    setAuthModalState(prev => ({ ...prev, isOpen: false }));
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-screen bg-[#fbf9fe] flex flex-col items-center justify-center p-6 select-none">
        <PencilLoader size={180} text="Entering Vyugam Arena..." />
      </div>
    );
  }

  if (activeTab === 'login-page' || activeTab === 'signup-page') {
    return (
      <LoginPage
        initialMode={activeTab === 'signup-page' ? 'signup' : 'login'}
        onNavigateHome={() => handleTabChange('home')}
        onNavigateSignup={() => handleTabChange('signup')}
        onNavigateLogin={() => handleTabChange('login')}
      />
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
      case 'about':
      case 'process':
      case 'faq':
      case 'contact':
        return (
          <>
            <HeroSection setActiveTab={handleTabChange} onOpenAuthModal={handleOpenAuthModal} />


            <AboutSection />
            <StatsBanner />
            <SectorsSection setActiveTab={handleTabChange} />
            <ProcessFlowSection />
            
            {/* Quick Explore Dedicated Pages Directory on Home */}
            <section className="py-16 bg-white border-t border-slate-200">
              <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-10">
                <ScrollReveal direction="up" distance={20} duration={700} className="text-center max-w-2xl mx-auto space-y-3">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif">
                    Explore <span className="text-[#2e1065]">VyugamAI 2026</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Browse dedicated event sections, guidelines, problem statements, and official helpdesk.
                  </p>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      id: 'about',
                      title: 'About VyugamAI',
                      desc: 'Department of AI & DS mission, vision, and core pillars of innovation.',
                      icon: Info,
                      btn: 'Explore Section'
                    },
                    {
                      id: 'problems',
                      title: 'Problem Statements',
                      desc: 'Curated deep-tech challenges focused exclusively on Artificial Intelligence domains.',
                      icon: BookOpen,
                      btn: 'Browse Challenges'
                    },
                    {
                      id: 'process',
                      title: 'Timeline & Process',
                      desc: 'Interactive 5-phase progression from registrations to the grand finale.',
                      icon: Layers,
                      btn: 'View Timeline'
                    },
                    {
                      id: 'faq',
                      title: 'Helpdesk & FAQs',
                      desc: 'Answers to eligibility rules, team formation, templates, and travel queries.',
                      icon: HelpCircle,
                      btn: 'Read FAQs'
                    }
                  ].map((card, idx) => (
                    <ScrollReveal
                      key={card.id}
                      delay={idx * 80}
                      distance={24}
                      duration={650}
                      className="h-full"
                    >
                      <div
                        onClick={() => handleTabChange(card.id)}
                        className="p-6 rounded-none bg-slate-50 border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 group cursor-pointer h-full"
                      >
                        <div className="space-y-3">
                          <div className="w-12 h-12 rounded-none bg-white border border-slate-200 text-[#2e1065] flex items-center justify-center group-hover:bg-[#2e1065] group-hover:text-white transition-all shadow-xs">
                            <card.icon className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#2e1065] transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {card.desc}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold text-[#2e1065] pt-2 border-t border-slate-200">
                          <span>{card.btn}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </section>

            {/* Direct FAQs Accordion Section */}
            <FAQSection setActiveTab={handleTabChange} />

            {/* Direct Central Helpdesk & Contact Us Section */}
            <ContactSection />
          </>
        );

      case 'problems':
        return <ProblemList />;

      case 'student-portal':
        return <StudentDashboard />;

      case 'evaluator-portal':
        return <EvaluatorDashboard />;

      case 'admin-portal':
        return <AdminDashboard />;

      default:
        return (
          <HeroSection
            setActiveTab={handleTabChange}
            onOpenAuthModal={handleOpenAuthModal}
            onWatchIntro={() => setShowIntroVideo(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-[#2e1065] selection:text-white">
      {/* Startup Intro Video Experience (Lazy-loaded, only buffered when active) */}
      {showIntroVideo && (
        <React.Suspense fallback={null}>
          <IntroVideoModal
            isOpen={showIntroVideo}
            onClose={() => {
              setShowIntroVideo(false);
              sessionStorage.setItem('vyugam_intro_shown', 'true');
            }}
          />
        </React.Suspense>
      )}

      <CursorMultifollow global />

      <AnnouncementTicker />

      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenAuthModal={handleOpenAuthModal}
      />

      <main className="flex-grow">
        <React.Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center py-20">
              <PencilLoader size={120} text="Loading..." />
            </div>
          }
        >
          {renderTabContent()}
        </React.Suspense>
      </main>

      <Footer setActiveTab={handleTabChange} />

      {/* Auth Modal (Loaded on-demand) */}
      {authModalState.isOpen && (
        <React.Suspense fallback={null}>
          <AuthModal
            isOpen={authModalState.isOpen}
            mode={authModalState.mode}
            onClose={handleCloseAuthModal}
            onSwitchMode={(mode) => {
              if (mode === 'login') {
                handleCloseAuthModal();
                handleTabChange('login-page');
              } else {
                setAuthModalState({ isOpen: true, mode: 'register' });
              }
            }}
          />
        </React.Suspense>
      )}

      {/* Floating Interactive VyugamAI Assistant Chatbot (Lazy-loaded) */}
      <React.Suspense fallback={null}>
        <ChatBotWidget
          setActiveTab={handleTabChange}
          onOpenAuthModal={handleOpenAuthModal}
        />
      </React.Suspense>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
