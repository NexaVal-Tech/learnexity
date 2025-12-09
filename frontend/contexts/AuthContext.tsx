'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User, handleApiError } from '@/lib/api';
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
    referralCode?: string // ✨ Added here
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

  // Fetch user on mount - NO REDIRECT LOGIC HERE
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
      } catch (error) {
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
        router.push(`/courses/${intendedCourse}`);
        return;
      }

      response.user?.role === 'admin'
        ? router.push('/admin/dashboard')
        : router.push('/user/dashboard');
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
      console.error('Failed to set user from token:', error);
      localStorage.removeItem('token');
      throw error;
    }
  };

  // REGISTER (UPDATED WITH referralCode)
  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
    phone?: string,
    referralCode?: string // 📌 Added referral code param
  ) => {
    try {
      setError(null);

      const response = await api.auth.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        phone,
        referral_code: referralCode, // 👈 sent to API
      });

      if (response.token) {
        localStorage.setItem('token', response.token);
      }

      await refreshUser();

      const intendedCourse = sessionStorage.getItem('intended_course');
      const intendedCourseName = sessionStorage.getItem('intended_course_name');

      if (intendedCourse && intendedCourseName) {
        sessionStorage.removeItem('intended_course');
        sessionStorage.removeItem('intended_course_name');
        router.push(`/courses/${intendedCourse}`);
        return;
      }

      response.user?.role === 'admin'
        ? router.push('/admin/dashboard')
        : router.push('/user/dashboard');
    } catch (error) {
      const err = handleApiError(error);
      setError(err);
      throw new Error(err);
    }
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
    } catch (error) {
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  const loginWithGoogle = () => {
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
