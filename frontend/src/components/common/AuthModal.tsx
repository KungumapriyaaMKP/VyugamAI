import React, { useState } from 'react';
import { X, Shield, GraduationCap, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'login' | 'register';
  onClose: () => void;
  onSwitchMode: (newMode: 'login' | 'register') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, mode, onClose, onSwitchMode }) => {
  const { login, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [college, setCollege] = useState('Sri Eshwar College of Engineering');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (mode === 'login') {
      const normalizedInput = email.trim().toLowerCase();
      if (normalizedInput === 'vyugamadmin' || normalizedInput === 'vyugamadmin@sece.ac.in') {
        if (password !== 'VyugamAI2026@password123') {
          setError('Invalid Admin password.');
          setIsSubmitting(false);
          return;
        }
        const res = await login('VyugamAdmin', password);
        setIsSubmitting(false);
        if (res.success) {
          onClose();
          window.location.hash = '#admin-portal';
        } else {
          setError(res.error || 'Admin login failed.');
        }
        return;
      }

      if (!normalizedInput.endsWith('@sece.ac.in')) {
        setError('Only mail IDs with domain @sece.ac.in are allowed to login.');
        setIsSubmitting(false);
        return;
      }

      const res = await login(normalizedInput, password);
      setIsSubmitting(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Login failed.');
      }
    } else {
      // Admin role selected in Sign Up modal: only Admin Name and Password
      if (role === 'admin') {
        if (name.trim().toLowerCase() !== 'vyugamadmin' || password !== 'VyugamAI2026@password123') {
          setError('Invalid Admin credentials.');
          setIsSubmitting(false);
          return;
        }
        const res = await login('VyugamAdmin', password);
        setIsSubmitting(false);
        if (res.success) {
          onClose();
          window.location.hash = '#admin-portal';
        } else {
          setError(res.error || 'Admin login failed.');
        }
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail.endsWith('@sece.ac.in')) {
        setError('Only mail IDs with domain @sece.ac.in are allowed to sign up.');
        setIsSubmitting(false);
        return;
      }

      const cleanPhone = phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        setError('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
        setIsSubmitting(false);
        return;
      }

      const res = await register({
        name,
        email: normalizedEmail,
        password,
        role,
        college: college || 'Sri Eshwar College of Engineering',
        department: 'AI & Data Science',
        phone: cleanPhone,
      });
      setIsSubmitting(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Registration failed.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-none max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-10 bg-white rounded-none border border-slate-300 px-2 py-0.5 shrink-0 flex items-center justify-center shadow-xs">
              <img
                src="/sece_logo/generated-1 (1).png"
                alt="Vyugam AI Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0a2540] leading-tight">
                {mode === 'login' ? 'Hackathon Portal Log In' : role === 'admin' ? 'Admin Login' : 'Sign Up'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Vyugam AI 2026 &bull; Sri Eshwar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-none bg-slate-200 hover:bg-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700" autoComplete="off">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-none">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block font-semibold mb-1 text-slate-700">Account Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { r: 'student', label: 'Student', icon: GraduationCap },
                  { r: 'evaluator', label: 'Jury', icon: UserCheck },
                  { r: 'admin', label: 'Admin', icon: Shield },
                ].map((item) => (
                  <button
                    key={item.r}
                    type="button"
                    onClick={() => {
                      setError(null);
                      setName('');
                      setPassword('');
                      setRole(item.r as UserRole);
                    }}
                    className={`p-2 rounded-none border flex flex-col items-center gap-1 font-semibold transition-all cursor-pointer ${
                      role === item.r
                        ? 'bg-blue-50 border-[#1755a7] text-[#1755a7] shadow-xs'
                        : 'bg-slate-50 border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-[10px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block font-semibold mb-1 text-slate-700">
                {role === 'admin' ? 'Admin Name *' : 'Full Name *'}
              </label>
              <input
                type="text"
                autoComplete="off"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'admin' ? 'Enter admin name' : 'Arjun Vikram'}
                className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1755a7] focus:ring-1 focus:ring-[#1755a7]"
              />
            </div>
          )}

          {(mode === 'login' || (mode === 'register' && role !== 'admin')) && (
            <div>
              <label className="block font-semibold mb-1 text-slate-700">
                {mode === 'login' ? 'Email Address *' : 'Email Address * (@sece.ac.in)'}
              </label>
              <input
                type={mode === 'login' ? 'text' : 'email'}
                autoComplete="off"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@sece.ac.in"
                className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1755a7] focus:ring-1 focus:ring-[#1755a7]"
              />
            </div>
          )}

          {mode === 'register' && role !== 'admin' && (
            <div>
              <label className="block font-semibold mb-1 text-slate-700">Mobile Number *</label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                pattern="[6-9][0-9]{9}"
                title="Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9"
                required
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                      .replace(/\D/g, '')
                      .replace(/^91(?=\d{10}$)/, '')
                      .slice(0, 10)
                  )
                }
                placeholder="10-digit mobile number (e.g. 9876543210)"
                className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1755a7] focus:ring-1 focus:ring-[#1755a7]"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold mb-1 text-slate-700">Password *</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-2 text-slate-900 focus:outline-none focus:border-[#2e1065] focus:ring-1 focus:ring-[#2e1065]"
            />
            {mode === 'login' && (
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.location.hash = '#login';
                  }}
                  className="text-[11px] text-[#2e1065] hover:underline font-semibold cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {mode === 'register' && role !== 'admin' && (
            <div>
              <label className="block font-semibold mb-1 text-slate-700">College / Institution</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1755a7] focus:ring-1 focus:ring-[#1755a7]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-none bg-[#2e1065] hover:bg-[#3b0764] text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting
              ? 'Processing...'
              : mode === 'login'
              ? 'Log In'
              : role === 'admin'
              ? 'Login as Admin'
              : 'Sign Up'}
          </button>

          <div className="pt-2 text-center text-slate-500">
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => onSwitchMode('register')}
                  className="text-[#2e1065] font-bold hover:underline cursor-pointer"
                >
                  Sign Up Here
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => onSwitchMode('login')}
                  className="text-[#2e1065] font-bold hover:underline cursor-pointer"
                >
                  Log In Here
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
