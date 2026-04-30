// pages/user/auth/callback.tsx
// Handles Google OAuth callback.
// Now also supports scholarship_browse_courses query param echoed back from backend.

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const { setUserFromToken } = useAuth();
  const [status, setStatus] = useState('Processing authentication...');
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    if (!router.isReady) return;

    const handleAuth = async () => {
      hasProcessed.current = true;

      try {
        setStatus('Verifying authentication...');

        const oauthTokenFromUrl = router.query.oauth_token as string | undefined;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/exchange-token`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: oauthTokenFromUrl
              ? JSON.stringify({ oauth_token: oauthTokenFromUrl })
              : undefined,
          }
        );

        if (oauthTokenFromUrl) {
          router.replace('/user/auth/callback', undefined, { shallow: true });
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Exchange failed:', response.status, errorData);
          throw new Error(errorData.message || 'Token exchange failed');
        }

        const data = await response.json();

        if (!data.token) {
          throw new Error('No token in exchange response');
        }

        await setUserFromToken(data.token);

        // ── Redirect priority (mirrors resolvePostLoginRedirect in AuthContext) ──

        // 1. Scholarship application for a specific course
        const scholarshipRedirect = sessionStorage.getItem('scholarship_course_redirect');
        if (scholarshipRedirect) {
          sessionStorage.removeItem('scholarship_course_redirect');
          const safeId = scholarshipRedirect.replace(/[^a-zA-Z0-9_-]/g, '');
          if (safeId) { router.push(`/scholarships/${safeId}`); return; }
        }

        // Also check query params echoed back from backend
        const { scholarship_redirect, scholarship_browse_courses, intended_course: qIntendedCourse } = router.query;

        if (scholarship_redirect) {
          const safeId = (scholarship_redirect as string).replace(/[^a-zA-Z0-9_-]/g, '');
          if (safeId) { router.push(`/scholarships/${safeId}`); return; }
        }

        // 2. Scholarship banner → courses listing
        const browseCourses = sessionStorage.getItem('scholarship_browse_courses');
        if (browseCourses || scholarship_browse_courses === 'true') {
          sessionStorage.removeItem('scholarship_browse_courses');
          router.push('/courses/courses');
          return;
        }

        // 3. Intended course (mid-enrolment)
        if (qIntendedCourse) {
          const safeId = (qIntendedCourse as string).replace(/[^a-zA-Z0-9_-]/g, '');
          if (safeId) { router.push(`/courses/${safeId}`); return; }
        }

        const intendedCourse = sessionStorage.getItem('intended_course');
        if (intendedCourse) {
          sessionStorage.removeItem('intended_course');
          sessionStorage.removeItem('intended_course_name');
          router.push(`/courses/${intendedCourse}`);
          return;
        }

        // 4. Default
        setStatus('Redirecting to dashboard...');
        router.push('/user/dashboard');

      } catch (err) {
        console.error('Auth callback error:', err);
        setStatus('Authentication failed. Redirecting to login...');
        setTimeout(() => {
          router.push('/user/auth/login?error=oauth_failed');
        }, 1500);
      }
    };

    handleAuth();
  }, [router.isReady]);

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
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Signing You In</h2>
        <p className="text-gray-600 text-sm">{status}</p>
      </div>
    </div>
  );
}