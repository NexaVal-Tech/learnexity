import React from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface TopCourse {
  id: number;
  course_id: string;
  title: string;
  students: number;
  revenue: string;
  completion_rate: string;
}

interface TopCoursesProps {
  courses: TopCourse[];
}

const TopCourses: React.FC<TopCoursesProps> = ({ courses }) => {
  return (
    <div className="bg-white dark:bg-[#0f0f14] p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Performing Courses</h3>
        <Link
          href="/admin/courses"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium border border-gray-200 dark:border-white/10 px-3 py-1 rounded-lg"
        >
          View All
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          No courses available
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course, index) => (
            <Link
              key={course.id}
              href={`/admin/courses/${course.course_id}`}
              className="block border border-gray-100 dark:border-white/10 rounded-xl p-4 hover:border-gray-200 dark:hover:border-white/20 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-white/10 rounded-lg flex items-center justify-center font-bold text-gray-500 dark:text-gray-400">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{course.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Revenue: {course.revenue}</p>
                </div>

                {/* Desktop Stats */}
                <div className="hidden md:flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">Students</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{course.students}</div>
                  </div>
                  <div className="text-center min-w-[80px]">
                    <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">Completion</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{course.completion_rate}</div>
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="md:hidden flex flex-col items-end gap-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{course.students} students</div>
                  <div className="text-xs font-semibold text-gray-900 dark:text-white">{course.completion_rate}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopCourses;