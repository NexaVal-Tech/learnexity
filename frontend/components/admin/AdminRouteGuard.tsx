import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { admin, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) {
      const currentPath = router.asPath;
      sessionStorage.setItem('admin_intended_route', currentPath);

      // ✅ IMPORTANT: replace, not push
      router.replace('/admin/auth/login');
    }
  }, [admin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  return <>{children}</>;
}
