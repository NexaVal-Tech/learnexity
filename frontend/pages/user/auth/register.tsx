'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import AppLayout from "@/components/layouts/AppLayout";
import { handleApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

const BRAND = "#4A3AFF";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  rememberMe: boolean;
  referralCode?: string;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralValidated, setReferralValidated] = useState(false);
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    referralCode: undefined,
  });

  const router = useRouter();
  const { register: registerUser, loginWithGoogle } = useAuth();

  useEffect(() => {
    const { ref } = router.query;
    if (ref && typeof ref === 'string') {
      setReferralCode(ref);
      setFormData(prev => ({ ...prev, referralCode: ref }));
      sessionStorage.setItem('pending_referral_code', ref);
      validateReferralCode(ref);
    }
  }, [router.query]);

  const validateReferralCode = async (code: string) => {
    setValidatingReferral(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/referrals/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (response.ok && data.valid) {
        setReferralValidated(true);
      } else {
        setError('Invalid referral code. You can still register without it.');
        setReferralCode(null);
        setReferralValidated(false);
        sessionStorage.removeItem('pending_referral_code');
      }
    } catch {
      setError('Could not validate referral code. You can still register.');
    } finally {
      setValidatingReferral(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }
    try {
      await registerUser(
        formData.fullName,
        formData.email,
        formData.password,
        formData.confirmPassword,
        formData.phone,
        formData.referralCode
      );
      sessionStorage.removeItem('pending_referral_code');
    } catch (err: any) {
      if (err.message.includes('email is already registered')) {
        setError('This email is already registered. Please login instead.');
      } else if (err.message.includes('Validation failed')) {
        setError('Please check your input and try again.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    if (referralCode && referralValidated) {
      sessionStorage.setItem('pending_referral_code', referralCode);
    }
    loginWithGoogle();
  };

  const handleGoToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setLeaving(true);
    setTimeout(() => router.push('/user/auth/login'), 480);
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => { setError(''); setSuccess(''); }, 6000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <AppLayout>
      <style>{`
        @keyframes pageEnterReverse {
          from { opacity: 0; transform: perspective(1200px) rotateY(12deg) translateX(60px); }
          to   { opacity: 1; transform: perspective(1200px) rotateY(0deg) translateX(0); }
        }
        @keyframes pageLeaveReverse {
          from { opacity: 1; transform: perspective(1200px) rotateY(0deg) translateX(0); }
          to   { opacity: 0; transform: perspective(1200px) rotateY(-12deg) translateX(-60px); }
        }
        .auth-card {
          animation: pageEnterReverse 0.48s cubic-bezier(0.22, 1, 0.36, 1) both;
          border-radius: 2rem 0.75rem 2rem 0.75rem;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(12, 12, 14, 0.92);
          backdrop-filter: blur(20px);
          box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04);
          transform-origin: right center;
        }
        .auth-card.leaving {
          animation: pageLeaveReverse 0.48s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .underline-input {
          background: transparent;
          border: none;
          border-bottom: 3px solid rgba(255, 255, 255, 0.65);
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
          margin-top: 20px;
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
        .field-label {
          color: hsl(0, 0%, 100%);
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
          margin: 1rem 0;
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
        .checkbox-custom { width: 1rem; height: 1rem; accent-color: ${BRAND}; }
        .toast-wrap {
          position: fixed;
          top: 5.5rem;
          right: 1rem;
          z-index: 60;
          max-width: 22rem;
          width: 90%;
          animation: slideIn 0.3s ease both;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* Vertical divider — visible only on lg+ */
        .col-divider {
          display: none;
        }
        @media (min-width: 1024px) {
          .col-divider {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .col-divider-line {
            width: 1px;
            flex: 1;
            background: rgba(255,255,255,0.08);
          }
        }

        /* On mobile, stack right-col fields after left-col naturally */
        .two-col-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        @media (min-width: 1024px) {
          .two-col-form {
            display: grid;
            grid-template-columns: 1fr 40px 1fr;
            gap: 0;
            align-items: start;
          }
          .left-col, .right-col {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }
        }
      `}</style>

      {/* Toast */}
      {(error || success) && (
        <div className="toast-wrap">
          <div className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl ${error ? 'bg-red-600' : 'bg-green-600'} text-white`}>
            {error ? <XCircle size={20} /> : <CheckCircle size={20} />}
            <span className="text-sm font-medium">{error || success}</span>
          </div>
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center px-4 py-8 lg:pt-32 pt-20">
        <div className={`auth-card w-full max-w-md lg:max-w-3xl xl:max-w-4xl p-4 lg:p-12 ${leaving ? 'leaving' : ''}`}>

          {/* Header — full width always */}
          <div className="mb-7 text-center">
            <p className="text-xs tracking-widest uppercase text-gray-500 mb-2">Create account</p>
            <h1 className="text-3xl font-bold text-white leading-tight">Sign Up</h1>
            <p className="text-sm text-gray-500 mt-2">
              Already have an account?{' '}
              <a href="/user/auth/login" onClick={handleGoToLogin} className="page-switch-link">
                Log in
              </a>
            </p>
          </div>

          {/* Referral banners */}
          {validatingReferral && (
            <div className="mb-5 p-3 rounded-lg text-xs text-blue-300" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
              ⏳ Validating referral code…
            </div>
          )}
          {referralCode && referralValidated && !validatingReferral && (
            <div className="mb-5 p-3 rounded-lg text-xs text-green-300" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              ✓ Referral code <strong>{referralCode}</strong> applied!
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="two-col-form">

              {/* ── Left column: personal info ── */}
              <div className="left-col">
                <div>
                  <label className="field-label">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                    placeholder="John Doe" required disabled={loading || !!success} className="underline-input" />
                </div>

                <div>
                  <label className="field-label">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="johndoe@gmail.com" required disabled={loading || !!success} className="underline-input" />
                </div>

                <div>
                  <label className="field-label">Phone Number (with country code)</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    placeholder="+234 801 234 5678" disabled={loading || !!success} className="underline-input" />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange}
                    disabled={loading || !!success} className="checkbox-custom" />
                  <span className="text-sm text-gray-500">Remember me</span>
                </label>
              </div>

              {/* ── Vertical divider (lg only) ── */}
              <div className="col-divider px-4">
                <div className="col-divider-line"></div>
              </div>

              {/* ── Right column: security + submit ── */}
              <div className="right-col">
                <div>
                  <label className="field-label">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                      onChange={handleChange} placeholder="Min. 8 characters" required
                      disabled={loading || !!success} className="underline-input pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      disabled={loading || !!success}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-40">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="field-label">Confirm Password</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
                      value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat password"
                      required disabled={loading || !!success} className="underline-input pr-10" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading || !!success}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-40">
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading || !!success} className="auth-btn">
                  {loading ? 'Creating account…' : 'Sign Up'}
                </button>

                <div className="divider-line"><span>OR</span></div>

                <button type="button" onClick={handleGoogleSignup} disabled={loading || !!success} className="google-btn">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M19.8 10.2273C19.8 9.51819 19.7364 8.83637 19.6182 8.18182H10.2V12.05H15.6109C15.3727 13.3 14.6636 14.3591 13.6045 15.0682V17.5773H16.8273C18.7091 15.8364 19.8 13.2727 19.8 10.2273Z" fill="#4285F4" />
                    <path d="M10.2 20C12.9 20 15.1727 19.1045 16.8273 17.5773L13.6045 15.0682C12.7091 15.6682 11.5636 16.0227 10.2 16.0227C7.59545 16.0227 5.38182 14.2636 4.58636 11.9H1.25455V14.4909C2.90909 17.7591 6.29091 20 10.2 20Z" fill="#34A853" />
                    <path d="M4.58636 11.9C4.38636 11.3 4.27273 10.6591 4.27273 10C4.27273 9.34091 4.38636 8.7 4.58636 8.1V5.50909H1.25455C0.572727 6.85909 0.2 8.38636 0.2 10C0.2 11.6136 0.572727 13.1409 1.25455 14.4909L4.58636 11.9Z" fill="#FBBC04" />
                    <path d="M10.2 3.97727C11.6864 3.97727 13.0182 4.48182 14.0636 5.47273L16.9227 2.61364C15.1682 0.986364 12.8955 0 10.2 0C6.29091 0 2.90909 2.24091 1.25455 5.50909L4.58636 8.1C5.38182 5.73636 7.59545 3.97727 10.2 3.97727Z" fill="#EA4335" />
                  </svg>
                  Sign up with Google
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}