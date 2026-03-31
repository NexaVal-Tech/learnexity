'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { api, handleApiError } from '@/lib/api';
import { useRouter } from 'next/router';

const BRAND = "#4A3AFF";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email) { setError('Please enter your email address.'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError('Please enter a valid email address.'); return; }
    setLoading(true);
    try {
      await api.auth.sendResetLink(email);
      setSuccess('Password reset link sent! Please check your inbox.');
      setEmail('');
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .auth-card {
          animation: fadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(12, 12, 14, 0.92);
          backdrop-filter: blur(20px);
          box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04);
        }
        .underline-input {
          background: transparent;
          border: none;
          border-bottom: 1.5px solid rgba(255,255,255,0.18);
          border-radius: 0;
          width: 100%;
          padding: 0.5rem 0 0.5rem 0;
          color: white;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.25s ease;
          caret-color: ${BRAND};
        }
        .underline-input::placeholder {
          color: rgba(255,255,255,0.25);
          font-size: 0.875rem;
          letter-spacing: 0.01em;
        }
        .underline-input:focus { border-bottom-color: ${BRAND}; }
        .underline-input:disabled { opacity: 0.4; cursor: not-allowed; }
        .field-label {
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 0.35rem;
          display: block;
        }
        .auth-btn {
          width: 100%;
          background-color: ${BRAND};
          color: white;
          font-weight: 600;
          padding: 0.8rem 1rem;
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          transition: all 0.3s ease;
          letter-spacing: 0.02em;
          font-size: 0.9rem;
        }
        .auth-btn:hover:not(:disabled) {
          background-color: #3628e0;
          box-shadow: 0 0 28px ${BRAND}55;
          transform: translateY(-1px);
        }
        .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.45);
          transition: color 0.2s;
          margin-bottom: 1.25rem;
        }
        .back-btn:hover { color: rgba(255,255,255,0.8); }
        .alert-box {
          padding: 0.85rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
        }
        .alert-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          color: #fca5a5;
        }
        .alert-success {
          background: rgba(34,197,94,0.08);
          border: 1px solid rgba(34,197,94,0.2);
          color: #86efac;
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-12">
        <div className="w-full max-w-md">
          <button className="back-btn" onClick={() => router.push('/user/auth/login')}>
            <ArrowLeft size={16} />
            Back to login
          </button>

          <div className="auth-card p-10">
            <div className="mb-8">
              <p className="text-xs tracking-widest uppercase text-gray-500 mb-2">Account recovery</p>
              <h1 className="text-3xl font-bold text-white">Forgot Password?</h1>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Enter your email and we'll send you a link to reset your password.
              </p>
            </div>

            {error && <div className="alert-box alert-error">{error}</div>}
            {success && <div className="alert-box alert-success">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="field-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                  disabled={loading}
                  placeholder="you@example.com"
                  className="underline-input"
                />
              </div>

              <button type="submit" disabled={loading} className="auth-btn">
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}