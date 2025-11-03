'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import AppLayout from "@/components/layouts/AppLayout";
import { handleApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Toast from "@/components/ui/toast";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (err: any) {
      setError(err.message || handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-white flex items-center justify-center p-4 pt-2 sm:pt-4 md:pt-20 lg:pt-24">
        <div className="w-full max-w-[1480px] flex flex-col lg:flex-row gap-8 items-center">
          {/* Left Section - Form */}
          <div className="w-full lg:h-[640px] lg:w-1/2 flex flex-col p-4 lg:p-8 sm:mt-0 shadow-2xl rounded-2xl">
            <div className="max-w-screen2xl w-full">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600 mb-8">
                Don&apos;t have an account?{' '}
                <a href="/user/auth/register" className="text-purple-600 font-medium hover:underline">
                  Sign up
                </a>
              </p>

              {/* ✅ Toast for errors */}
              {error && (
                <Toast
                  message={error}
                  type="error"
                  duration={4000}
                  onClose={() => setError('')}
                />
              )}

              <form onSubmit={handleSubmit} className="space-y-2">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                    className="w-full px-4 py-2 text-purple-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••••••"
                      required
                      disabled={loading}
                      className="w-full px-4 py-2 text-purple-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me + Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50"
                    />
                    <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <a
                    href="/user/auth/resetpassword"
                    className="text-sm text-purple-600 hover:underline font-medium"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#6C63FF] text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M19.8 10.2273C19.8 9.51819 19.7364 8.83637 19.6182 8.18182H10.2V12.05H15.6109C15.3727 13.3 14.6636 14.3591 13.6045 15.0682V17.5773H16.8273C18.7091 15.8364 19.8 13.2727 19.8 10.2273Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M10.2 20C12.9 20 15.1727 19.1045 16.8273 17.5773L13.6045 15.0682C12.7091 15.6682 11.5636 16.0227 10.2 16.0227C7.59545 16.0227 5.38182 14.2636 4.58636 11.9H1.25455V14.4909C2.90909 17.7591 6.29091 20 10.2 20Z"
                      fill="#34A853"
                    />
                    <path
                      d="M4.58636 11.9C4.38636 11.3 4.27273 10.6591 4.27273 10C4.27273 9.34091 4.38636 8.7 4.58636 8.1V5.50909H1.25455C0.572727 6.85909 0.2 8.38636 0.2 10C0.2 11.6136 0.572727 13.1409 1.25455 14.4909L4.58636 11.9Z"
                      fill="#FBBC04"
                    />
                    <path
                      d="M10.2 3.97727C11.6864 3.97727 13.0182 4.48182 14.0636 5.47273L16.9227 2.61364C15.1682 0.986364 12.8955 0 10.2 0C6.29091 0 2.90909 2.24091 1.25455 5.50909L4.58636 8.1C5.38182 5.73636 7.59545 3.97727 10.2 3.97727Z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="text-gray-700 font-medium">Sign in with Google</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Section - Image */}
          <div className="w-full lg:w-1/2 hidden lg:flex items-center justify-center">
            <div className="w-full h-[640px] bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center relative">
              <img src="/images/auth.png" alt="Login illustration" className="w-full h-full object-cover rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
