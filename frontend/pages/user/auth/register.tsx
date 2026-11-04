'use client';

// Sign up — Google first, email as the alternative.
//
// Email route: enter email → we email a "Verify email" button (valid 24
// hours) → clicking it opens /user/auth/verify-email where the person
// creates their password. If they stop halfway, the same link keeps
// working for 24 hours, and entering the email here again simply sends a
// fresh link.

import Head from "next/head";
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowLeft, Mail } from 'lucide-react';
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { authCss } from '@/components/auth/authCss';
import GoogleIcon from '@/components/auth/GoogleIcon';

type Step = 'start' | 'email' | 'sent';

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('start');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [leaving, setLeaving] = useState(false);

  const [email, setEmail] = useState('');
  const [resumed, setResumed] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralValidated, setReferralValidated] = useState(false);
  const [validatingReferral, setValidatingReferral] = useState(false);

  const router = useRouter();
  const { sendRegistrationLink, loginWithGoogle } = useAuth();

  useEffect(() => {
    const { ref, email: qEmail } = router.query;
    if (ref && typeof ref === 'string') {
      setReferralCode(ref);
      sessionStorage.setItem('pending_referral_code', ref);
      validateReferralCode(ref);
    }
    // Coming back from an expired link: jump straight to the email step.
    if (qEmail && typeof qEmail === 'string') {
      setEmail(qEmail);
      setStep('email');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleGoogleSignup = () => {
    if (referralCode && referralValidated) sessionStorage.setItem('pending_referral_code', referralCode);
    loginWithGoogle();
  };

  const sendLink = async () => {
    setError('');
    const clean = email.trim().toLowerCase();
    if (!clean) return setError('Please enter your email address');
    if (!/^\S+@\S+\.\S+$/.test(clean)) return setError('Please enter a valid email address');

    setLoading(true);
    try {
      // The link may be opened in a new tab, which has its own
      // sessionStorage — keep the course they picked in localStorage.
      const intended = sessionStorage.getItem('intended_course');
      if (intended) {
        localStorage.setItem('pending_intended_course', intended);
        const nm = sessionStorage.getItem('intended_course_name');
        if (nm) localStorage.setItem('pending_intended_course_name', nm);
      }
      const res = await sendRegistrationLink(clean, referralValidated && referralCode ? referralCode : undefined);
      setEmail(clean);
      setResumed(!!res.resumed);
      setStep('sent');
      setResendCooldown(45);
    } catch (err: any) {
      setError(err.message || 'Could not send the verification email.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendLink();
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    await sendLink();
    setSuccess('A new link is on its way.');
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
        <style>{authCss}</style>

        {(error || success) && (
          <div className="toast-wrap">
            <div className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl ${error ? 'bg-red-600' : 'bg-[#4A3AFF]'} text-white`}>
              {error ? <XCircle size={20} /> : <CheckCircle size={20} />}
              <span className="text-sm font-medium">{error || success}</span>
            </div>
          </div>
        )}

        <div className="min-h-screen flex items-center justify-center px-4 py-8 lg:pt-32 pt-20">
          <div className={`auth-card w-full max-w-md p-6 lg:p-10 ${leaving ? 'leaving' : ''}`}>

            <div className="mb-7 text-center">
              <p className="text-xs tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-2">Create account</p>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">Sign Up</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Already have an account?{' '}
                <a href="/user/auth/login" onClick={handleGoToLogin} className="page-switch-link">Log in</a>
              </p>
            </div>

            {validatingReferral && (
              <div className="mb-5 p-3 rounded-lg text-xs text-[#4A3AFF]" style={{ background: 'rgba(74,58,255,0.08)', border: '1px solid rgba(74,58,255,0.2)' }}>
                Validating referral code…
              </div>
            )}
            {referralCode && referralValidated && !validatingReferral && (
              <div className="mb-5 p-3 rounded-lg text-xs text-[#4A3AFF]" style={{ background: 'rgba(74,58,255,0.08)', border: '1px solid rgba(74,58,255,0.2)' }}>
                ✓ Referral code <strong>{referralCode}</strong> applied!
              </div>
            )}

            {/* STEP 1 — Google first, email as the alternative */}
            {step === 'start' && (
              <>
                <button type="button" onClick={handleGoogleSignup} disabled={loading} className="google-btn">
                  <GoogleIcon />
                  Continue with Google
                </button>

                <div className="divider-line"><span>OR</span></div>

                <button type="button" onClick={() => setStep('email')} disabled={loading} className="auth-btn-ghost" style={{ marginTop: 0 }}>
                  <span className="inline-flex items-center justify-center gap-2"><Mail size={16} /> Continue with email</span>
                </button>
              </>
            )}

            {/* STEP 2 — email address */}
            {step === 'email' && (
              <>
                <button type="button" className="back-link" onClick={() => setStep('start')}>
                  <ArrowLeft size={14} /> Other sign-up options
                </button>
                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="field-label">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="johndoe@gmail.com" required disabled={loading} className="underline-input" autoFocus />
                  </div>
                  <button type="submit" disabled={loading} className="auth-btn">
                    {loading ? 'Sending link…' : 'Send verification link'}
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center -mt-2">
                    We&apos;ll email you a link to verify your email and create your password.
                  </p>
                </form>
              </>
            )}

            {/* STEP 3 — check your inbox */}
            {step === 'sent' && (
              <div className="text-center">
                <div className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,58,255,0.12)', color: '#4A3AFF' }}>
                  <Mail size={26} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Check your email</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {resumed ? 'Welcome back! ' : ''}We sent a <strong>Verify email</strong> link to<br />
                  <strong className="text-gray-900 dark:text-white">{email}</strong>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
                  Click it to verify your email and create your password. The link works for 24 hours — if you
                  don&apos;t finish now, just open it again later. Can&apos;t find it? Check your spam folder.
                </p>
                <button type="button" onClick={handleResend} disabled={resendCooldown > 0 || loading} className="auth-btn">
                  {resendCooldown > 0 ? `Resend link in ${resendCooldown}s` : loading ? 'Sending…' : 'Resend link'}
                </button>
                <button type="button" onClick={() => setStep('email')} disabled={loading} className="auth-btn-ghost">
                  Use a different email
                </button>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
}
