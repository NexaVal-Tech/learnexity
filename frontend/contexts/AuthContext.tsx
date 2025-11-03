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
    phone?: string
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

  // Clear error helper
  const clearError = () => setError(null);

  // ✅ Login function (with refreshUser)
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await api.auth.login({ email, password });

      // ✅ Store token if available
      if (response.token) {
        localStorage.setItem('token', response.token);
      }

      // ✅ Immediately refresh user data to update context
      await refreshUser();

      // Check if there's an intended course to redirect to
      const intendedCourse = sessionStorage.getItem('intended_course');
      const intendedCourseName = sessionStorage.getItem('intended_course_name');

      if (intendedCourse && intendedCourseName) {
        sessionStorage.removeItem('intended_course');
        sessionStorage.removeItem('intended_course_name');
        router.push(`/courses/${intendedCourse}`);
        return;
      }

      // Default redirect based on user role
      if (response.user?.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
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

  // ✅ Register function (same improvement)
  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
    phone?: string
  ) => {
    try {
      setError(null);
      const response = await api.auth.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        phone,
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

      if (response.user?.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Logout function
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

  // ✅ Refresh user data (used by login, register, callback)
  const refreshUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
    } catch (error) {
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  // Google login
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

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
