// contexts/InstructorAuthContext.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { instructorApi, Instructor } from '@/lib/instructorApi';

interface InstructorAuthContextType {
  instructor: Instructor | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const InstructorAuthContext = createContext<InstructorAuthContextType | undefined>(undefined);

export function InstructorAuthProvider({ children }: { children: ReactNode }) {
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('instructor_user') : null;
    const token  = typeof window !== 'undefined' ? localStorage.getItem('instructor_token') : null;

    if (stored && token) {
      try {
        setInstructor(JSON.parse(stored));
      } catch {}
    }

    // Validate token with server
    if (token) {
      instructorApi.auth.me()
        .then((data) => {
          setInstructor(data);
          localStorage.setItem('instructor_user', JSON.stringify(data));
        })
        .catch(() => {
          localStorage.removeItem('instructor_token');
          localStorage.removeItem('instructor_user');
          setInstructor(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await instructorApi.auth.login({ email, password });
    if (res.data?.instructor) {
      setInstructor(res.data.instructor);
    }
  };

  const logout = async () => {
    await instructorApi.auth.logout();
    setInstructor(null);
  };

  return (
    <InstructorAuthContext.Provider
      value={{ instructor, loading, login, logout, isAuthenticated: !!instructor }}
    >
      {children}
    </InstructorAuthContext.Provider>
  );
}

export function useInstructorAuth() {
  const ctx = useContext(InstructorAuthContext);
  if (!ctx) throw new Error('useInstructorAuth must be used within InstructorAuthProvider');
  return ctx;
}