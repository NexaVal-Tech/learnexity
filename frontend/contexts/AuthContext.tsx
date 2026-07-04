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
  sendRegistrationOtp: (email: string, referralCode?: string) => Promise<void>;
  resendRegistrationOtp: (email: string) => Promise<void>;
  verifyRegistrationOtp: (email: string, otp: string) => Promise<string>; // returns registration_token
  completeRegistration: (
    email: string,
    registrationToken: string,
    password: string,
    passwordConfirmation: string,
    termsAccepted: boolean
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

  // ── STEP 1: send OTP to email ─────────────────────────────────────────
  const sendRegistrationOtp = async (email: string, referralCode?: string) => {
    try {
      setError(null);
      await api.auth.sendRegistrationOtp({ email, referral_code: referralCode });
    } catch (error) {
      const err = handleApiError(error);
      setError(err);
      throw new Error(err);
    }
  };

  const resendRegistrationOtp = async (email: string) => {
    try {
      setError(null);
      await api.auth.resendRegistrationOtp(email);
    } catch (error) {
      const err = handleApiError(error);
      setError(err);
      throw new Error(err);
    }
  };

  // ── STEP 2: verify OTP -> get short-lived registration_token ──────────
  const verifyRegistrationOtp = async (email: string, otp: string): Promise<string> => {
    try {
      setError(null);
      const res = await api.auth.verifyRegistrationOtp({ email, otp });
      return res.registration_token;
    } catch (error) {
      const err = handleApiError(error);
      setError(err);
      throw new Error(err);
    }
  };

  // ── STEP 3: set password + accept terms -> account created + logged in ─
  const completeRegistration = async (
    email: string,
    registrationToken: string,
    password: string,
    passwordConfirmation: string,
    termsAccepted: boolean
  ) => {
    try {
      setError(null);
      const response = await api.auth.completeRegistration({
        email,
        registration_token: registrationToken,
        password,
        password_confirmation: passwordConfirmation,
        terms_accepted: termsAccepted,
      });
      if (response.token) localStorage.setItem('token', response.token);
      await refreshUser();
      // Land directly on the dashboard with a flag urging profile completion.
      router.push('/user/dashboard?welcome=1');
    } catch (error) {
      const err = handleApiError(error);
      setError(err);
      throw new Error(err);
    }
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

  // Referral code is passed as ?ref= on the redirect URL so the backend
  // redirectToGoogle() method can read it and store it in session.
  const loginWithGoogle = () => {
    const scholarshipId  = sessionStorage.getItem('scholarship_course_redirect');
    const browseCourses  = sessionStorage.getItem('scholarship_browse_courses');
    const intendedCourse = sessionStorage.getItem('intended_course');
    const ref            = sessionStorage.getItem('pending_referral_code');

    const params = new URLSearchParams();
    if (scholarshipId)  params.set('scholarship_redirect',    scholarshipId);
    if (browseCourses)  params.set('scholarship_browse_courses', 'true');
    if (intendedCourse) params.set('intended_course',          intendedCourse);
    if (ref)            params.set('ref',                      ref);

    const qs          = params.toString();
    const redirectUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/redirect${qs ? `?${qs}` : ''}`;
    window.location.href = redirectUrl;
  };

  return (
    <AuthContext.Provider value={{
      user, loading, error, login,
      sendRegistrationOtp, resendRegistrationOtp, verifyRegistrationOtp, completeRegistration,
      logout, refreshUser, loginWithGoogle, clearError, setUserFromToken,
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