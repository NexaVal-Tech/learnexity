import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import CourseStats from '@/components/admin/courses/CourseStats';
import CourseFilters from '@/components/admin/courses/CourseFilters';
import CoursesTable from '@/components/admin/courses/CoursesTable';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import CreateCourseModal from '@/components/admin/courses/CreateCourseModal';
import AddCourseDetailsModal from '@/components/admin/courses/AdminCourseDetailsModal';
import EditCourseModal from '@/components/admin/courses/EditCourseModal';
import { Plus } from 'lucide-react';

const CoursesPage = () => {
  const [filters, setFilters] = useState<{ search?: string; status?: 'active' | 'inactive' }>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [createdCourse, setCreatedCourse] = useState<any>(null);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCourseCreated = (course?: any) => {
    setRefreshKey((prev) => prev + 1);
    if (course) {
      setCreatedCourse(course);
      setTimeout(() => setIsDetailsModalOpen(true), 300);
    }
  };

  const handleDetailsAdded = () => {
    setRefreshKey((prev) => prev + 1);
    setIsDetailsModalOpen(false);  // ← add this
    setCreatedCourse(null);        // ← and this, to clean up
  };
  
  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setIsEditModalOpen(true);
  };

  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="min-h-screen bg-gray-50/50 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Course Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage courses, content, and student enrollments</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Plus size={18} />
              Create New Course
            </button>
          </div>

          <CourseStats />
          <CourseFilters onFilterChange={setFilters} />
          <CoursesTable
            filters={filters}
            key={refreshKey}
            onEditCourse={handleEditCourse}
          />
        </div>

        <CreateCourseModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCourseCreated}
        />

        {createdCourse && (
          <AddCourseDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => { setIsDetailsModalOpen(false); setCreatedCourse(null); }}
            courseId={createdCourse.course_id}
            courseName={createdCourse.title}
            onSuccess={handleDetailsAdded}
          />
        )}

        <EditCourseModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setEditingCourse(null); }}
          onSuccess={() => setRefreshKey((prev) => prev + 1)}
          course={editingCourse}
        />
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default CoursesPage;