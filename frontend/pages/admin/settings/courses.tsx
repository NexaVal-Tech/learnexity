import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import { Search, Loader2, AlertCircle, Settings, DollarSign } from 'lucide-react';
import { api, handleApiError } from '@/lib/api';
import CourseSettings from '@/components/admin/settings/CourseSettings';

interface Course {
  id: number;
  course_id: string;
  title: string;
  name?: string;
}

const CourseSettingsPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      // ✅ FIX: Add per_page parameter to fetch all courses
      const response = await api.admin.courses.getAll({ per_page: 100 });
      setCourses(response.data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.course_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <AdminRouteGuard>
        <AdminLayout>
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </AdminLayout>
      </AdminRouteGuard>
    );
  }

  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="min-h-screen bg-gray-50/50 p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Course Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Configure pricing and payment options for your courses</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Course List */}
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-6">
                {/* Search */}
                <div className="p-4 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search courses..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Course List */}
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                  {error ? (
                    <div className="p-4 text-center">
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  ) : filteredCourses.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-sm text-gray-500">No courses found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredCourses.map((course) => (
                        <button
                          key={course.id}
                          onClick={() => setSelectedCourse(course)}
                          className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                            selectedCourse?.id === course.id ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''
                          }`}
                        >
                          <div className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                            {course.title || course.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {course.course_id}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Content - Settings Panel */}
            <div className="lg:col-span-8 xl:col-span-9">
              {selectedCourse ? (
                <CourseSettings courseId={selectedCourse.course_id} />
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-12">
                  <div className="text-center max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Course</h3>
                    <p className="text-gray-600">
                      Choose a course from the list to configure its pricing and payment settings
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default CourseSettingsPage;