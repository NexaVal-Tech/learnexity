import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import StudentFilters from '@/components/admin/students/StudentFilters';
import StudentsTable from '@/components/admin/students/StudentsTable';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';

type FilterType = {
  search?: string;
  activity_status?: 'active' | 'inactive';
  payment_status?: 'completed' | 'pending' | 'failed';
  course_id?: string;
};

const StudentsPage = () => {
  const [filters, setFilters] = useState<FilterType>({ search: '' });
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
  };

  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="min-h-screen bg-white rounded-2xl p-6">
          <StudentFilters
            onFilterChange={handleFilterChange}
            selectedCount={selectedStudents.length}
            onMessageClick={() => console.log('Message clicked')}
          />
          <StudentsTable
            filters={filters}
            selectedStudents={selectedStudents}
            onSelectionChange={setSelectedStudents}
          />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default StudentsPage;
