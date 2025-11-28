import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import CourseStats from '@/components/admin/courses/CourseStats';
import CourseFilters from '@/components/admin/courses/CourseFilters';
import CoursesTable from '@/components/admin/courses/CoursesTable';
import { Plus } from 'lucide-react';

const CoursesPage = () => {
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Course Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage courses, content, and student enrollments</p>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            <Plus size={18} />
            Create New Course
          </button>
        </div>

        <CourseStats />
        <CourseFilters />
        <CoursesTable />
      </div>
    </AdminLayout>
  );
};

export default CoursesPage;
