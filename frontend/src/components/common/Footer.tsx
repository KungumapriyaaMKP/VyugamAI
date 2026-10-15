import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-[#061826] text-slate-300 pt-16 pb-8 border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* 4-Column Clean Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 bg-white px-2.5 py-1 rounded-none border border-slate-700/80 shadow-md shrink-0 flex items-center justify-center">
                <img
                  src="/sece_logo/generated-1 (1).png"
                  alt="Vyugam AI Official Logo"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-white uppercase leading-none">
                  VYUGAM AI <span className="text-sky-400">HACKATHON</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  Department of AI &amp; DS &bull; Sri Eshwar
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Premier hackathon organized by Sri Eshwar College of Engineering, fostering cutting-edge artificial intelligence, hardware, and software innovations with direct mentorship from industry leaders.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-base font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm text-slate-300 font-medium">
              <li>
                <button 
                  onClick={() => setActiveTab('home')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('about')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('problems')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Problem Statements
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('process')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Timeline & Process
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('faq')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  FAQs
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('contact')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Innovation Sectors */}
          <div>
            <h4 className="text-base font-bold text-white mb-4">Innovation Sectors</h4>
            <ul className="space-y-3 text-sm text-slate-300 font-medium">
              <li className="hover:text-white transition-colors cursor-default">AI & Machine Learning</li>
              <li className="hover:text-white transition-colors cursor-default">Cybersecurity & Defense</li>
              <li className="hover:text-white transition-colors cursor-default">Smart Healthcare & IoT</li>
              <li className="hover:text-white transition-colors cursor-default">Clean Energy & Innovation</li>
              <li className="hover:text-white transition-colors cursor-default">Next-Gen Web Systems</li>
            </ul>
          </div>

          {/* Col 4: Contact Hub */}
          <div>
            <h4 className="text-base font-bold text-white mb-4">Contact Hub</h4>
            <div className="space-y-3.5 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <a
                    href="https://sece.ac.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-sky-400 hover:underline transition-colors font-semibold text-white block"
                    title="Sri Eshwar College of Engineering Official Website"
                  >
                    Sri Eshwar College of Engineering
                  </a>
                  <span className="text-xs text-slate-400">COIMBATORE - 641 202</span>
                </div>
              </div>
              <p className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span>+91 94899 99999</span>
              </p>
              <p className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>hackathon@sece.ac.in</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-slate-800/80 text-center text-xs text-slate-400 font-normal">
          <p>
            &copy; 2026 VYUGAM AI HACKATHON. All Rights Reserved. | Designed for Excellence.
          </p>
        </div>

      </div>
    </footer>
  );
};
