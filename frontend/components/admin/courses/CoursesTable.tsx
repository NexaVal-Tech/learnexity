import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MoreHorizontal, ChevronDown, ChevronUp, Users, FileText, Edit, Trash } from 'lucide-react';

const courses = [
  {
    id: 1,
    name: 'Web Development',
    totalStudents: 45,
    activeStudents: 38,
    paidStudents: 40,
    unpaidStudents: 5,
    completionRate: 68,
    status: 'active',
  },
  {
    id: 2,
    name: 'Advanced JavaScript',
    totalStudents: 32,
    activeStudents: 30,
    paidStudents: 32,
    unpaidStudents: 0,
    completionRate: 82,
    status: 'active',
  },
  {
    id: 3,
    name: 'React Master Class',
    totalStudents: 28,
    activeStudents: 25,
    paidStudents: 26,
    unpaidStudents: 2,
    completionRate: 45,
    status: 'active',
  },
  {
    id: 4,
    name: 'Data Science Fundamentals',
    totalStudents: 18,
    activeStudents: 15,
    paidStudents: 16,
    unpaidStudents: 2,
    completionRate: 55,
    status: 'active',
  },
  {
    id: 5,
    name: 'Mobile Development',
    totalStudents: 12,
    activeStudents: 8,
    paidStudents: 10,
    unpaidStudents: 2,
    completionRate: 30,
    status: 'active',
  },
  {
    id: 6,
    name: 'Python for Beginners',
    totalStudents: 55,
    activeStudents: 2,
    paidStudents: 55,
    unpaidStudents: 0,
    completionRate: 95,
    status: 'inactive',
  },
];

const CoursesTable = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleDropdown = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
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

  const ActionDropdown = ({ courseId }: { courseId: number }) => (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <Link href={`/admin/courses/${courseId}`} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5">
        <FileText size={16} className="text-gray-500" />
        Manage Content
      </Link>
      <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5">
        <Edit size={16} className="text-gray-500" />
        Edit Course
      </button>
      <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5">
        <Users size={16} className="text-gray-500" />
        View Students
      </button>
      <button className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5">
        <Trash size={16} />
        Delete Course
      </button>
    </div>
  );

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
                <Link href={`/admin/courses/${course.id}`} className="font-medium text-gray-900 text-sm hover:underline" onClick={(e) => e.stopPropagation()}>
                  {course.name}
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
                  {activeDropdown === course.id && <ActionDropdown courseId={course.id} />}
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
                    <span className="text-sm font-medium text-gray-900">{course.totalStudents}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Active Students</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">{course.activeStudents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Paid Students</span>
                  <span className="px-2 py-0.5 bg-[#0F172A] text-white rounded text-xs font-medium">{course.paidStudents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Unpaid Students</span>
                  <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-medium w-5 h-5 flex items-center justify-center">{course.unpaidStudents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Completion Rate</span>
                  <div className="flex items-center gap-3 w-32">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${course.completionRate}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{course.completionRate}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    course.status === 'active' 
                      ? 'bg-[#0F172A] text-white' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {course.status}
                  </span>
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
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Students</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Unpaid Students</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50 transition-colors relative">
                <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                  <Link href={`/admin/courses/${course.id}`} className="text-blue-600 hover:underline">
                    {course.name}
                  </Link>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-900">{course.totalStudents}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="px-2.5 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                    {course.activeStudents}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="px-2.5 py-1 bg-[#0F172A] text-white rounded text-xs font-medium">
                    {course.paidStudents}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {course.unpaidStudents > 0 ? (
                    <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-medium w-5 h-5 flex items-center justify-center">
                      {course.unpaidStudents}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">0</span>
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3 w-32">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${course.completionRate}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{course.completionRate}%</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    course.status === 'active' 
                      ? 'bg-[#0F172A] text-white' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {course.status}
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
                    {activeDropdown === course.id && <ActionDropdown courseId={course.id} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoursesTable;
