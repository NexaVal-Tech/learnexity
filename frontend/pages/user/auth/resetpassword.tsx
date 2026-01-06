'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { api, handleApiError } from '@/lib/api';
import { useRouter } from 'next/router';

export default function ResetPassword() {
  const router = useRouter();
  const { token, email } = router.query;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidLink, setIsValidLink] = useState<boolean | null>(null);

  // Guard: missing token or email - only check after router is ready
  useEffect(() => {
    if (router.isReady) {
      console.log('🔍 Reset Password Debug:', {
        hasToken: !!token,
        hasEmail: !!email,
        token: token,
        email: email,
        tokenType: typeof token,
        emailType: typeof email
      });

      if (!token || !email) {
        setIsValidLink(false);
        setError('Invalid or expired password reset link.');
      } else {
        setIsValidLink(true);
      }
    }
  }, [router.isReady, token, email]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      await api.auth.resetPassword({
        email: String(email),
        token: String(token),
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      setSuccess('Password reset successful! Redirecting to login...');

      setTimeout(() => {
        router.push('/user/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while router is initializing
  if (!router.isReady || isValidLink === null) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-lg p-6 md:p-12 shadow-lg">
              <div className="text-center">
                <p className="text-gray-500">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <button
            className="flex items-center gap-2 text-gray-700 mb-2 hover:text-gray-900"
            onClick={() => router.push('/user/auth/login')}
          >
            <ArrowLeft size={20} />
            <span>Back to login</span>
          </button>

          <div className="bg-white rounded-lg p-6 md:p-12 shadow-lg">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Set New Password
              </h1>
              <p className="text-gray-500">
                Enter your new password below
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                {success}
              </div>
            )}

            {isValidLink && !success && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                      placeholder="••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                      placeholder="••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#6C63FF] text-white font-medium py-3 rounded-full hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            )}

            {!isValidLink && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  This password reset link is invalid or has expired.
                </p>
                <button
                  onClick={() => router.push('/user/auth/forgot-password')}
                  className="text-purple-600 hover:underline font-medium"
                >
                  Request a new reset link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}