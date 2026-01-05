'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { api, handleApiError } from '@/lib/api';
import { useRouter } from 'next/router';

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

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await api.auth.sendResetLink(email);
      setSuccess('Password reset link has been sent to your email. Please check your inbox.');
      setEmail('');
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
                Forgot Password?
              </h1>
              <p className="text-gray-500">
                Enter your email address and we'll send you a link to reset your password
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6C63FF] text-white font-medium py-3 rounded-full hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}