// pages/instructor/courses/index.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import InstructorLayout from '@/components/layouts/InstructorLayout';
import InstructorRouteGuard from '@/components/instructor/InstructorRouteGuard';
import { instructorApi, InstructorCourse } from '@/lib/instructorApi';
import { BookCopy, ArrowRight, Loader2, Search } from 'lucide-react';

export default function InstructorCoursesPage() {
  const router = useRouter();
  const [courses, setCourses]   = useState<InstructorCourse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    instructorApi.courses.getAll()
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.course_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <InstructorRouteGuard>
      <InstructorLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
              <p className="text-sm text-gray-500 mt-1">
                {courses.length} course{courses.length !== 1 ? 's' : ''} assigned to you
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <BookCopy size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">
                {search ? 'No courses match your search.' : 'No courses assigned yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((course) => (
                <div
                  key={course.course_id}
                  onClick={() => router.push(`/instructors/courses/${course.course_id}`)}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div
                    className="h-40 bg-cover bg-center bg-gray-100"
                    style={{ backgroundImage: course.hero_image ? `url(${course.hero_image})` : undefined }}
                  />
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full">
                        {course.sprint_count} Sprint{course.sprint_count !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                        Manage <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </InstructorLayout>
    </InstructorRouteGuard>
  );
}