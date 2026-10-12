import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, Mail, User, Shield, Lock, ArrowRight, Play, Gamepad2, Trophy, Swords } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface LoginPageProps {
  initialMode?: 'login' | 'signup';
  onNavigateHome?: () => void;
  onNavigateSignup?: () => void;
  onNavigateLogin?: () => void;
}

export function LoginPage({ initialMode = 'login', onNavigateHome, onNavigateSignup, onNavigateLogin }: LoginPageProps) {
  const navigate = (path: string) => {
    if (path === '/' && onNavigateHome) {
      onNavigateHome();
    } else if (onNavigateSignup) {
      onNavigateSignup();
    } else if (onNavigateHome) {
      onNavigateHome();
    }
  };

  const { login, register, forgotPassword, resetPassword } = useAuth();

  // Mode: 'signin' | 'signup' | 'forgot'
  const [viewMode, setViewMode] = useState<'signin' | 'signup' | 'forgot'>(() => {
    return initialMode === 'signup' ? 'signup' : 'signin';
  });

  useEffect(() => {
    if (initialMode === 'signup') {
      setViewMode('signup');
    } else if (initialMode === 'login') {
      setViewMode('signin');
    }
  }, [initialMode]);

  // Sign In Form State
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true
  });

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as UserRole,
    college: 'Sri Eshwar College of Engineering',
    department: 'Department of AI & DS',
    phone: ''
  });
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [demoOtpNotice, setDemoOtpNotice] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSignUpInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSignUpData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchToSignup = () => {
    setViewMode('signup');
    setErrorMsg(null);
    setSuccessMsg(null);
    if (onNavigateSignup) onNavigateSignup();
  };

  const handleSwitchToLogin = () => {
    setViewMode('signin');
    setErrorMsg(null);
    setSuccessMsg(null);
    if (onNavigateLogin) onNavigateLogin();
  };

  const handleSwitchToForgot = () => {
    setViewMode('forgot');
    setForgotStep(1);
    setForgotEmail(formData.email || '');
    setErrorMsg(null);
    setSuccessMsg(null);
    setDemoOtpNotice(null);
  };

  // Demo autofill
  const handleAutofill = (email: string, pass: string) => {
    setFormData({
      email,
      password: pass,
      rememberMe: true
    });
    setErrorMsg(null);
    setSuccessMsg(`Loaded Player: ${email}`);
  };

  // Sign In Handler
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    const normalizedEmail = formData.email.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@sece.ac.in')) {
      setErrorMsg('Authentication is restricted to @sece.ac.in college domain accounts.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await login(normalizedEmail, formData.password);
      if (res.success) {
        setSuccessMsg('Player authentication successful! Entering Vyugam Arena...');
        setTimeout(() => {
          if (onNavigateHome) {
            onNavigateHome();
          } else {
            navigate('/');
          }
        }, 900);
      } else {
        setErrorMsg(res.error || 'Invalid player credentials. Check your email & password.');
      }
    } catch (err: any) {
      setErrorMsg('Login failed: ' + (err.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign Up Handler
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpData.name.trim()) {
      setErrorMsg('Player Name is required.');
      return;
    }
    const normalizedEmail = signUpData.email.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@sece.ac.in')) {
      setErrorMsg('Only mail IDs with domain @sece.ac.in are allowed to register.');
      return;
    }
    if (signUpData.password.length < 6) {
      setErrorMsg('Passcode must be at least 6 characters long.');
      return;
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      setErrorMsg('Passcodes do not match. Please re-enter.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await register({
        name: signUpData.name.trim(),
        email: normalizedEmail,
        password: signUpData.password,
        role: signUpData.role,
        college: signUpData.college || 'Sri Eshwar College of Engineering',
        department: signUpData.department || 'Department of AI & DS',
        phone: signUpData.phone || ''
      });

      if (res.success) {
        setSuccessMsg('Player registered successfully! Entering Vyugam Arena...');
        setTimeout(() => {
          if (onNavigateHome) onNavigateHome();
          else navigate('/');
        }, 1100);
      } else {
        setErrorMsg(res.error || 'Registration failed. Please check your details.');
      }
    } catch (err: any) {
      setErrorMsg('Sign Up failed: ' + (err.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = forgotEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      setErrorMsg('Please enter your @sece.ac.in address.');
      return;
    }
    if (!normalizedEmail.endsWith('@sece.ac.in')) {
      setErrorMsg('Only accounts with domain @sece.ac.in are registered.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await forgotPassword(normalizedEmail);
      if (res.success) {
        setForgotStep(2);
        setSuccessMsg(res.message || 'Verification passcode generated successfully!');
        if (res.otp) {
          setDemoOtpNotice(res.otp);
        }
      } else {
        setErrorMsg(res.error || 'Failed to generate reset passcode.');
      }
    } catch (err: any) {
      setErrorMsg('Error: ' + (err.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp.trim()) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New passcode must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passcodes do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await resetPassword(forgotEmail, resetOtp, newPassword);
      if (res.success) {
        setSuccessMsg('Passcode reset successfully! Entering Arena...');
        setFormData(prev => ({
          ...prev,
          email: forgotEmail,
          password: newPassword
        }));
        setTimeout(() => {
          if (onNavigateHome) onNavigateHome();
          else navigate('/');
        }, 1100);
      } else {
        setErrorMsg(res.error || 'Failed to reset. Invalid verification code.');
      }
    } catch (err: any) {
      setErrorMsg('Reset failed: ' + (err.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#fbf9fe] text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 relative overflow-x-hidden selection:bg-purple-600 selection:text-white">
      
      {/* Ambient Cyber Neon Glows (Clean white with purple, not too dark) */}
      <div className="absolute top-0 left-1/4 w-[550px] h-[550px] bg-purple-300/25 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-fuchsia-200/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[420px] h-[420px] bg-cyan-200/25 rounded-full blur-[110px] pointer-events-none" />
      
      {/* Cyber Grid Matrix Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage: 'radial-gradient(rgba(147, 51, 234, 0.22) 1.5px, transparent 1.5px), radial-gradient(rgba(56, 189, 248, 0.2) 1.5px, transparent 1.5px)',
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0, 18px 18px'
        }}
      />

      {/* Top Floating Bar: Back to HQ */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between pb-6 relative z-20">
        <button
          onClick={() => {
            if (onNavigateHome) onNavigateHome();
            else navigate('/');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-none text-slate-800 text-xs font-bold hover:text-[#2e1065] hover:bg-white transition-all border border-purple-200 shadow-xs cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-purple-600 group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono tracking-wider uppercase">Return to Headquarters</span>
        </button>

        {/* Brand Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1 bg-white/80 backdrop-blur-md border border-purple-200/80 rounded-none shadow-2xs">
          <img
            src="/images/vyugam_official_logo.png?v=5"
            alt="Vyugam AI"
            className="w-6 h-6 object-contain"
          />
          <span className="text-xs font-black tracking-wider text-[#2e1065] font-mono uppercase">
            VYUGAM <span className="text-fuchsia-600">ARENA 2026</span>
          </span>
        </div>
      </div>

      {/* Main Two-Column Gamified Canvas */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: GAMIFIED "READY TO LEVEL UP?" HERO SECTION */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-7">
          
          <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-black tracking-tight text-slate-900 leading-[1.1]">
            Ready for the <span className="bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent drop-shadow-xs">greatest hackathon?</span>
          </h1>


          {/* Big Action Button: ENTER PLATFORM ▶ */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                if (onNavigateHome) onNavigateHome();
                else navigate('/');
              }}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-mono font-black text-xs sm:text-sm tracking-wider uppercase rounded-none shadow-[0_0_25px_rgba(217,70,239,0.5)] hover:shadow-[0_0_35px_rgba(217,70,239,0.7)] transition-all cursor-pointer group"
            >
              <span>ENTER PLATFORM</span>
              <Play className="w-3.5 h-3.5 fill-current group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: CYBER HUD FORM BOX WITH 4 CORNER BRACKETS  */}
        {/* ======================================================== */}
        <div className="lg:col-span-7">
          <div className="relative bg-white/95 backdrop-blur-xl border-2 border-purple-300/80 p-7 sm:p-10 shadow-[0_20px_60px_rgba(147,51,234,0.18)]">
            
            {/* ==================================================== */}
            {/* 4 GLOWING NEON CYBER HUD CORNER BRACKETS (┌ ┐ └ ┘)   */}
            {/* Exact match to the user's reference image!          */}
            {/* ==================================================== */}
            {/* Top-Left Bracket */}
            <div className="absolute -top-3.5 -left-3.5 w-8 h-8 pointer-events-none">
              <div className="w-full h-full border-t-[3.5px] border-l-[3.5px] border-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
              <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-purple-500" />
            </div>

            {/* Top-Right Bracket */}
            <div className="absolute -top-3.5 -right-3.5 w-8 h-8 pointer-events-none">
              <div className="w-full h-full border-t-[3.5px] border-r-[3.5px] border-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
              <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-purple-500" />
            </div>

            {/* Bottom-Left Bracket */}
            <div className="absolute -bottom-3.5 -left-3.5 w-8 h-8 pointer-events-none">
              <div className="w-full h-full border-b-[3.5px] border-l-[3.5px] border-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]" />
              <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
            </div>

            {/* Bottom-Right Bracket */}
            <div className="absolute -bottom-3.5 -right-3.5 w-8 h-8 pointer-events-none">
              <div className="w-full h-full border-b-[3.5px] border-r-[3.5px] border-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
              <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-purple-500" />
            </div>

            {/* Mode Switcher Pills: Log In vs Sign Up */}
            <div className="flex items-center gap-2 pb-6 border-b border-purple-100">
              <button
                type="button"
                onClick={handleSwitchToLogin}
                className={`flex-1 py-2.5 px-4 text-xs font-mono font-black tracking-wider uppercase rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  viewMode === 'signin'
                    ? 'bg-[#2e1065] text-white shadow-md'
                    : 'bg-purple-50 text-slate-700 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>LOG IN</span>
              </button>

              <button
                type="button"
                onClick={handleSwitchToSignup}
                className={`flex-1 py-2.5 px-4 text-xs font-mono font-black tracking-wider uppercase rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  viewMode === 'signup'
                    ? 'bg-[#2e1065] text-white shadow-md'
                    : 'bg-purple-50 text-slate-700 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                <Swords className="w-3.5 h-3.5 text-cyan-500" />
                <span>SIGN UP / SQUAD</span>
              </button>
            </div>

            {/* Header Titles */}
            <div className="pt-5 pb-2">
              {viewMode === 'signin' && (
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-purple-800 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">
                    WELCOME BACK
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Log in to continue your path
                  </p>
                </div>
              )}

              {viewMode === 'signup' && (
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-purple-800 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">
                    JOIN THE SQUAD
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Register your 4-student squad &amp; select your player role
                  </p>
                </div>
              )}

              {viewMode === 'forgot' && (
                <div>
                  <div className="text-[11px] font-mono font-black tracking-[0.25em] text-slate-500 uppercase">
                    SECURITY ACCESS RECOVERY,
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                    RESET PASSCODE
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {forgotStep === 1 ? 'Enter your @sece.ac.in email to generate verification code' : 'Enter 6-digit code to set new passcode'}
                  </p>
                </div>
              )}
            </div>

            {/* Notifications & Error Alerts */}
            {errorMsg && (
              <div className="my-3 p-3 bg-rose-50 border-2 border-rose-300 text-rose-700 text-xs font-bold rounded-none flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="my-3 p-3 bg-emerald-50 border-2 border-emerald-300 text-emerald-700 text-xs font-bold rounded-none flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {demoOtpNotice && (
              <div className="my-3 p-3 bg-purple-50 border-2 border-purple-300 text-[#2e1065] text-xs font-mono font-bold rounded-none flex items-center justify-between">
                <span>VERIFICATION OTP: <strong className="text-fuchsia-700 font-black text-sm">{demoOtpNotice}</strong></span>
                <span className="text-[10px] bg-purple-200 px-2 py-0.5 rounded-none uppercase">Instant Code</span>
              </div>
            )}

            {/* ==================================================== */}
            {/* VIEW 1: SIGN IN FORM                                 */}
            {/* ==================================================== */}
            {viewMode === 'signin' && (
              <form onSubmit={handleSignInSubmit} className="space-y-4 pt-3">
                {/* Email Field with Icon */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="ben@gmail.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border-2 border-slate-200 rounded-none text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-200/50 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password Field with Icon and Eye Toggle */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-slate-50/80 border-2 border-slate-200 rounded-none text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-200/50 transition-all placeholder:text-slate-400 tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-purple-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded-none border-2 border-purple-400 text-purple-600 focus:ring-purple-400"
                    />
                    <span className="font-semibold text-slate-700">Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleSwitchToForgot}
                    className="font-bold text-purple-700 hover:text-fuchsia-600 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Big Neon Gradient Primary Button: START LEARNING → */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-[#9333ea] via-[#c026d3] to-[#e11d48] hover:from-purple-600 hover:to-pink-600 text-white font-mono font-black text-xs sm:text-sm tracking-widest uppercase rounded-none shadow-[0_0_25px_rgba(192,38,211,0.55)] hover:shadow-[0_0_35px_rgba(192,38,211,0.75)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer group mt-2"
                >
                  <span>{isSubmitting ? 'AUTHENTICATING...' : 'START LEARNING'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* OR Divider */}
                <div className="relative my-4 flex items-center justify-center">
                  <div className="border-t border-purple-200 w-full" />
                  <span className="bg-white px-3 text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest relative">
                    OR
                  </span>
                  <div className="border-t border-purple-200 w-full" />
                </div>

                {/* Social & Google / Discord Badges (Matching Screenshot) */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleAutofill('arjun@sece.ac.in', 'student123')}
                    title="Quick Demo: Arjun Vikram (Student)"
                    className="p-2.5 bg-slate-50 hover:bg-purple-50 border-2 border-slate-200 hover:border-purple-300 rounded-none transition-all shadow-xs flex items-center justify-center cursor-pointer group"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAutofill('meera.evaluator@sece.ac.in', 'eval123')}
                    title="Quick Demo: Prof. Meera (Jury Evaluator)"
                    className="p-2.5 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border-2 border-[#5865F2]/30 rounded-none transition-all shadow-xs flex items-center justify-center cursor-pointer group"
                  >
                    <svg className="w-5 h-5 fill-[#5865F2]" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAutofill('admin@sece.ac.in', 'admin123')}
                    title="Quick Demo: Dr. Sharma (Admin Chair)"
                    className="p-2.5 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-none transition-all shadow-xs flex items-center justify-center cursor-pointer group"
                  >
                    <Shield className="w-5 h-5 text-[#2e1065]" />
                  </button>
                </div>

                {/* Quick Auto-Fill Text Pills */}
                <div className="pt-2 text-center">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                    Demo Fast Access Credentials:
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => handleAutofill('arjun@sece.ac.in', 'student123')}
                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-none cursor-pointer"
                    >
                      Arjun (Student)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutofill('meera.evaluator@sece.ac.in', 'eval123')}
                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-none cursor-pointer"
                    >
                      Prof. Meera (Jury)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutofill('admin@sece.ac.in', 'admin123')}
                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-none cursor-pointer"
                    >
                      Dr. Sharma (Admin)
                    </button>
                  </div>
                </div>

              </form>
            )}

            {/* ==================================================== */}
            {/* VIEW 2: SIGN UP / SQUAD REGISTRATION FORM            */}
            {/* ==================================================== */}
            {viewMode === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-4 pt-3">
                
                {/* Role / Class Selection */}
                <div>
                  <label className="block text-[11px] font-mono font-black text-slate-800 uppercase tracking-wider mb-1.5">
                    Select Your Player Class *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { role: 'student', label: 'Hacker', icon: Swords },
                      { role: 'evaluator', label: 'Jury', icon: Trophy },
                      { role: 'admin', label: 'Admin', icon: Shield },
                    ].map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setSignUpData(prev => ({ ...prev, role: item.role as UserRole }))}
                        className={`p-2.5 rounded-none border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          signUpData.role === item.role
                            ? 'bg-[#2e1065] text-white border-[#2e1065] shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-300'
                        }`}
                      >
                        <item.icon className={`w-4 h-4 ${signUpData.role === item.role ? 'text-cyan-400' : 'text-purple-600'}`} />
                        <span className="text-[11px] font-mono font-bold uppercase">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Player Name */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      value={signUpData.name}
                      onChange={handleSignUpInputChange}
                      placeholder="Player Full Name"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border-2 border-slate-200 rounded-none text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-200/50 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Email Address (@sece.ac.in) */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={signUpData.email}
                      onChange={handleSignUpInputChange}
                      placeholder="player@sece.ac.in"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border-2 border-slate-200 rounded-none text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-200/50 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <select
                    name="department"
                    value={signUpData.department}
                    onChange={handleSignUpInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50/80 border-2 border-slate-200 rounded-none text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-200/50 transition-all"
                  >
                    <option value="Department of AI & DS">AI & Data Science (Official Track)</option>
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Cyber Security">Cyber Security Wing</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                  </select>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={signUpData.password}
                      onChange={handleSignUpInputChange}
                      placeholder="Passcode (min 6)"
                      className="w-full pl-3 pr-8 py-2.5 bg-slate-50/80 border-2 border-slate-200 rounded-none text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-200/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-purple-600 cursor-pointer"
                    >
                      {showSignUpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showSignUpConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      value={signUpData.confirmPassword}
                      onChange={handleSignUpInputChange}
                      placeholder="Confirm Passcode"
                      className="w-full pl-3 pr-8 py-2.5 bg-slate-50/80 border-2 border-slate-200 rounded-none text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-200/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-purple-600 cursor-pointer"
                    >
                      {showSignUpConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Primary Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-[#9333ea] via-[#c026d3] to-[#e11d48] hover:from-purple-600 hover:to-pink-600 text-white font-mono font-black text-xs sm:text-sm tracking-widest uppercase rounded-none shadow-[0_0_25px_rgba(192,38,211,0.55)] hover:shadow-[0_0_35px_rgba(192,38,211,0.75)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer group mt-2"
                >
                  <span>{isSubmitting ? 'CREATING PLAYER PROFILE...' : 'INITIALIZE SQUAD PROFILE'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

              </form>
            )}

            {/* ==================================================== */}
            {/* VIEW 3: FORGOT PASSWORD 2-STEP WORKFLOW              */}
            {/* ==================================================== */}
            {viewMode === 'forgot' && (
              <div className="pt-3">
                {forgotStep === 1 ? (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="your.email@sece.ac.in"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border-2 border-slate-200 rounded-none text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-200/50 transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 text-white font-mono font-black text-xs sm:text-sm tracking-widest uppercase rounded-none shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{isSubmitting ? 'GENERATING CODE...' : 'SEND VERIFICATION OTP'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">
                        6-Digit Verification Code *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value)}
                        placeholder="e.g. 583921"
                        className="w-full px-4 py-3 bg-slate-50/80 border-2 border-purple-300 rounded-none text-center font-mono font-black text-lg tracking-[0.3em] text-[#2e1065] focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-200/50 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New Passcode (min 6)"
                          className="w-full pl-3 pr-8 py-2.5 bg-slate-50/80 border-2 border-slate-200 rounded-none text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-purple-600 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm Passcode"
                          className="w-full pl-3 pr-8 py-2.5 bg-slate-50/80 border-2 border-slate-200 rounded-none text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-purple-600 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-mono font-black text-xs sm:text-sm tracking-widest uppercase rounded-none shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{isSubmitting ? 'SAVING PASSCODE...' : 'CONFIRM & ENTER ARENA'}</span>
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
