import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import StudentFilters from '@/components/admin/students/StudentFilters';
import StudentsTable from '@/components/admin/students/StudentsTable';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
// import DebugPanel from '@/components/admin/DebugPanel';

const StudentsPage = () => {
  const [filters, setFilters] = useState({
    search: '',
    activity_status: undefined as 'active' | 'inactive' | undefined,
    payment_status: undefined as 'completed' | 'pending' | 'failed' | undefined,
    course_id: undefined as string | undefined,
  });

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="min-h-screen bg-white rounded-2xl p-6">
          {/* <DebugPanel />  */}
          <StudentFilters onFilterChange={handleFilterChange} />
          <StudentsTable filters={filters} />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default StudentsPage;