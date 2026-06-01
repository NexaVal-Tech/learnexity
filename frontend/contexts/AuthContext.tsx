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
    name: string, email: string, password: string,
    passwordConfirmation: string, phone?: string, referralCode?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loginWithGoogle: () => void;
  clearError: () => void;
  setUserFromToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function resolvePostLoginRedirect(router: ReturnType<typeof useRouter>) {
  const scholarshipRedirect = sessionStorage.getItem('scholarship_course_redirect');
  if (scholarshipRedirect) {
    sessionStorage.removeItem('scholarship_course_redirect');
    const safeId = scholarshipRedirect.replace(/[^a-zA-Z0-9_-]/g, '');
    if (safeId) { router.push(`/scholarships/${safeId}`); return; }
  }

  const browseCourses = sessionStorage.getItem('scholarship_browse_courses');
  if (browseCourses) {
    sessionStorage.removeItem('scholarship_browse_courses');
    router.push('/courses/courses');
    return;
  }

  const intendedCourse = sessionStorage.getItem('intended_course');
  if (intendedCourse) {
    sessionStorage.removeItem('intended_course');
    sessionStorage.removeItem('intended_course_name');
    const safeId = intendedCourse.replace(/[^a-zA-Z0-9_-]/g, '');
    if (safeId) { router.push(`/courses/${safeId}`); return; }
  }

  router.push('/user/dashboard');
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setUser(null); setLoading(false); return; }
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

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await api.auth.login({ email, password });
      if (response.token) localStorage.setItem('token', response.token);
      await refreshUser();
      resolvePostLoginRedirect(router);
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
      localStorage.removeItem('token');
      throw error;
    }
  };

  const register = async (
    name: string, email: string, password: string,
    passwordConfirmation: string, phone?: string, referralCode?: string
  ) => {
    try {
      setError(null);
      const payload: any = { name, email, password, password_confirmation: passwordConfirmation };
      if (phone)        payload.phone         = phone;
      if (referralCode) payload.referral_code = referralCode;
      await api.auth.register(payload);
    } catch (error: any) {
      const err = handleApiError(error);
      setError(err);
      throw new Error(err);
    }
    await router.replace(
      `/user/auth/login?message=verify_email&email=${encodeURIComponent(email)}`
    );
  };

  const logout = async () => {
    try { await api.auth.logout(); } catch {}
    setUser(null);
    setError(null);
    localStorage.removeItem('token');
    router.push('/user/auth/login');
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

  // FIX: referral code is now passed as ?ref= on the redirect URL so the
  // backend redirectToGoogle() method can read it and store it in session.
  // Previously the ref was only in sessionStorage, which the Laravel backend
  // cannot access — so it was silently lost on every Google signup.
  const loginWithGoogle = () => {
    const scholarshipId  = sessionStorage.getItem('scholarship_course_redirect');
    const browseCourses  = sessionStorage.getItem('scholarship_browse_courses');
    const intendedCourse = sessionStorage.getItem('intended_course');
    const ref            = sessionStorage.getItem('pending_referral_code');

    const params = new URLSearchParams();
    if (scholarshipId)  params.set('scholarship_redirect',    scholarshipId);
    if (browseCourses)  params.set('scholarship_browse_courses', 'true');
    if (intendedCourse) params.set('intended_course',          intendedCourse);
    if (ref)            params.set('ref',                      ref);  // ← backend reads this

    const qs          = params.toString();
    const redirectUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/redirect${qs ? `?${qs}` : ''}`;
    window.location.href = redirectUrl;
  };

  return (
    <AuthContext.Provider value={{
      user, loading, error, login, register, logout,
      refreshUser, loginWithGoogle, clearError, setUserFromToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};