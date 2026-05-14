// components/instructor/InstructorRouteGuard.tsx

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useInstructorAuth } from '@/contexts/InstructorAuthContext';

export default function InstructorRouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useInstructorAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/instructors/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}