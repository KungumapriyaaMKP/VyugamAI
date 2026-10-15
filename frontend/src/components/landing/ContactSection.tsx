import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare } from 'lucide-react';
import { apiClient } from '../../api/client';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [isSending, setIsSending] = useState(false);
  const [responseMsg, setResponseMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSending(true);
      setResponseMsg(null);
      const res = await apiClient.post('/public/contact', { name, email, subject, message });
      if (res.data.success) {
        setResponseMsg({ type: 'success', text: res.data.message || 'Thank you! Your message has been sent successfully.' });
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setResponseMsg({ type: 'error', text: res.data.error || 'Failed to send message.' });
      }
    } catch (err: any) {
      setResponseMsg({ type: 'error', text: err.response?.data?.error || 'Error sending message. Please try again.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-slate-50 border-t border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-purple-100/70 border border-purple-200 text-[#2e1065] text-xs font-bold tracking-wide uppercase">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>CENTRAL HELPDESK</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-serif">
            Contact <span className="text-[#2e1065]">Organizing Committee</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Have questions regarding team formation, problem statements, or finale accommodation? Reach out to our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Contact Details Card */}
          <div className="bg-white p-8 rounded-none border border-slate-200 space-y-6 flex flex-col justify-between shadow-2xs">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-serif">
                <MessageSquare className="w-5 h-5 text-[#2e1065]" />
                <span>Contact Hub Information</span>
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3 p-4 bg-purple-50/50 border border-purple-100 rounded-none">
                <MapPin className="w-5 h-5 text-[#2e1065] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Sri Eshwar College of Engineering</div>
                  <div className="text-slate-600 mt-0.5">COIMBATORE - 641 202, Tamil Nadu, India</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-purple-50/50 border border-purple-100 rounded-none">
                <Phone className="w-5 h-5 text-[#2e1065] shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">Helpline Numbers</div>
                  <div className="text-slate-600 mt-0.5">+91 94899 99999 / +91 98765 43210</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-purple-50/50 border border-purple-100 rounded-none">
                <Mail className="w-5 h-5 text-[#2e1065] shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">Official Support Email</div>
                  <div className="text-slate-600 mt-0.5">hackathon@sece.ac.in</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-none border border-slate-200 space-y-4 shadow-2xs">
            <h3 className="text-xl font-bold text-slate-900 mb-2 font-serif">Send Us a Message</h3>

            {responseMsg && (
              <div className={`p-4 rounded-none flex items-center gap-3 text-xs font-semibold border ${
                responseMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}>
                {responseMsg.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
                <span>{responseMsg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Arjun Vikram"
                  className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#2e1065] focus:ring-1 focus:ring-[#2e1065]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (@sece.ac.in) *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="arjun@sece.ac.in"
                  className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#2e1065] focus:ring-1 focus:ring-[#2e1065]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Query regarding problem statement selection"
                className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#2e1065] focus:ring-1 focus:ring-[#2e1065]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message *</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your query or helpdesk question in detail..."
                className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#2e1065] focus:ring-1 focus:ring-[#2e1065]"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 rounded-none bg-[#2e1065] hover:bg-[#3b0764] text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 text-white" />
              <span>{isSending ? 'Sending...' : 'Submit Helpdesk Query'}</span>
            </button>
          </form>

        </div>

      </div>
    </section>
  );
};
