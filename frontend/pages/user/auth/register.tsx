'use client';

import Head from "next/head";
import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, Check, ArrowLeft } from 'lucide-react';
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

const BRAND = "#4A3AFF";
type Step = 'email' | 'otp' | 'password';

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [leaving, setLeaving] = useState(false);

  // Step 1
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralValidated, setReferralValidated] = useState(false);
  const [validatingReferral, setValidatingReferral] = useState(false);

  // Step 2 (OTP)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [registrationToken, setRegistrationToken] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 3 (password)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showTerms, setShowTerms] = useState(false);

  const router = useRouter();
  const {
    sendRegistrationOtp, resendRegistrationOtp, verifyRegistrationOtp,
    completeRegistration, loginWithGoogle,
  } = useAuth();

  useEffect(() => {
    const { ref } = router.query;
    if (ref && typeof ref === 'string') {
      setReferralCode(ref);
      sessionStorage.setItem('pending_referral_code', ref);
      validateReferralCode(ref);
    }
  }, [router.query]);

  useEffect(() => {
    if (!resendCooldown) return;
    const t = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => { setError(''); setSuccess(''); }, 6000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

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
        setReferralCode(null);
        setReferralValidated(false);
        sessionStorage.removeItem('pending_referral_code');
      }
    } catch {
      // referral is optional — fail silently
    } finally {
      setValidatingReferral(false);
    }
  };

  // ── Step 1: send OTP to email ─────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await sendRegistrationOtp(email, referralCode || undefined);
      setSuccess(`Code sent to ${email}`);
      setStep('otp');
      setResendCooldown(45);
    } catch (err: any) {
      setError(err.message || 'Could not send verification code.');
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

  // ── Step 2: verify OTP ────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value.slice(-1);
    setOtpDigits(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (next.every((d) => d) && next.join('').length === 6) {
      submitOtp(next.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.split('');
    while (next.length < 6) next.push('');
    setOtpDigits(next);
    if (pasted.length === 6) submitOtp(pasted);
    else otpRefs.current[pasted.length]?.focus();
  };

  const submitOtp = async (code: string) => {
    setError('');
    setLoading(true);
    try {
      const token = await verifyRegistrationOtp(email, code);
      setRegistrationToken(token);
      setSuccess('Email verified!');
      setStep('password');
    } catch (err: any) {
      setError(err.message || 'Invalid code.');
      setOtpDigits(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      await resendRegistrationOtp(email);
      setSuccess('New code sent.');
      setResendCooldown(45);
    } catch (err: any) {
      setError(err.message || 'Could not resend code.');
    }
  };

  const handleChangeEmail = () => {
    setStep('email');
    setOtpDigits(['', '', '', '', '', '']);
    setError('');
  };

  // ── Step 3: password → terms modal → complete ────────────────────
  const passwordRules = {
    length: password.length >= 8,
    letter: /[A-Za-z]/.test(password),
    number: /[0-9]/.test(password),
    match: password.length > 0 && password === confirmPassword,
  };
  const passwordValid = passwordRules.length && passwordRules.letter && passwordRules.number && passwordRules.match;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!passwordValid) {
      setError('Please meet all password requirements.');
      return;
    }
    setShowTerms(true);
  };

  const handleConfirmTerms = async () => {
    setLoading(true);
    setError('');
    try {
      await completeRegistration(email, registrationToken, password, confirmPassword, true);
      sessionStorage.removeItem('pending_referral_code');
      // completeRegistration redirects to /user/dashboard?welcome=1
    } catch (err: any) {
      setShowTerms(false);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setLeaving(true);
    setTimeout(() => router.push('/user/auth/login'), 480);
  };

  return (
    <>
      <Head>
        <title>Register - to start your learning journey Immediately</title>
        <meta name="description" content="register now to start your learning journey Immediately." />
        <link rel="canonical" href="https://learnexity.org/register" />
      </Head>
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
          .auth-card.leaving { animation: pageLeaveReverse 0.48s cubic-bezier(0.22, 1, 0.36, 1) both; }
          .underline-input {
            background: transparent; border: none; border-bottom: 3px solid rgba(255,255,255,0.65);
            border-radius: 0; width: 100%; padding: 0.5rem 0; color: white; font-size: 0.95rem;
            outline: none; transition: border-color 0.25s ease; caret-color: ${BRAND};
          }
          .underline-input::placeholder { color: rgba(255,255,255,0.25); font-size: 0.875rem; }
          .underline-input:focus { border-bottom-color: ${BRAND}; }
          .underline-input:disabled { opacity: 0.4; cursor: not-allowed; }
          .field-label {
            font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase;
            color: rgba(255,255,255,0.4); margin-bottom: 0.35rem; display: block;
          }
          .auth-btn {
            width: 100%; margin-top: 20px; background-color: ${BRAND}; color: white; font-weight: 600;
            padding: 0.8rem 1rem; border-radius: 2rem 0.75rem 2rem 0.75rem; transition: all 0.3s ease;
            letter-spacing: 0.02em; font-size: 0.9rem;
          }
          .auth-btn:hover:not(:disabled) {
            background-color: #3628e0; box-shadow: 0 0 28px ${BRAND}55; transform: translateY(-1px);
          }
          .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
          .auth-btn-ghost {
            width: 100%; margin-top: 12px; background: transparent; color: rgba(255,255,255,0.6);
            font-weight: 500; padding: 0.6rem 1rem; border-radius: 2rem 0.75rem 2rem 0.75rem;
            border: 1px solid rgba(255,255,255,0.1); font-size: 0.85rem; transition: all 0.25s ease;
          }
          .auth-btn-ghost:hover:not(:disabled) { background: rgba(255,255,255,0.05); }
          .auth-btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }
          .google-btn {
            width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.75rem;
            padding: 0.75rem 1rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 2rem 0.75rem 2rem 0.75rem;
            color: rgba(255,255,255,0.75); font-weight: 500; font-size: 0.875rem; background: rgba(255,255,255,0.04);
            transition: all 0.25s ease;
          }
          .google-btn:hover:not(:disabled) { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }
          .google-btn:disabled { opacity: 0.4; cursor: not-allowed; }
          .divider-line { display: flex; align-items: center; gap: 1rem; margin: 1.25rem 0; }
          .divider-line::before, .divider-line::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
          .divider-line span { font-size: 0.75rem; color: rgba(255,255,255,0.3); letter-spacing: 0.05em; }
          .page-switch-link { color: ${BRAND}; font-weight: 600; text-decoration: none; transition: opacity 0.2s; }
          .page-switch-link:hover { opacity: 0.75; }
          .toast-wrap {
            position: fixed; top: 5.5rem; right: 1rem; z-index: 60; max-width: 22rem; width: 90%;
            animation: slideIn 0.3s ease both;
          }
          @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
          .otp-row { display: flex; gap: 0.6rem; justify-content: center; margin: 1.5rem 0 0.5rem; }
          .otp-box {
            width: 3rem; height: 3.25rem; text-align: center; font-size: 1.4rem; font-weight: 600;
            background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12);
            border-radius: 0.75rem; color: white; outline: none; transition: border-color 0.2s ease;
          }
          .otp-box:focus { border-color: ${BRAND}; box-shadow: 0 0 0 3px ${BRAND}33; }
          .rule-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: rgba(255,255,255,0.4); }
          .rule-item.met { color: #4ade80; }
          .back-link {
            display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.8rem;
            color: rgba(255,255,255,0.45); background: none; border: none; cursor: pointer; margin-bottom: 1rem;
          }
          .back-link:hover { color: rgba(255,255,255,0.75); }
          .modal-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 70;
            display: flex; align-items: center; justify-content: center; padding: 1rem;
            animation: fadeIn 0.2s ease both;
          }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .modal-box {
            background: #111113; border: 1px solid rgba(255,255,255,0.1); border-radius: 1.5rem;
            padding: 2rem; max-width: 26rem; width: 100%; box-shadow: 0 32px 80px rgba(0,0,0,0.8);
          }
        `}</style>

        {(error || success) && (
          <div className="toast-wrap">
            <div className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl ${error ? 'bg-red-600' : 'bg-green-600'} text-white`}>
              {error ? <XCircle size={20} /> : <CheckCircle size={20} />}
              <span className="text-sm font-medium">{error || success}</span>
            </div>
          </div>
        )}

        <div className="min-h-screen flex items-center justify-center px-4 py-8 lg:pt-32 pt-20">
          <div className={`auth-card w-full max-w-md p-6 lg:p-10 ${leaving ? 'leaving' : ''}`}>

            <div className="mb-7 text-center">
              <p className="text-xs tracking-widest uppercase text-gray-500 mb-2">Create account</p>
              <h1 className="text-3xl font-bold text-white leading-tight">Sign Up</h1>
              <p className="text-sm text-gray-500 mt-2">
                Already have an account?{' '}
                <a href="/user/auth/login" onClick={handleGoToLogin} className="page-switch-link">Log in</a>
              </p>
            </div>

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

            {/* STEP 1 — email only */}
            {step === 'email' && (
              <>
                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="field-label">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="johndoe@gmail.com" required disabled={loading} className="underline-input" />
                  </div>
                  <button type="submit" disabled={loading} className="auth-btn">
                    {loading ? 'Sending code…' : 'Continue'}
                  </button>
                </form>

                <div className="divider-line"><span>OR</span></div>

                <button type="button" onClick={handleGoogleSignup} disabled={loading} className="google-btn">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M19.8 10.2273C19.8 9.51819 19.7364 8.83637 19.6182 8.18182H10.2V12.05H15.6109C15.3727 13.3 14.6636 14.3591 13.6045 15.0682V17.5773H16.8273C18.7091 15.8364 19.8 13.2727 19.8 10.2273Z" fill="#4285F4" />
                    <path d="M10.2 20C12.9 20 15.1727 19.1045 16.8273 17.5773L13.6045 15.0682C12.7091 15.6682 11.5636 16.0227 10.2 16.0227C7.59545 16.0227 5.38182 14.2636 4.58636 11.9H1.25455V14.4909C2.90909 17.7591 6.29091 20 10.2 20Z" fill="#34A853" />
                    <path d="M4.58636 11.9C4.38636 11.3 4.27273 10.6591 4.27273 10C4.27273 9.34091 4.38636 8.7 4.58636 8.1V5.50909H1.25455C0.572727 6.85909 0.2 8.38636 0.2 10C0.2 11.6136 0.572727 13.1409 1.25455 14.4909L4.58636 11.9Z" fill="#FBBC04" />
                    <path d="M10.2 3.97727C11.6864 3.97727 13.0182 4.48182 14.0636 5.47273L16.9227 2.61364C15.1682 0.986364 12.8955 0 10.2 0C6.29091 0 2.90909 2.24091 1.25455 5.50909L4.58636 8.1C5.38182 5.73636 7.59545 3.97727 10.2 3.97727Z" fill="#EA4335" />
                  </svg>
                  Sign up with Google
                </button>
              </>
            )}

            {/* STEP 2 — OTP */}
            {step === 'otp' && (
              <>
                <button type="button" className="back-link" onClick={handleChangeEmail}>
                  <ArrowLeft size={14} /> Change email
                </button>
                <p className="text-sm text-gray-400 text-center mb-2">
                  Enter the 6-digit code sent to<br /><strong className="text-white">{email}</strong>
                </p>
                <div className="otp-row">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      disabled={loading}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      className="otp-box"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => submitOtp(otpDigits.join(''))}
                  disabled={loading || otpDigits.some((d) => !d)}
                  className="auth-btn"
                >
                  {loading ? 'Verifying…' : 'Verify'}
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="auth-btn-ghost"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                </button>
              </>
            )}

            {/* STEP 3 — password */}
            {step === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="field-label">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required
                      disabled={loading} className="underline-input pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-40">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="field-label">Confirm Password</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" required
                      disabled={loading} className="underline-input pr-10" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-40">
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-1">
                  <div className={`rule-item ${passwordRules.length ? 'met' : ''}`}><Check size={12} /> At least 8 characters</div>
                  <div className={`rule-item ${passwordRules.letter ? 'met' : ''}`}><Check size={12} /> At least 1 letter</div>
                  <div className={`rule-item ${passwordRules.number ? 'met' : ''}`}><Check size={12} /> At least 1 number</div>
                  <div className={`rule-item ${passwordRules.match ? 'met' : ''}`}><Check size={12} /> Passwords match</div>
                </div>

                <button type="submit" disabled={loading || !passwordValid} className="auth-btn">
                  {loading ? 'Please wait…' : 'Continue'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Terms modal */}
        {showTerms && (
          <div className="modal-overlay" onClick={() => !loading && setShowTerms(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-white mb-3">One last step</h3>
              <p className="text-sm text-gray-400 mb-6">
                By signing up, you agree to our{' '}
                <a href="/terms-of-services" target="_blank" rel="noopener noreferrer" className="page-switch-link">Terms & Conditions</a>{' '}
                and{' '}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="page-switch-link">Privacy Policy</a>.
              </p>
              <button onClick={handleConfirmTerms} disabled={loading} className="auth-btn">
                {loading ? 'Creating account…' : 'I Agree — Create Account'}
              </button>
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                disabled={loading}
                className="auth-btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </AppLayout>
    </>
  );
}