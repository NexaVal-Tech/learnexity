// pages/user/UserDashboardLayout.tsx
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import UserLayout from '../../components/layout/UserLayout';

// Protected wrapper component - ONLY for protected pages
function ProtectedContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Only redirect if not loading and not authenticated
    if (!loading && !user && !isRedirecting) {
      setIsRedirecting(true);
      router.push('/user/auth/login');
    }
  }, [user, loading, router, isRedirecting]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show nothing (redirect happening)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // For authenticated users, wrap with UserLayout
  return <UserLayout>{children}</UserLayout>;
}

// Layout that provides protection (AuthProvider is now in _app.tsx)
export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedContent>{children}</ProtectedContent>;
}