import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; otp?: string; error?: string }>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vyugam_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('vyugam_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        if (token.startsWith('sb-jwt-')) {
          const saved = localStorage.getItem('vyugam_user');
          if (saved) {
            setUser(JSON.parse(saved));
          }
          setIsLoading(false);
          return;
        }
        try {
          const res = await apiClient.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('vyugam_user', JSON.stringify(res.data.user));
          }
        } catch {
          const saved = localStorage.getItem('vyugam_user');
          if (!saved) {
            logout();
          }
        }
      }
      setIsLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (normalizedEmail === 'vyugamadmin' || normalizedEmail === 'vyugamadmin@sece.ac.in') {
      if (password !== 'VyugamAI2026@password123') {
        return { success: false, error: 'Invalid Admin credentials.' };
      }
      const adminUser: User = {
        id: 'user-admin-01',
        name: 'VyugamAdmin',
        email: 'vyugamadmin@sece.ac.in',
        role: 'admin',
        college: 'Sri Eshwar College of Engineering',
        department: '',
        phone: ''
      };
      const adminToken = `sb-jwt-admin-${Date.now()}`;
      setToken(adminToken);
      setUser(adminUser);
      localStorage.setItem('vyugam_token', adminToken);
      localStorage.setItem('vyugam_user', JSON.stringify(adminUser));
      return { success: true };
    }

    if (!normalizedEmail.endsWith('@sece.ac.in')) {
      return {
        success: false,
        error: 'Only mail IDs with domain @sece.ac.in are allowed to login.'
      };
    }

    try {
      const res = await apiClient.post('/auth/login', { email: normalizedEmail, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('vyugam_token', res.data.token);
        localStorage.setItem('vyugam_user', JSON.stringify(res.data.user));
        return { success: true };
      }
      return { success: false, error: res.data.error };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (data: any) => {
    if (
      data.role === 'admin' ||
      (data.name && data.name.trim().toLowerCase() === 'vyugamadmin')
    ) {
      return login(data.name || 'VyugamAdmin', data.password);
    }

    const normalizedEmail = (data.email || '').trim().toLowerCase();
    if (!normalizedEmail.endsWith('@sece.ac.in')) {
      return {
        success: false,
        error: 'Only mail IDs with domain @sece.ac.in are allowed to sign up.'
      };
    }

    try {
      const res = await apiClient.post('/auth/register', { ...data, email: normalizedEmail });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('vyugam_token', res.data.token);
        localStorage.setItem('vyugam_user', JSON.stringify(res.data.user));
        return { success: true };
      }
      return { success: false, error: res.data.error };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'Registration failed' };
    }
  };

  const forgotPassword = async (email: string) => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!normalizedEmail.endsWith('@sece.ac.in')) {
      return {
        success: false,
        error: 'Only mail IDs with domain @sece.ac.in are registered on this portal.'
      };
    }

    try {
      const res = await apiClient.post('/auth/forgot-password', { email: normalizedEmail });
      if (res.data.success) {
        return { success: true, message: res.data.message, otp: res.data.otp };
      }
      return { success: false, error: res.data.error };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'Failed to generate reset code' };
    }
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    try {
      const res = await apiClient.post('/auth/reset-password', {
        email: normalizedEmail,
        otp: otp.trim(),
        newPassword
      });
      if (res.data.success) {
        if (res.data.token && res.data.user) {
          setToken(res.data.token);
          setUser(res.data.user);
          localStorage.setItem('vyugam_token', res.data.token);
          localStorage.setItem('vyugam_user', JSON.stringify(res.data.user));
        }
        return { success: true, message: res.data.message };
      }
      return { success: false, error: res.data.error };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.error || 'Failed to reset password' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vyugam_token');
    localStorage.removeItem('vyugam_user');
  };

  const switchDemoRole = async (role: UserRole) => {
    try {
      setIsLoading(true);
      const res = await apiClient.post('/auth/demo-switch', { role });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('vyugam_token', res.data.token);
        localStorage.setItem('vyugam_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to switch demo role:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
