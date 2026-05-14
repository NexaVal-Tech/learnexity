// pages/instructors/auth/login.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useInstructorAuth } from '@/contexts/InstructorAuthContext';
import { handleInstructorApiError } from '@/lib/instructorApi';
import { Eye, EyeOff, Loader2, GraduationCap } from 'lucide-react';

export default function InstructorLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading } = useInstructorAuth();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/instructors/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push('/instructors/dashboard');
    } catch (err) {
      setError(handleInstructorApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Instructor Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Learnexity</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Sign in to your account</h2>
          <p className="text-sm text-gray-500 mb-6">Enter the credentials sent to your email.</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Signing in…</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Are you a student?{' '}
            <Link href="/user/auth/login" className="text-indigo-600 hover:underline">
              Student login →
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Credentials are sent by the Learnexity admin team.
          <br />
          Contact your admin if you need help logging in.
        </p>
      </div>
    </div>
  );
}