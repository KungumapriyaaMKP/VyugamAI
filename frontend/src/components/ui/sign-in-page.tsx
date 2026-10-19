import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, Mail, User, Shield, Lock, ArrowRight, Trophy, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { RobotHero } from './robot-hero';

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
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '').slice(0, 10);
      setSignUpData(prev => ({
        ...prev,
        phone: digitsOnly
      }));
      return;
    }
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



  // Sign In Handler
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorMsg('Please enter both your email/username and password.');
      return;
    }

    const rawInput = formData.email.trim();
    const normalizedInput = rawInput.toLowerCase();

    // Direct Admin Login check
    if (normalizedInput === 'vyugamadmin' || normalizedInput === 'vyugamadmin@sece.ac.in') {
      if (formData.password !== 'VyugamAI2026@password123') {
        setErrorMsg('Invalid Admin password.');
        return;
      }
      try {
        setIsSubmitting(true);
        setErrorMsg(null);
        setSuccessMsg(null);
        const res = await login('VyugamAdmin', formData.password);
        if (res.success) {
          setSuccessMsg('Admin logged in successfully!');
          setTimeout(() => {
            window.location.hash = '#admin-portal';
          }, 700);
        } else {
          setErrorMsg(res.error || 'Invalid Admin credentials.');
        }
      } catch (err: any) {
        setErrorMsg('Admin login failed: ' + (err.message || 'Server error'));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!normalizedInput.endsWith('@sece.ac.in')) {
      setErrorMsg('Authentication is restricted to @sece.ac.in college domain accounts.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await login(normalizedInput, formData.password);
      if (res.success) {
        setSuccessMsg('User logged in successfully!');
        setTimeout(() => {
          if (onNavigateHome) {
            onNavigateHome();
          } else {
            navigate('/');
          }
        }, 900);
      } else {
        setErrorMsg(res.error || 'Invalid user credentials. Check your email & password.');
      }
    } catch (err: any) {
      setErrorMsg('Login failed: ' + (err.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign Up / Admin Login Handler
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // When Admin role is selected: login Admin directly with Name: VyugamAdmin & Pass: VyugamAI2026@password123
    if (signUpData.role === 'admin') {
      if (signUpData.name.trim() !== 'VyugamAdmin' && signUpData.name.trim().toLowerCase() !== 'vyugamadmin') {
        setErrorMsg('Invalid Admin Name. Please enter VyugamAdmin.');
        return;
      }
      if (signUpData.password !== 'VyugamAI2026@password123') {
        setErrorMsg('Invalid Admin Password.');
        return;
      }
      try {
        setIsSubmitting(true);
        setErrorMsg(null);
        setSuccessMsg(null);
        const res = await login('VyugamAdmin', signUpData.password);
        if (res.success) {
          setSuccessMsg('Admin logged in successfully!');
          setTimeout(() => {
            window.location.hash = '#admin-portal';
          }, 700);
        } else {
          setErrorMsg(res.error || 'Invalid Admin credentials.');
        }
      } catch (err: any) {
        setErrorMsg('Admin login failed: ' + (err.message || 'Server error'));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!signUpData.name.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    const normalizedEmail = signUpData.email.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@sece.ac.in')) {
      setErrorMsg('Only mail IDs with domain @sece.ac.in are allowed to register.');
      return;
    }
    const cleanPhone = signUpData.phone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (!cleanPhone) {
      setErrorMsg('Mobile Number is required.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMsg('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
      return;
    }
    if (signUpData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
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
        phone: cleanPhone
      });

      if (res.success) {
        setSuccessMsg('User registered successfully!');
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

      {/* Top Floating Bar: Back to Home & Brand */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between pb-6 relative z-20">
        <button
          onClick={() => {
            if (onNavigateHome) onNavigateHome();
            else navigate('/');
          }}
          className="flex items-center gap-2 px-3.5 py-2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-xl transition-all border border-slate-200 shadow-xs cursor-pointer group backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 text-purple-600 group-hover:-translate-x-0.5 transition-transform" />
          <span>Return to Home</span>
        </button>

        {/* Brand Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-xs">
          <img
            src="/sece_logo/generated-1 (1).png"
            alt="Vyugam AI"
            className="h-5 w-auto object-contain"
          />
          <span className="text-xs font-bold tracking-tight text-slate-800">
            VYUGAM <span className="text-purple-600">AI 2026</span>
          </span>
        </div>
      </div>

      {/* Main Two-Column Half Page Layout */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: INTERACTIVE 3D ROBOT HERO                   */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 w-full flex flex-col justify-center">
          <div className="w-full h-[500px] sm:h-[560px] lg:h-[620px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-xl shadow-purple-500/5 relative bg-gradient-to-b from-purple-50/40 via-slate-50 to-white">
            <RobotHero
              backgroundText="VYUGAM"
              scale={1.05}
              pantallaColor="#00ffc6"
              pantallaBrillo={1.4}
              color="#d4d4d8"
              metalness={0.1}
              showNav={false}
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: CLEAN PROFESSIONAL LOGIN / SIGN UP FORM    */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 w-full">
          <div className="relative bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 lg:p-9 shadow-xl shadow-slate-200/60">
            
            {/* Segment Tab Switcher: Log In vs Sign Up */}
            <div className="flex bg-slate-100/90 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={handleSwitchToLogin}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  viewMode === 'signin'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>Log In</span>
              </button>

              <button
                type="button"
                onClick={handleSwitchToSignup}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  viewMode === 'signup'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>Sign Up</span>
              </button>
            </div>

            {/* Header Titles */}
            <div className="pb-5">
              {viewMode === 'signin' && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    Welcome back
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Enter your credentials to access your hackathon dashboard
                  </p>
                </div>
              )}

              {viewMode === 'signup' && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    Create an account
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Register to submit ideas, collaborate, or evaluate teams
                  </p>
                </div>
              )}

              {viewMode === 'forgot' && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    Reset your password
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {forgotStep === 1
                      ? 'Enter your @sece.ac.in email to receive a verification code'
                      : 'Enter the 6-digit verification code to set your new password'}
                  </p>
                </div>
              )}
            </div>

            {/* Notifications & Error Alerts */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {demoOtpNotice && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 text-purple-900 text-xs font-medium rounded-xl flex items-center justify-between">
                <span>Verification OTP: <strong className="text-purple-700 font-bold">{demoOtpNotice}</strong></span>
                <span className="text-[10px] bg-purple-200/80 text-purple-800 px-2 py-0.5 rounded-md font-semibold">Demo Code</span>
              </div>
            )}

            {/* ==================================================== */}
            {/* VIEW 1: SIGN IN FORM                                 */}
            {/* ==================================================== */}
            {viewMode === 'signin' && (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                {/* Email / Admin Name Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address / Admin Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@sece.ac.in or VyugamAdmin"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-100 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
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
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-100 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-slate-600 font-medium">Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleSwitchToForgot}
                    className="font-semibold text-purple-600 hover:text-purple-700 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Primary Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>


              </form>
            )}

            {/* ==================================================== */}
            {/* VIEW 2: SIGN UP / ADMIN LOGIN FORM                   */}
            {/* ==================================================== */}
            {viewMode === 'signup' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                
                {/* Account Type / Role Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Account Type *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { role: 'student', label: 'Student', icon: User, desc: 'Participant' },
                      { role: 'evaluator', label: 'Jury', icon: Trophy, desc: 'Evaluator' },
                      { role: 'admin', label: 'Admin', icon: Shield, desc: 'Coordinator' },
                    ].map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => {
                          setErrorMsg(null);
                          setSignUpData(prev => ({ ...prev, role: item.role as UserRole }));
                        }}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          signUpData.role === item.role
                            ? 'bg-purple-50 border-purple-600 text-purple-900 shadow-xs'
                            : 'bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <item.icon className={`w-3.5 h-3.5 ${signUpData.role === item.role ? 'text-purple-600' : 'text-slate-400'}`} />
                        <span className="text-xs font-semibold">{item.label}</span>
                        <span className="text-[10px] text-slate-400">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name Field (Admin Name vs Full Name) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {signUpData.role === 'admin' ? 'Admin Name *' : 'Full Name *'}
                  </label>
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
                      placeholder={signUpData.role === 'admin' ? 'VyugamAdmin' : 'e.g. Arjun Vikram'}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-100 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Student / Jury Fields ONLY (Hidden for Admin) */}
                {signUpData.role !== 'admin' && (
                  <>
                    {/* College Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        College Email *
                      </label>
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
                          placeholder="student@sece.ac.in"
                          className="w-full pl-10 pr-4 py-2 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-100 transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          inputMode="numeric"
                          maxLength={10}
                          pattern="[6-9][0-9]{9}"
                          title="Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9"
                          required
                          value={signUpData.phone}
                          onChange={handleSignUpInputChange}
                          placeholder="10-digit mobile number (e.g. 9876543210)"
                          className={`w-full pl-10 pr-4 py-2 bg-slate-50/70 hover:bg-white border rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-4 transition-all placeholder:text-slate-400 ${
                            signUpData.phone.length > 0 && !/^[6-9]\d{9}$/.test(signUpData.phone)
                              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                              : 'border-slate-200 focus:border-purple-600 focus:ring-purple-100'
                          }`}
                        />
                      </div>
                      {signUpData.phone.length > 0 && !/^[6-9]\d{9}$/.test(signUpData.phone) && (
                        <p className="text-[11px] text-rose-600 font-medium mt-1">
                          {/^[0-5]/.test(signUpData.phone)
                            ? 'Mobile number must start with 6, 7, 8, or 9.'
                            : `Enter all 10 digits (${signUpData.phone.length}/10).`}
                        </p>
                      )}
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Department
                      </label>
                      <select
                        name="department"
                        value={signUpData.department}
                        onChange={handleSignUpInputChange}
                        className="w-full px-3 py-2 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-100 transition-all cursor-pointer"
                      >
                        <option value="Department of AI & DS">AI & Data Science (Official Track)</option>
                        <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Cyber Security">Cyber Security Wing</option>
                        <option value="Electronics & Communication">Electronics & Communication</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Password Field (Single field for Admin, Password + Confirm for Student/Jury) */}
                {signUpData.role === 'admin' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showSignUpPassword ? 'text' : 'password'}
                        name="password"
                        required
                        value={signUpData.password}
                        onChange={handleSignUpInputChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-100 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showSignUpPassword ? 'text' : 'password'}
                          name="password"
                          required
                          value={signUpData.password}
                          onChange={handleSignUpInputChange}
                          placeholder="Min 6 chars"
                          className="w-full pl-3 pr-8 py-2 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-100 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showSignUpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Confirm *
                      </label>
                      <div className="relative">
                        <input
                          type={showSignUpConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          required
                          value={signUpData.confirmPassword}
                          onChange={handleSignUpInputChange}
                          placeholder="Confirm password"
                          className="w-full pl-3 pr-8 py-2 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-100 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showSignUpConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>
                    {isSubmitting
                      ? signUpData.role === 'admin'
                        ? 'Logging in...'
                        : 'Creating account...'
                      : signUpData.role === 'admin'
                      ? 'Login as Admin'
                      : 'Create Account'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </form>
            )}

            {/* ==================================================== */}
            {/* VIEW 3: FORGOT PASSWORD 2-STEP WORKFLOW              */}
            {/* ==================================================== */}
            {viewMode === 'forgot' && (
              <div className="pt-1">
                {forgotStep === 1 ? (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Registered Email Address
                      </label>
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
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-100 transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{isSubmitting ? 'Generating code...' : 'Send Verification OTP'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleSwitchToLogin}
                      className="w-full text-center text-xs font-semibold text-slate-600 hover:text-purple-600 transition-colors pt-1 cursor-pointer"
                    >
                      Back to Log In
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        6-Digit Verification Code *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full px-4 py-2.5 bg-slate-50/70 hover:bg-white border border-purple-300 rounded-xl text-center font-mono font-bold text-lg tracking-[0.25em] text-purple-900 focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-100 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 6 chars"
                            className="w-full pl-3 pr-8 py-2 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-purple-600"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Confirm *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            className="w-full pl-3 pr-8 py-2 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-purple-600"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{isSubmitting ? 'Saving password...' : 'Confirm & Sign In'}</span>
                      <CheckCircle className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleSwitchToLogin}
                      className="w-full text-center text-xs font-semibold text-slate-600 hover:text-purple-600 transition-colors pt-1 cursor-pointer"
                    >
                      Back to Log In
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
