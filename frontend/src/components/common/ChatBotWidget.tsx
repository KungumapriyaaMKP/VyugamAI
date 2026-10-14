import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, RotateCcw } from 'lucide-react';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  action?: {
    type: 'tab' | 'auth';
    label: string;
    payload: string;
  };
}

interface ChatBotWidgetProps {
  setActiveTab: (tab: string) => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'bot',
    text: '👋 Hello! Welcome to VyugamAI 2026. How can we help you explore problem statements or register your team?',
    time: 'Just now',
  },
];

const SUGGESTED_QUESTIONS = [
  'Explore Problem Statements',
  'How to Register a Team?',
  'Hackathon Schedule & Dates',
  'Eligibility & Team Size',
  'Prizes & Recognition',
];

export const ChatBotWidget: React.FC<ChatBotWidgetProps> = ({ setActiveTab, onOpenAuthModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages, isTyping]);

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
  };

  const getBotResponse = (query: string): { text: string; action?: Message['action'] } => {
    const q = query.toLowerCase().trim();

    if (q.includes('problem') || q.includes('track') || q.includes('statement') || q.includes('theme') || q.includes('topic')) {
      return {
        text: 'VyugamAI 2026 features real-world problem statements across 6 cutting-edge innovation sectors:\n\n• Generative AI & Autonomous Agents\n• Healthcare & Biotech Diagnostics\n• Smart City, IoT & Clean Energy\n• FinTech, Fraud Detection & Web3\n• AgriTech & Sustainable Ecosystems\n• Open Innovation & Social Good\n\nClick below to browse all problem statements, filter by domain, and download full problem briefs!',
        action: {
          type: 'tab',
          label: 'View Problem Statements →',
          payload: 'problems',
        },
      };
    }

    if (q.includes('register') || q.includes('sign up') || q.includes('join') || q.includes('participate') || q.includes('apply')) {
      return {
        text: 'Registration for VyugamAI 2026 is completely FREE!\n\n1. The Team Leader registers using their college email address (@sece.ac.in for SECE participants).\n2. Create your team name and add exactly 3 team members (team of 4 students total).\n3. Choose your chosen Problem Statement and submit your preliminary abstract/PPT.\n\nReady to get started?',
        action: {
          type: 'auth',
          label: 'Register Now →',
          payload: 'register',
        },
      };
    }

    if (q.includes('date') || q.includes('schedule') || q.includes('timeline') || q.includes('when') || q.includes('deadline')) {
      return {
        text: '📅 VyugamAI 2026 Key Timeline:\n\n• Phase 1: Team Registration & Idea Abstract Submission\n• Phase 2: Preliminary Jury Evaluation & Shortlisting Announcement\n• Phase 3: Grand 24-Hour Offline Hackathon Finale at Sri Eshwar College of Engineering Campus!\n\nCheck out the full interactive timeline on the Process page.',
        action: {
          type: 'tab',
          label: 'View Full Timeline →',
          payload: 'process',
        },
      };
    }

    if (q.includes('team') || q.includes('eligibility') || q.includes('size') || q.includes('member') || q.includes('who can')) {
      return {
        text: '👥 Eligibility & Team Guidelines:\n\n• Team Size: Exactly 4 students per team (1 Team Leader + 3 Members).\n• Exclusively open to all undergraduate and postgraduate students of Sri Eshwar College of Engineering.\n• Interdisciplinary teams (combining AI, CSE, ECE, Mechanical, etc.) are strongly encouraged!\n• Each participant can only be part of one registered team.',
        action: {
          type: 'auth',
          label: 'Create Your Team →',
          payload: 'register',
        },
      };
    }

    if (q.includes('prize') || q.includes('award') || q.includes('reward') || q.includes('cash') || q.includes('win')) {
      return {
        text: '🏆 Prizes & Opportunities:\n\n• Generous Cash Prize Pool for 1st, 2nd, and 3rd place winners in each category.\n• Special domain awards for Best All-Girls Team, Most Innovative Hardware/IoT, and Best AI Model.\n• Direct internship & pre-placement interview opportunities with leading technology partners.\n• Official certificates for all shortlisted participants!',
        action: {
          type: 'tab',
          label: 'Explore Hackathon Details →',
          payload: 'about',
        },
      };
    }

    if (q.includes('college') || q.includes('eshwar') || q.includes('sece') || q.includes('where') || q.includes('venue') || q.includes('location')) {
      return {
        text: '🏫 Venue & Host Institution:\n\nVyugamAI 2026 is proudly organized by the Department of Artificial Intelligence & Data Science at Sri Eshwar College of Engineering (SECE), Kinathukadavu, Coimbatore, Tamil Nadu.\n\nOur campus features state-of-the-art AI labs, high-speed networking, and mentorship spaces.',
        action: {
          type: 'tab',
          label: 'About Sri Eshwar AI & DS →',
          payload: 'about',
        },
      };
    }

    if (q.includes('contact') || q.includes('support') || q.includes('help') || q.includes('email') || q.includes('query')) {
      return {
        text: '📬 Contact & Help Desk:\n\n• Email: hackathon@sece.ac.in\n• Venue: Sri Eshwar College of Engineering, Coimbatore\n• Organized by: Department of AI & DS\n\nYou can also visit our Contact page to send a direct message to the organizing committee.',
        action: {
          type: 'tab',
          label: 'Open Contact Desk →',
          payload: 'contact',
        },
      };
    }

    if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('greetings')) {
      return {
        text: 'Hello there! 👋 I am your VyugamAI Hackathon Assistant. Ask me about problem statements, registration steps, dates, team rules, or prizes!',
      };
    }

    return {
      text: `Thanks for asking! VyugamAI 2026 is organized by the Department of AI & DS at Sri Eshwar College of Engineering.\n\nFor more specific assistance, you can explore the problem statements, read the FAQs, or contact the coordination team.`,
      action: {
        type: 'tab',
        label: 'View FAQ Section →',
        payload: 'faq',
      },
    };
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate smart AI response timing
    setTimeout(() => {
      const { text, action } = getBotResponse(query);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 550);
  };

  const handleActionClick = (action: NonNullable<Message['action']>) => {
    if (action.type === 'tab') {
      setActiveTab(action.payload);
      setIsOpen(false);
    } else if (action.type === 'auth') {
      onOpenAuthModal(action.payload as 'login' | 'register');
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Interactive Chat Window */}
      {isOpen && (
        <div className="mb-3 w-[92vw] sm:w-[380px] max-w-[420px] bg-white border border-slate-200/90 shadow-2xl rounded-none flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 h-[520px] max-h-[80vh]">
          {/* Header */}
          <div className="bg-[#2e1065] text-white px-4 py-3.5 flex items-center justify-between border-b border-purple-900/30">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Bot className="w-4 h-4 text-purple-200" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#2e1065] rounded-full" />
              </div>
              <div>
                <div className="font-serif text-sm font-bold tracking-wide flex items-center gap-1.5">
                  <span>VyugamAI Assistant</span>
                </div>
                <div className="text-[10px] font-mono text-purple-200/80">
                  Online &bull; Sri Eshwar AI &amp; DS
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="p-1.5 text-purple-200/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Reset Conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-purple-200/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Bar from User Screenshot */}
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex gap-2">
            <button
              onClick={() => {
                setActiveTab('problems');
                setIsOpen(false);
              }}
              className="flex-1 py-1.5 text-[11px] font-bold bg-[#2e1065] hover:bg-[#3b0764] text-white text-center transition-all cursor-pointer shadow-xs rounded-none"
            >
              Problems
            </button>
            <button
              onClick={() => {
                onOpenAuthModal('register');
                setIsOpen(false);
              }}
              className="flex-1 py-1.5 text-[11px] font-bold border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-center transition-all cursor-pointer shadow-xs rounded-none"
            >
              Register
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#2e1065] text-white shadow-xs rounded-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 shadow-xs rounded-none whitespace-pre-line'
                  }`}
                >
                  {msg.text}

                  {msg.action && (
                    <button
                      onClick={() => handleActionClick(msg.action!)}
                      className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#2e1065] hover:bg-[#3b0764] text-white text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none"
                    >
                      <span>{msg.action.label}</span>
                    </button>
                  )}
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-1 px-1">
                  {msg.time}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-2 text-slate-400 text-xs w-fit">
                <Bot className="w-3.5 h-3.5 text-[#2e1065] animate-spin" />
                <span className="animate-pulse text-[11px]">VyugamAI is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Queries Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto flex gap-1.5 no-scrollbar">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="shrink-0 text-[10px] font-medium bg-slate-100 hover:bg-purple-50 hover:text-[#2e1065] hover:border-purple-200 text-slate-600 border border-slate-200 px-2.5 py-1 transition-all cursor-pointer rounded-none"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about VyugamAI 2026..."
              className="flex-1 text-xs px-3 py-2 border border-slate-200 focus:border-[#2e1065] focus:outline-none bg-slate-50/50 text-slate-800 rounded-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 bg-[#2e1065] hover:bg-[#3b0764] disabled:bg-slate-200 text-white disabled:text-slate-400 transition-colors cursor-pointer rounded-none"
              title="Send Message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Circular Purple Assistant Badge (Trigger Button matching User Image) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#2e1065] hover:bg-[#3b0764] text-white flex items-center justify-center shadow-2xl shadow-purple-950/40 border-2 border-purple-400/50 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
        title={isOpen ? 'Close Assistant' : 'Chat with VyugamAI Assistant'}
      >
        <div className="relative">
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-purple-200 group-hover:text-white transition-colors" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#2e1065] animate-pulse" />
            </>
          )}
        </div>
      </button>
    </div>
  );
};

export default ChatBotWidget;
