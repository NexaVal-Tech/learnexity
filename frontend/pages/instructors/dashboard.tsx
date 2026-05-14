// pages/instructor/dashboard.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import InstructorLayout from '@/components/layouts/InstructorLayout';
import InstructorRouteGuard from '@/components/instructor/InstructorRouteGuard';
import { useInstructorAuth } from '@/contexts/InstructorAuthContext';
import { instructorApi, InstructorCourse } from '@/lib/instructorApi';
import { BookCopy, Users, FolderKanban, ArrowRight, Loader2, BookOpen } from 'lucide-react';

export default function InstructorDashboard() {
  const { instructor } = useInstructorAuth();
  const router = useRouter();
  const [courses, setCourses]   = useState<InstructorCourse[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    instructorApi.courses.getAll()
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalSprints = courses.reduce((acc, c) => acc + (c.sprint_count || 0), 0);

  return (
    <InstructorRouteGuard>
      <InstructorLayout>
        <div className="space-y-8">

          {/* Welcome hero */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 md:p-8">
            <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-1">
              Instructor Portal
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Welcome back, {instructor?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-indigo-200 text-sm">
              You have <strong className="text-white">{courses.length} course{courses.length !== 1 ? 's' : ''}</strong> assigned to you.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: BookCopy,     label: 'Assigned Courses', value: courses.length,  color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { icon: BookOpen,     label: 'Total Sprints',    value: totalSprints,     color: 'text-violet-600', bg: 'bg-violet-50' },
              { icon: FolderKanban, label: 'Active Projects',  value: '—',             color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Courses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Courses</h2>
              <Link href="/instructors/courses" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                <BookCopy size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No courses assigned yet.</p>
                <p className="text-sm text-gray-400 mt-1">Contact your admin to get courses assigned.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.slice(0, 6).map((course) => (
                  <div
                    key={course.course_id}
                    onClick={() => router.push(`/instructors/courses/${course.course_id}`)}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div
                      className="h-36 bg-cover bg-center bg-gray-100"
                      style={{ backgroundImage: course.hero_image ? `url(${course.hero_image})` : undefined }}
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {course.sprint_count} sprint{course.sprint_count !== 1 ? 's' : ''}
                      </p>
                      <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-600">
                        Manage Course <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/instructors/courses"
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
              >
                <BookCopy size={16} /> Manage Course Materials
              </Link>
              <Link
                href="/instructors/projects"
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition"
              >
                <FolderKanban size={16} /> View Projects
              </Link>
            </div>
          </div>
        </div>
      </InstructorLayout>
    </InstructorRouteGuard>
  );
}