'use client';

import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import AppLayout from "@/components/layouts/AppLayout";
import { api, handleApiError } from '@/lib/api';
import { useRouter } from 'next/router';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const router = useRouter();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      await api.auth.sendResetLink(email);
      setSuccess('Reset code sent to your email!');
      setStep('reset');
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !resetCode || !newPassword || !confirmPassword) {
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
        email,
        token: resetCode,
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

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Back Button */}
          <button
            className="flex items-center gap-2 text-gray-700 mb-2 hover:text-gray-900 transition-colors"
            onClick={() => router.back()}
          >
            <ArrowLeft size={20} />
            <span className="text-base">Back</span>
          </button>

          {/* Form Container */}
          <div className="bg-white rounded-lg p-6 md:p-12 shadow-lg">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {step === 'request' ? 'Reset Password' : 'Set New Password'}
              </h1>
              <p className="text-gray-500 text-base">
                {step === 'request' 
                  ? 'Enter your email to receive a reset code'
                  : 'Enter the code from your email and your new password'}
              </p>
            </div>

            {/* Feedback Messages */}
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

            {/* Step 1: Request Reset Code */}
            {step === 'request' && (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter your email"
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm placeholder:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#6C63FF] text-white font-medium py-3 rounded-full transition-colors text-base mt-8 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setStep('reset')}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    Already have a code? Enter it here
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Reset Password with Code */}
            {step === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter your email"
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm placeholder:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Reset Code Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Reset Code
                  </label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => {
                      setResetCode(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter the reset code from your email"
                    disabled={loading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm placeholder:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* New Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="••••••••••••••••"
                      disabled={loading}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm placeholder:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={loading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="••••••••••••••••"
                      disabled={loading}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-sm placeholder:text-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#6C63FF] text-white font-medium py-3 rounded-full transition-colors text-base mt-8 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setStep('request')}
                    disabled={loading}
                    className="text-sm text-purple-600 hover:underline disabled:opacity-50"
                  >
                    Didn't receive a code? Request a new one
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}