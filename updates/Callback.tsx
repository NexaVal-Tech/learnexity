import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const { setUserFromToken } = useAuth();
  const [status, setStatus] = useState('Processing authentication...');
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current || !router.isReady) return;

    const handleAuth = async () => {
      hasProcessed.current = true;

      try {
        const fragmentParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const token = fragmentParams.get('token') ?? router.query.token;
        const error = router.query.error;

        if (error) {
          setStatus('Authentication failed. Redirecting to login...');
          setTimeout(() => {
            router.push(`/user/auth/login?error=${encodeURIComponent(String(error))}`);
          }, 1500);
          return;
        }

        if (!token || typeof token !== 'string') {
          setStatus('No authentication token found. Redirecting to login...');
          setTimeout(() => {
            router.push('/user/auth/login');
          }, 1500);
          return;
        }

        setStatus('Verifying authentication...');
        await setUserFromToken(token);
        window.history.replaceState(null, '', '/user/auth/callback');

        const intendedCourse = sessionStorage.getItem('intended_course');
        const intendedCourseName = sessionStorage.getItem('intended_course_name');

        if (intendedCourse && intendedCourseName) {
          setStatus(`Redirecting to ${intendedCourseName}...`);
          sessionStorage.removeItem('intended_course');
          sessionStorage.removeItem('intended_course_name');
          router.push(`/courses/${intendedCourse}`);
          return;
        }

        setStatus('Redirecting to dashboard...');
        router.push('/user/dashboard');
      } catch {
        setStatus('An error occurred. Redirecting to login...');
        setTimeout(() => {
          router.push('/user/auth/login');
        }, 1500);
      }
    };

    handleAuth();
  }, [router, setUserFromToken]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto" />
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
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Signing You In</h2>
        <p className="text-gray-600 text-sm">{status}</p>
      </div>
    </div>
  );
}
