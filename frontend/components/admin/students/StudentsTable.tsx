import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MoreVertical, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string;
  courses_count: number;
  activity_status: 'active' | 'inactive';
  has_paid: boolean;
  created_at: string;
}

const getPaymentStatusStyle = (hasPaid: boolean) => {
  return hasPaid
    ? 'bg-green-50 text-green-600 border-green-100'
    : 'bg-red-50 text-red-600 border-red-100';
};

const getActivityStatusStyle = (status: string) => {
  return status === 'active' 
    ? 'bg-green-50 text-green-600 border-green-200' 
    : 'bg-orange-50 text-orange-600 border-orange-200';
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
      <div className="bg-white border border-gray-200 rounded-lg p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Mobile Card View */}
      <div className="md:hidden">
        {students.map((student) => (
          <div key={student.id} className="border-b border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => toggleSelectStudent(student.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                />
                <Link href={`/admin/students/${student.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                  {student.name}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
                  Message
                </button>
                <button 
                  onClick={() => toggleExpand(student.id)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  {expandedId === student.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
            </div>
            
            {expandedId === student.id && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="text-sm text-gray-900 font-medium">{student.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Phone Number</span>
                  <span className="text-sm text-gray-900 font-medium">{student.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Courses Enrolled</span>
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                    {student.courses_count}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Payment Status</span>
                  <span className={`px-2.5 py-0.5 rounded border text-xs font-medium ${getPaymentStatusStyle(student.has_paid)}`}>
                    {student.has_paid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Activity Status</span>
                  <span className={`px-2.5 py-0.5 rounded border text-xs font-medium ${getActivityStatusStyle(student.activity_status)}`}>
                    {student.activity_status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Enrollment Date</span>
                  <span className="text-sm text-gray-900 font-medium">
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
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 w-4">
                <input 
                  type="checkbox" 
                  checked={selectedStudents.length === students.length && students.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                />
              </th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment Date</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Activity Status</th>
              <th className="py-3 px-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <input 
                    type="checkbox" 
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => toggleSelectStudent(student.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                  />
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <Link href={`/admin/students/${student.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                    {student.name}
                  </Link>
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 whitespace-nowrap">{student.email}</td>
                <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{student.phone || 'N/A'}</td>
                <td className="py-3 px-4">
                  <span className="px-1.5 py-0.5 rounded bg-gray-100 text-xs font-medium text-gray-600">
                    {student.courses_count}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
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
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-white">
        <span className="text-xs text-gray-500">{selectedStudents.length} of {students.length} row(s) selected.</span>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Rows per page</span>
            <select 
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-gray-200 rounded bg-white text-xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <span className="text-xs font-medium text-gray-900">Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <ChevronsLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <ChevronRight size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1 text-gray-400 hover:text-gray-600"
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