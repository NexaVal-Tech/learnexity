import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import StudentFilters from '@/components/admin/students/StudentFilters';
import StudentsTable from '@/components/admin/students/StudentsTable';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';

const StudentsPage = () => {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="min-h-screen bg-white rounded-2xl p-6">
          <StudentFilters />
          <StudentsTable />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default StudentsPage;
