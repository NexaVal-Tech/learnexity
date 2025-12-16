'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminApi, Admin, handleAdminApiError } from '@/lib/adminApi';
import { useRouter } from 'next/router';

interface AdminAuthContextType {
  admin: Admin | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
  clearError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check admin authentication on mount
  useEffect(() => {
    const checkAdminAuth = async () => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setAdmin(null);
        setLoading(false);
        return;
      }

      try {
        const adminData = await adminApi.auth.me();
        setAdmin(adminData);
      } catch (error) {
        console.error('Admin auth check failed:', error);
        setAdmin(null);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  const clearError = () => setError(null);

const login = async (email: string, password: string) => {
  try {
    setError(null);

    const response = await adminApi.auth.login({ email, password });

    if (response.success && response.data) {
      localStorage.setItem('admin_token', response.data.token);
      setAdmin(response.data.admin);

      const intended =
        sessionStorage.getItem('admin_intended_route') || '/admin/dashboard';

      sessionStorage.removeItem('admin_intended_route');

      router.replace(intended);
    } else {
      throw new Error(response.message || 'Login failed');
    }
  } catch (error) {
    const err = handleAdminApiError(error);
    setError(err);
    throw new Error(err);
  }
};


  const logout = async () => {
    try {
      await adminApi.auth.logout();
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      setAdmin(null);
      setError(null);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      router.push('/admin/auth/login');
    }
  };

  const refreshAdmin = async () => {
    try {
      const adminData = await adminApi.auth.me();
      setAdmin(adminData);
    } catch (error) {
      console.error('Failed to refresh admin:', error);
      setAdmin(null);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        error,
        login,
        logout,
        refreshAdmin,
        clearError,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return ctx;
};