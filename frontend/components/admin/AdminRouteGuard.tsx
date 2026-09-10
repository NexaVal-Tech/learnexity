import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { adminHasPermission } from '@/lib/adminApi';

interface AdminRouteGuardProps {
  children: React.ReactNode;
  /**
   * If set, the page also requires this capability (see Admin::PERMISSIONS
   * on the backend). Super admins always pass. Omit for pages every admin
   * may see (e.g. the dashboard).
   */
  requiredPermission?: string;
  /** If set, the page is restricted to super admins only (e.g. Team management). */
  requireSuperAdmin?: boolean;
}

export default function AdminRouteGuard({ children, requiredPermission, requireSuperAdmin }: AdminRouteGuardProps) {
  const { admin, loading } = useAdminAuth();
  const router = useRouter();

  const forbidden =
    !!admin &&
    ((requireSuperAdmin && !admin.is_super_admin) ||
      (requiredPermission && !adminHasPermission(admin, requiredPermission)));

  useEffect(() => {
    if (loading) return;

    if (!admin) {
      const currentPath = router.asPath;
      sessionStorage.setItem('admin_intended_route', currentPath);

      // ✅ IMPORTANT: replace, not push
      router.replace('/admin/auth/login');
      return;
    }

    if (forbidden) {
      router.replace('/admin/dashboard');
    }
  }, [admin, loading, forbidden, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#08080c]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin || forbidden) return null;

  return <>{children}</>;
}
