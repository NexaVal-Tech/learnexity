import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MoreHorizontal, ChevronDown, ChevronUp, Users, FileText, Edit, Trash, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '@/lib/api';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';

interface Course {
  id: number;
  course_id: string;
  title: string;
  is_active: boolean;
  stats: {
    total_enrollments: number;
    active_students: number;
    completion_rate: number;
    sprint_count: number;
    week_count: number;
    is_active: boolean;
  };
}

interface CoursesTableProps {
  filters: { search?: string; status?: 'active' | 'inactive' };
  onEditCourse: (course: any) => void;
}

const CoursesTable: React.FC<CoursesTableProps> = ({ filters, onEditCourse }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
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
      // silent
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleDropdown = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeDropdown === id) {
      setActiveDropdown(null);
      setDropdownPos(null);
    } else {
      const btn = e.currentTarget as HTMLButtonElement;
      const rect = btn.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right,
      });
      setActiveDropdown(id);
    }
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

  const handleToggleStatus = async (course: Course, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown(null);
    setDropdownPos(null);
    setTogglingId(course.course_id);
    try {
      const res = await api.admin.courses.toggleStatus(course.course_id);
      toast.success(res.message);
      // Optimistically update local state
      setCourses(prev =>
        prev.map(c =>
          c.course_id === course.course_id
            ? { ...c, is_active: res.is_active, stats: { ...c.stats, is_active: res.is_active } }
            : c
        )
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update course status');
    } finally {
      setTogglingId(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ActionDropdown = ({ course }: { course: Course }) => {
    if (!dropdownPos) return null;
    const isActive = course.stats?.is_active ?? course.is_active;
    return createPortal(
      <div
        ref={dropdownRef}
        style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right }}
        className="w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-[200]"
        onClick={(e) => e.stopPropagation()}
      >
        <Link
          href={`/admin/courses/${course.course_id}`}
          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
        >
          <FileText size={16} className="text-gray-500" />
          Manage Content
        </Link>
        <button
          onClick={() => { onEditCourse(course); setActiveDropdown(null); setDropdownPos(null); }}
          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
        >
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

        {/* Divider */}
        <div className="my-1 border-t border-gray-100" />

        {/* Toggle status */}
        <button
          onClick={(e) => handleToggleStatus(course, e)}
          className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2.5 ${
            isActive
              ? 'text-amber-600 hover:bg-amber-50'
              : 'text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          {isActive
            ? <><ToggleLeft size={16} /> Set Inactive</>
            : <><ToggleRight size={16} /> Set Active</>
          }
        </button>

        <button
          onClick={() => { handleDeleteCourse(course.course_id); setDropdownPos(null); }}
          className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5"
        >
          <Trash size={16} />
          Delete Course
        </button>
      </div>,
      document.body
    );
  };

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
        {courses.map((course) => {
          const isActive = course.stats?.is_active ?? course.is_active;
          return (
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
                  {/* Inline status badge */}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    isActive ? 'bg-[#0F172A] text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isActive ? 'active' : 'inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button
                      className="text-gray-400 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={(e) => toggleDropdown(course.id, e)}
                    >
                      {togglingId === course.course_id
                        ? <Loader2 size={20} className="animate-spin" />
                        : <MoreHorizontal size={20} />
                      }
                    </button>
                    {activeDropdown === course.id && <ActionDropdown course={course} />}
                  </div>
                  {expandedId === course.id
                    ? <ChevronUp size={20} className="text-gray-400" />
                    : <ChevronDown size={20} className="text-gray-400" />
                  }
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
          );
        })}
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
              const isActive = course.stats?.is_active ?? course.is_active;
              return (
                <tr key={course.id} className={`hover:bg-gray-50 transition-colors relative ${!isActive ? 'opacity-60' : ''}`}>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/courses/${course.course_id}`} className="text-blue-600 hover:underline">
                        {course.title}
                      </Link>
                      {!isActive && (
                        <span className="text-[10px] font-medium bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
                          hidden from students
                        </span>
                      )}
                    </div>
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
                    {/* Clickable status badge — quick toggle */}
                    <button
                      onClick={(e) => handleToggleStatus(course, e)}
                      disabled={togglingId === course.course_id}
                      title={isActive ? 'Click to set inactive' : 'Click to set active'}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#0F172A] text-white hover:bg-red-600'
                          : 'bg-gray-100 text-gray-500 hover:bg-emerald-100 hover:text-emerald-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {togglingId === course.course_id
                        ? <Loader2 size={12} className="animate-spin inline" />
                        : isActive ? 'active' : 'inactive'
                      }
                    </button>
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