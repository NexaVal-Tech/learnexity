'use client';

// Opened from the "Verify email" button in the sign-up email.
// Verifies the link, then lets the person create their password.
// The link works for 24 hours, so someone who leaves halfway can simply
// open it again later and continue here.

import Head from "next/head";
import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, Check, Loader2, MailWarning } from 'lucide-react';
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { authCss } from '@/components/auth/authCss';

type State = 'checking' | 'ready' | 'expired' | 'registered' | 'invalid';
const SAVE_KEY = 'lx_signup_session';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { verifyRegistrationLink, sendRegistrationLink, completeRegistration } = useAuth();

  const [state, setState] = useState<State>('checking');
  const [email, setEmail] = useState('');
  const [registrationToken, setRegistrationToken] = useState('');
  const [message, setMessage] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => { setError(''); setSuccess(''); }, 6000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  useEffect(() => {
    if (!router.isReady || ran.current) return;
    ran.current = true;

    const qEmail = typeof router.query.email === 'string' ? router.query.email.trim().toLowerCase() : '';
    const qToken = typeof router.query.token === 'string' ? router.query.token : '';
    setEmail(qEmail);

    // Refreshing the page after verifying: reuse the saved session.
    try {
      const saved = JSON.parse(sessionStorage.getItem(SAVE_KEY) || 'null');
      if (saved && saved.email === qEmail && saved.token && saved.exp > Date.now()) {
        setRegistrationToken(saved.token);
        setState('ready');
        return;
      }
    } catch { /* ignore */ }

    if (!qEmail || !qToken) {
      setState('invalid');
      setMessage('This link is incomplete. Please open the button in your email again, or start sign-up again.');
      return;
    }

    (async () => {
      try {
        const res = await verifyRegistrationLink(qEmail, qToken);
        setEmail(res.email);
        setRegistrationToken(res.registration_token);
        sessionStorage.setItem(SAVE_KEY, JSON.stringify({ email: res.email, token: res.registration_token, exp: Date.now() + 60 * 60 * 1000 }));
        // Remove the token from the address bar.
        router.replace({ pathname: router.pathname, query: { email: res.email } }, undefined, { shallow: true });
        setState('ready');
      } catch (err: any) {
        const msg = err?.message || '';
        if (/already set up|already registered|log in/i.test(msg)) {
          setState('registered');
        } else if (/expired|not valid|no longer valid/i.test(msg)) {
          setState('expired');
        } else {
          setState('invalid');
        }
        setMessage(msg || 'This link could not be verified.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const resendLink = async () => {
    if (!email) return router.push('/user/auth/register');
    setLoading(true);
    try {
      await sendRegistrationLink(email);
      setSuccess('A new link is on its way — check your email.');
    } catch (err: any) {
      setError(err.message || 'Could not send a new link.');
    } finally {
      setLoading(false);
    }
  };

  const rules = {
    length: password.length >= 8,
    letter: /[A-Za-z]/.test(password),
    number: /[0-9]/.test(password),
    match: password.length > 0 && password === confirmPassword,
  };
  const passwordValid = rules.length && rules.letter && rules.number && rules.match;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!passwordValid) return setError('Please meet all password requirements.');
    setShowTerms(true);
  };

  const handleConfirmTerms = async () => {
    setLoading(true);
    setError('');
    try {
      // Bring back the course they picked before signing up (stored when the link was sent).
      const intended = localStorage.getItem('pending_intended_course');
      if (intended && !sessionStorage.getItem('intended_course')) {
        sessionStorage.setItem('intended_course', intended);
        const nm = localStorage.getItem('pending_intended_course_name');
        if (nm) sessionStorage.setItem('intended_course_name', nm);
      }
      localStorage.removeItem('pending_intended_course');
      localStorage.removeItem('pending_intended_course_name');

      await completeRegistration(email, registrationToken, password, confirmPassword, true);
      sessionStorage.removeItem(SAVE_KEY);
      sessionStorage.removeItem('pending_referral_code');
      // completeRegistration redirects to the dashboard
    } catch (err: any) {
      setShowTerms(false);
      const msg = err.message || 'Registration failed. Please try again.';
      if (/expired|verify your email again/i.test(msg)) {
        sessionStorage.removeItem(SAVE_KEY);
        setState('expired');
        setMessage('Your session timed out. Open the link in your email again (it works for 24 hours), or get a new one below.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create your password — Learnexity</title>
        <meta name="robots" content="noindex" />
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
          <div className="auth-card w-full max-w-md p-6 lg:p-10">
            {state === 'checking' && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Loader2 className="animate-spin text-[#4A3AFF]" size={28} />
                <p className="text-sm text-gray-500 dark:text-gray-400">Verifying your email…</p>
              </div>
            )}

            {state === 'ready' && (
              <>
                <div className="mb-7 text-center">
                  <div className="mx-auto mb-3 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,58,255,0.12)', color: '#4A3AFF' }}>
                    <Check size={22} />
                  </div>
                  <p className="text-xs tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-2">Email verified</p>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">Create your password</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 break-all">{email}</p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="field-label">Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={password} autoComplete="new-password"
                        onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required
                        disabled={loading} className="underline-input pr-10" autoFocus />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-40"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="field-label">Confirm Password</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} autoComplete="new-password"
                        onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" required
                        disabled={loading} className="underline-input pr-10" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-40"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className={`rule-item ${rules.length ? 'met' : ''}`}><Check size={12} /> At least 8 characters</div>
                    <div className={`rule-item ${rules.letter ? 'met' : ''}`}><Check size={12} /> At least 1 letter</div>
                    <div className={`rule-item ${rules.number ? 'met' : ''}`}><Check size={12} /> At least 1 number</div>
                    <div className={`rule-item ${rules.match ? 'met' : ''}`}><Check size={12} /> Passwords match</div>
                  </div>

                  <button type="submit" disabled={loading || !passwordValid} className="auth-btn">
                    {loading ? 'Please wait…' : 'Create account'}
                  </button>
                </form>
              </>
            )}

            {(state === 'expired' || state === 'invalid') && (
              <div className="text-center">
                <div className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,58,255,0.12)', color: '#4A3AFF' }}>
                  <MailWarning size={26} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {state === 'expired' ? 'This link has expired' : 'We couldn’t verify this link'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{message}</p>
                {email ? (
                  <button type="button" onClick={resendLink} disabled={loading} className="auth-btn">
                    {loading ? 'Sending…' : `Send a new link to ${email}`}
                  </button>
                ) : null}
                <button type="button" onClick={() => router.push('/user/auth/register')} className="auth-btn-ghost">
                  Back to sign up
                </button>
              </div>
            )}

            {state === 'registered' && (
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">You&apos;re already set up</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">This email already has a Learnexity account. Log in to continue.</p>
                <button type="button" onClick={() => router.push('/user/auth/login')} className="auth-btn">Log in</button>
              </div>
            )}
          </div>
        </div>

        {showTerms && (
          <div className="modal-overlay" onClick={() => !loading && setShowTerms(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">One last step</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                By signing up, you agree to our{' '}
                <a href="/terms-of-services" target="_blank" rel="noopener noreferrer" className="page-switch-link">Terms &amp; Conditions</a>{' '}
                and{' '}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="page-switch-link">Privacy Policy</a>.
              </p>
              <button onClick={handleConfirmTerms} disabled={loading} className="auth-btn">
                {loading ? 'Creating account…' : 'I Agree — Create Account'}
              </button>
              <button type="button" onClick={() => setShowTerms(false)} disabled={loading} className="auth-btn-ghost">
                Cancel
              </button>
            </div>
          </div>
        )}
      </AppLayout>
    </>
  );
}
