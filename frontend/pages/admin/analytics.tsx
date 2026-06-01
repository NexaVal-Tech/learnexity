import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';

export default function Analytics() {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">
            View platform performance, user engagement, and learning insights.
          </p>

          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-gray-500">
              Analytics dashboard is coming soon.
            </p>
          </div>
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}