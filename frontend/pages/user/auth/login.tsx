'use client';

import Head from "next/head";
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import AppLayout from "@/components/layouts/AppLayout";
import { handleApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Toast from "@/components/ui/toast";
import Link from 'next/link';

const BRAND = "#4A3AFF";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [leaving, setLeaving] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
    }
    const { message, email, verified } = router.query;
    if (verified === 'success') {
      setSuccessMessage('Email verified successfully! You can now log in.');
    }
    if (message === 'verify_email' && email) {
      setSuccessMessage(`Registration successful! Please check your email (${email}) to verify your account.`);
      setFormData(prev => ({ ...prev, email: email as string }));
    }
  }, [router.query]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      if (formData.rememberMe) {
        localStorage.setItem('remembered_email', formData.email);
      } else {
        localStorage.removeItem('remembered_email');
      }
    } catch (err: any) {
      setError(err.message || handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoToRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    setLeaving(true);
    setTimeout(() => router.push('/user/auth/register'), 480);
  };

  return (
        <>
          <Head>
            <title>Login - to access your course materials</title>
    
            <meta
              name="description"
              content="log in to access your course resources."
            />
            <link rel="canonical" href="https://learnexity.org/login" />
          </Head>
    <AppLayout>
      <style>{`
        @keyframes pageEnter {
          from { opacity: 0; transform: perspective(1200px) rotateY(-12deg) translateX(-60px); }
          to   { opacity: 1; transform: perspective(1200px) rotateY(0deg) translateX(0); }
        }
        @keyframes pageLeave {
          from { opacity: 1; transform: perspective(1200px) rotateY(0deg) translateX(0); }
          to   { opacity: 0; transform: perspective(1200px) rotateY(12deg) translateX(60px); }
        }
        .auth-card {
          animation: pageEnter 0.48s cubic-bezier(0.22, 1, 0.36, 1) both;
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(12, 12, 14, 0.92);
          backdrop-filter: blur(20px);
          box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04);
          transform-origin: left center;
        }
        .auth-card.leaving {
          animation: pageLeave 0.48s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .underline-input {
          background: transparent;
          border: none;
          border-bottom: 3px solid rgba(255, 255, 255, 0.51);
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
        .underline-input:focus {
          border-bottom-color: ${BRAND};
        }
        .underline-input:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .field-label {
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.72);
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
        .auth-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          color: rgba(255,255,255,0.75);
          font-weight: 500;
          font-size: 0.875rem;
          background: rgba(255,255,255,0.04);
          transition: all 0.25s ease;
        }
        .google-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
        }
        .google-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .divider-line {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
        }
        .divider-line::before,
        .divider-line::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .divider-line span {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.05em;
        }
        .page-switch-link {
          color: ${BRAND};
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .page-switch-link:hover { opacity: 0.75; }
        .checkbox-custom {
          width: 1rem;
          height: 1rem;
          accent-color: ${BRAND};
        }
        input[type="checkbox"]:focus {
          outline: 2px solid ${BRAND}66;
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center px-4 pt-16 lg:pt-32 pb-12">
        <div className={`auth-card w-full max-w-md p-5 ${leaving ? 'leaving' : ''}`}>

          {/* Header */}
          <div className="mb-8 text-center">
            <p className="text-xs tracking-widest uppercase text-gray-500 mb-2">Welcome back</p>
            <h1 className="text-3xl font-bold text-white leading-tight">Log In</h1>
            <p className="text-sm text-gray-500 mt-2">
              Don&apos;t have an account?{' '}
              <a href="/user/auth/register" onClick={handleGoToRegister} className="page-switch-link">
                Sign up
              </a>
            </p>
          </div>

          {/* Toasts */}
          {successMessage && (
            <Toast message={successMessage} type="success" duration={8000} onClose={() => setSuccessMessage('')} />
          )}
          {error && (
            <Toast message={error} type="error" duration={4000} onClose={() => setError('')} />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                disabled={loading}
                className="underline-input"
              />
            </div>

            {/* Password */}
            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="underline-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-40"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={loading}
                  className="checkbox-custom"
                />
                <span className="text-sm text-gray-500">Remember me</span>
              </label>
              <a href="/user/auth/forgot-password" className="text-sm font-medium" style={{ color: BRAND }}>
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? 'Logging in…' : 'Log In'}
            </button>

            {/* Divider */}
            <div className="divider-line"><span>OR</span></div>

            {/* Google */}
            <button type="button" onClick={() => loginWithGoogle()} disabled={loading} className="google-btn">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M19.8 10.2273C19.8 9.51819 19.7364 8.83637 19.6182 8.18182H10.2V12.05H15.6109C15.3727 13.3 14.6636 14.3591 13.6045 15.0682V17.5773H16.8273C18.7091 15.8364 19.8 13.2727 19.8 10.2273Z" fill="#4285F4" />
                <path d="M10.2 20C12.9 20 15.1727 19.1045 16.8273 17.5773L13.6045 15.0682C12.7091 15.6682 11.5636 16.0227 10.2 16.0227C7.59545 16.0227 5.38182 14.2636 4.58636 11.9H1.25455V14.4909C2.90909 17.7591 6.29091 20 10.2 20Z" fill="#34A853" />
                <path d="M4.58636 11.9C4.38636 11.3 4.27273 10.6591 4.27273 10C4.27273 9.34091 4.38636 8.7 4.58636 8.1V5.50909H1.25455C0.572727 6.85909 0.2 8.38636 0.2 10C0.2 11.6136 0.572727 13.1409 1.25455 14.4909L4.58636 11.9Z" fill="#FBBC04" />
                <path d="M10.2 3.97727C11.6864 3.97727 13.0182 4.48182 14.0636 5.47273L16.9227 2.61364C15.1682 0.986364 12.8955 0 10.2 0C6.29091 0 2.90909 2.24091 1.25455 5.50909L4.58636 8.1C5.38182 5.73636 7.59545 3.97727 10.2 3.97727Z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
    </>
  );
}