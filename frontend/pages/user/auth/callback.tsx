// pages/user/auth/callback.tsx
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const { setUserFromToken } = useAuth();
  const [status, setStatus] = useState('Processing authentication...');
  const hasProcessed = useRef(false); // 👈 Prevent multiple executions

  useEffect(() => {
    // Don't run if already processed
    if (hasProcessed.current) return;
    
    // Wait for router to be ready
    if (!router.isReady) return;

    const handleAuth = async () => {
      // Mark as processing to prevent duplicate runs
      hasProcessed.current = true;

      try {
        const { token, error } = router.query;

        console.log('🔍 Callback received:', {
          token: token ? '✅ Present' : '❌ Missing',
          error,
          fullQuery: router.query,
        });

        if (error) {
          console.error('❌ OAuth error:', error);
          setStatus('Authentication failed. Redirecting to login...');
          setTimeout(() => {
            router.push(`/user/auth/login?error=${error}`);
          }, 1500);
          return;
        }

        if (!token || typeof token !== 'string') {
          console.error('❌ No token received in callback');
          setStatus('No authentication token found. Redirecting to login...');
          setTimeout(() => {
            router.push('/user/auth/login');
          }, 1500);
          return;
        }

        // ✅ Store token AND update user state immediately
        setStatus('Verifying authentication...');
        await setUserFromToken(token);
        console.log('✅ User authenticated and state updated');

        // ✅ Handle course redirection
        const intendedCourse = sessionStorage.getItem('intended_course');
        const intendedCourseName = sessionStorage.getItem('intended_course_name');

        if (intendedCourse && intendedCourseName) {
          console.log('📚 Redirecting to intended course:', intendedCourseName);
          setStatus(`Redirecting to ${intendedCourseName}...`);
          sessionStorage.removeItem('intended_course');
          sessionStorage.removeItem('intended_course_name');
          router.push(`/courses/${intendedCourse}`);
          return;
        }

        // ✅ Redirect to dashboard
        setStatus('Redirecting to dashboard...');
        console.log('📍 Redirecting to dashboard');
        router.push('/user/dashboard');

      } catch (err) {
        console.error('❌ Auth callback error:', err);
        setStatus('An error occurred. Redirecting to login...');
        setTimeout(() => {
          router.push('/user/auth/login');
        }, 1500);
      }
    };

    handleAuth();
  }, [router.isReady]); // 👈 Only depend on router.isReady

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Signing You In
        </h2>
        <p className="text-gray-600 text-sm">
          {status}
        </p>
      </div>
    </div>
  );
}