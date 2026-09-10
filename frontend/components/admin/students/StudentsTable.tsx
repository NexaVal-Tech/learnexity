import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MoreVertical, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';

interface StudentCourse {
  course_name: string;
  payment_status: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string;
  courses_count: number;
  courses?: StudentCourse[];
  activity_status: 'active' | 'inactive';
  has_paid: boolean;
  created_at: string;
}

/** Small hover card listing a student's enrolled courses — lets an admin
 * see who's in what without opening the detail page. */
const CoursesAtAGlance = ({ courses }: { courses?: StudentCourse[] }) => {
  const [open, setOpen] = useState(false);

  if (!courses || courses.length === 0) {
    return (
      <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-xs font-medium text-gray-400 dark:text-gray-500">
        0
      </span>
    );
  }

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20"
      >
        <BookOpen size={11} />
        {courses.length}
      </button>

      {open && (
        <div className="absolute z-20 top-full left-0 mt-1 w-64 bg-white dark:bg-[#181820] border border-gray-200 dark:border-white/10 rounded-lg shadow-lg p-2 text-left">
          <p className="text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500 px-1.5 pb-1">Enrolled courses</p>
          <ul className="space-y-1 max-h-48 overflow-y-auto">
            {courses.map((c, i) => (
              <li key={i} className="flex items-center justify-between gap-2 px-1.5 py-1 rounded hover:bg-gray-50 dark:hover:bg-white/5">
                <span className="text-xs text-gray-800 dark:text-gray-200 truncate">{c.course_name}</span>
                <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  c.payment_status === 'completed'
                    ? 'bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400'
                    : 'bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400'
                }`}>
                  {c.payment_status === 'completed' ? 'Paid' : 'Pending'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </span>
  );
};

const getPaymentStatusStyle = (hasPaid: boolean) => {
  return hasPaid
    ? 'bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/30'
    : 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/30';
};

const getActivityStatusStyle = (status: string) => {
  return status === 'active'
    ? 'bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400 border-green-200 dark:border-green-500/30'
    : 'bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30';
};

interface StudentsTableProps {
  filters?: {
    search?: string;
    activity_status?: 'active' | 'inactive';
    payment_status?: 'completed' | 'pending' | 'failed';
    course_id?: string;
  };
  selectedStudents: number[];
  onSelectionChange: (selected: number[]) => void;
  onStudentsLoaded?: (students: Student[]) => void; // ADD THIS
}

const StudentsTable: React.FC<StudentsTableProps> = ({ 
  filters, 
  selectedStudents, 
  onSelectionChange,
  onStudentsLoaded // ADD THIS
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStudents();
  }, [currentPage, perPage, filters]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.admin.students.getAll({
        page: currentPage,
        per_page: perPage,
        ...filters,
      });
      setStudents(response.data);
      setTotalPages(response.meta?.last_page || 1);
      
      // ADD THIS: Pass students data to parent
      if (onStudentsLoaded) {
        onStudentsLoaded(response.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleSelectStudent = (id: number) => {
    onSelectionChange(
      selectedStudents.includes(id) 
        ? selectedStudents.filter(sid => sid !== id) 
        : [...selectedStudents, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(students.map(s => s.id));
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-lg p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0f0f14] border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
      {/* Mobile Card View */}
      <div className="md:hidden">
        {students.map((student) => (
          <div key={student.id} className="border-b border-gray-100 dark:border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => toggleSelectStudent(student.id)}
                  className="rounded border-gray-300 dark:border-white/20 dark:bg-white/5 text-blue-600 focus:ring-blue-500"
                />
                <Link href={`/admin/students/${student.id}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  {student.name}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                  Message
                </button>
                <button
                  onClick={() => toggleExpand(student.id)}
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {expandedId === student.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
            </div>

            {expandedId === student.id && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-500">Email</span>
                  <span className="text-sm text-gray-900 dark:text-white font-medium">{student.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-500">Phone Number</span>
                  <span className="text-sm text-gray-900 dark:text-white font-medium">{student.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-500">Courses Enrolled ({student.courses_count})</span>
                  {student.courses && student.courses.length > 0 ? (
                    <ul className="mt-1.5 space-y-1">
                      {student.courses.map((c, i) => (
                        <li key={i} className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-gray-50 dark:bg-white/5">
                          <span className="text-xs text-gray-800 dark:text-gray-200 truncate">{c.course_name}</span>
                          <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                            c.payment_status === 'completed'
                              ? 'bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400'
                              : 'bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400'
                          }`}>
                            {c.payment_status === 'completed' ? 'Paid' : 'Pending'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">No courses yet</p>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-500">Payment Status</span>
                  <span className={`px-2.5 py-0.5 rounded border text-xs font-medium ${getPaymentStatusStyle(student.has_paid)}`}>
                    {student.has_paid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-500">Activity Status</span>
                  <span className={`px-2.5 py-0.5 rounded border text-xs font-medium ${getActivityStatusStyle(student.activity_status)}`}>
                    {student.activity_status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-500">Enrollment Date</span>
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    {new Date(student.created_at).toLocaleDateString()}
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
            <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
              <th className="py-3 px-4 w-4">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === students.length && students.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 dark:border-white/20 dark:bg-white/5 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Name</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Email</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Phone Number</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Courses</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Enrollment Date</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Payment Status</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider">Activity Status</th>
              <th className="py-3 px-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/10">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => toggleSelectStudent(student.id)}
                    className="rounded border-gray-300 dark:border-white/20 dark:bg-white/5 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <Link href={`/admin/students/${student.id}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    {student.name}
                  </Link>
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">{student.email}</td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{student.phone || 'N/A'}</td>
                <td className="py-3 px-4">
                  <CoursesAtAGlance courses={student.courses} />
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                  {new Date(student.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded border text-xs font-medium ${getPaymentStatusStyle(student.has_paid)}`}>
                    {student.has_paid ? 'Paid' : 'Unpaid'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded border text-xs font-medium ${getActivityStatusStyle(student.activity_status)}`}>
                    {student.activity_status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-white/10 flex items-center justify-between bg-white dark:bg-[#0f0f14]">
        <span className="text-xs text-gray-500 dark:text-gray-500">{selectedStudents.length} of {students.length} row(s) selected.</span>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">Rows per page</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-gray-200 dark:border-white/20 rounded bg-white dark:bg-white/5 text-xs text-gray-900 dark:text-white"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <span className="text-xs font-medium text-gray-900 dark:text-white">Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsTable;