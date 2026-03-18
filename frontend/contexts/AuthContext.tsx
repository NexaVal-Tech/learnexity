'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, handleApiError } from '@/lib/api';
import type { User } from '@/lib/types';
import { useRouter } from 'next/router';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
    phone?: string,
    referralCode?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loginWithGoogle: () => void;
  clearError: () => void;
  setUserFromToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch user on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const userData = await api.auth.me();
        setUser(userData);
      } catch {
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const clearError = () => setError(null);

  // LOGIN
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await api.auth.login({ email, password });

      if (response.token) {
        localStorage.setItem('token', response.token);
      }

      await refreshUser();

      const intendedCourse = sessionStorage.getItem('intended_course');
      const intendedCourseName = sessionStorage.getItem('intended_course_name');

      if (intendedCourse && intendedCourseName) {
          sessionStorage.removeItem('intended_course');
          sessionStorage.removeItem('intended_course_name');
          // Only allow safe alphanumeric course IDs
          const safeCourseId = intendedCourse.replace(/[^a-zA-Z0-9_-]/g, '');
          if (safeCourseId) {
              router.push(`/courses/${safeCourseId}`);
              return;
          }
      }

      router.push('/user/dashboard');
    } catch (error) {
      const err = handleApiError(error);
      setError(err);
      throw new Error(err);
    }
  };

  const setUserFromToken = async (token: string) => {
    try {
      localStorage.setItem('token', token);
      const userData = await api.auth.me();
      setUser(userData);
    } catch (error) {
      // console.error('Failed to set user from token:', error);
      localStorage.removeItem('token');
      throw error;
    }
  };

  // REGISTER (with logging + referral support)
  // REGISTER
  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
    phone?: string,
    referralCode?: string
  ) => {
    try {
      setError(null);

      const payload: any = {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      };

      if (phone) payload.phone = phone;
      if (referralCode) payload.referral_code = referralCode;

      await api.auth.register(payload);

      // ✅ Move router.push OUTSIDE the try/catch
      // so navigation errors don't get caught and re-thrown as "server error"
      
    } catch (error: any) {
      const err = handleApiError(error);
      setError(err);
      throw new Error(err);
    }

    // ✅ Navigate AFTER try/catch completes — not inside it
    await router.replace(`/user/auth/login?message=verify_email&email=${encodeURIComponent(email)}`);
  };


  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setError(null);
      localStorage.removeItem('token');
      router.push('/user/auth/login');
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
    } catch {
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  // GOOGLE LOGIN (with referral awareness)
  const loginWithGoogle = () => {
    // console.log('🔵 [AUTH CONTEXT] Initiating Google login');

    const referralCode = sessionStorage.getItem('pending_referral_code');
    if (referralCode) {
      // console.log('📌 [AUTH CONTEXT] Found referral code in localStorage:', referralCode);
    }

    api.auth.googleRedirect();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser,
        loginWithGoogle,
        clearError,
        setUserFromToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
