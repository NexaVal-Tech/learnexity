import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MoreHorizontal, ChevronDown, ChevronUp, Users, FileText, Edit, Trash, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Course {
  id: number;
  course_id: string;
  title: string;
  stats: {
    total_enrollments: number;
    active_students: number;
    completion_rate: number;
    sprint_count: number;
    week_count: number;
  };
}

interface CoursesTableProps {
  filters?: {
    search?: string;
    status?: 'active' | 'inactive';
  };
}

const CoursesTable: React.FC<CoursesTableProps> = ({ filters }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.admin.courses.getAll(filters);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleDropdown = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await api.admin.courses.delete(courseId);
      fetchCourses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete course');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const ActionDropdown = ({ course }: { course: Course }) => (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <Link 
        href={`/admin/courses/${course.course_id}`} 
        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
      >
        <FileText size={16} className="text-gray-500" />
        Manage Content
      </Link>
      <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5">
        <Edit size={16} className="text-gray-500" />
        Edit Course
      </button>
      <Link 
        href={`/admin/courses/${course.course_id}?tab=students`}
        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
      >
        <Users size={16} className="text-gray-500" />
        View Students
      </Link>
      <button 
        onClick={() => handleDeleteCourse(course.course_id)}
        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5"
      >
        <Trash size={16} />
        Delete Course
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden min-h-[400px]">
      {/* Mobile Accordion View */}
      <div className="md:hidden">
        {courses.map((course) => (
          <div key={course.id} className="border-b border-gray-100 last:border-0 relative">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => toggleExpand(course.id)}
            >
              <div className="flex items-center gap-3">
                <Link 
                  href={`/admin/courses/${course.course_id}`} 
                  className="font-medium text-gray-900 text-sm hover:underline" 
                  onClick={(e) => e.stopPropagation()}
                >
                  {course.title}
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button 
                    className="text-gray-400 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={(e) => toggleDropdown(course.id, e)}
                  >
                    <MoreHorizontal size={20} />
                  </button>
                  {activeDropdown === course.id && <ActionDropdown course={course} />}
                </div>
                {expandedId === course.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
              </div>
            </div>

            {expandedId === course.id && (
              <div className="px-4 pb-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Students</span>
                  <div className="flex items-center gap-1">
                    <Users size={14} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{course.stats.total_enrollments}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Active Students</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">
                    {course.stats.active_students}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Completion Rate</span>
                  <div className="flex items-center gap-3 w-32">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${course.stats.completion_rate}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{course.stats.completion_rate}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Students</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Active Students</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Sprints</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.map((course) => {
              const paidStudents = course.stats.active_students;
              const unpaidStudents = course.stats.total_enrollments - course.stats.active_students;
              
              return (
                <tr key={course.id} className="hover:bg-gray-50 transition-colors relative">
                  <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                    <Link href={`/admin/courses/${course.course_id}`} className="text-blue-600 hover:underline">
                      {course.title}
                    </Link>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-900">{course.stats.total_enrollments}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                      {course.stats.active_students}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600">
                      {course.stats.sprint_count} sprints
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3 w-32">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full" 
                          style={{ width: `${course.stats.completion_rate}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{course.stats.completion_rate}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      course.stats.active_students > 0
                        ? 'bg-[#0F172A] text-white' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {course.stats.active_students > 0 ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="relative">
                      <button 
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={(e) => toggleDropdown(course.id, e)}
                      >
                        <MoreHorizontal size={20} />
                      </button>
                      {activeDropdown === course.id && <ActionDropdown course={course} />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoursesTable;