import React from 'react';
import Link from 'next/link';
import { MoreVertical, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState } from 'react';

const students = [
  {
    id: 1,
    name: 'Liam Johnson',
    email: 'liamjohnson@email.com',
    phone: '+1 (303) 555-0123',
    location: 'Canada',
    course: 'Data Science',
    courseCount: 3,
    enrollmentDate: '11/15/2024',
    paymentStatus: 'Pending',
    progress: 75,
    activityStatus: 'Active',
    secondaryProgress: 10,
  },
  {
    id: 2,
    name: 'Mia Wang',
    email: 'miawang@email.com',
    phone: '+1 (404) 555-0145',
    location: 'USA',
    course: 'UI/UX Design',
    courseCount: 2,
    enrollmentDate: '08/20/2023',
    paymentStatus: 'Paid',
    progress: 15,
    activityStatus: 'Inactive',
    secondaryProgress: 0,
  },
  {
    id: 3,
    name: 'Raj Patel',
    email: 'rajpatel@email.com',
    phone: '+91 98765 43210',
    location: 'India',
    course: 'Mobile Development',
    courseCount: 1,
    enrollmentDate: '12/01/2023',
    paymentStatus: 'Unpaid',
    progress: 90,
    activityStatus: 'Active',
    secondaryProgress: 20,
  },
  {
    id: 4,
    name: 'Clara Lopez',
    email: 'claralopez@email.com',
    phone: '+34 612 345 678',
    location: 'Spain',
    course: 'DevOps Engineer',
    courseCount: 3,
    enrollmentDate: '03/30/2024',
    paymentStatus: 'Paid',
    progress: 5,
    activityStatus: 'Active',
    secondaryProgress: 15,
  },
  {
    id: 5,
    name: 'Omar Khan',
    email: 'omarkhan@email.com',
    phone: '+44 20 7946 0958',
    location: 'UK',
    course: 'Product Management',
    courseCount: 2,
    enrollmentDate: '09/05/2025',
    paymentStatus: 'Paid',
    progress: 45,
    activityStatus: 'Inactive',
    secondaryProgress: 0,
  },
  {
    id: 6,
    name: 'Sofia Garcia',
    email: 'sofia@email.com',
    phone: '+52 55 1234 5678',
    location: 'Mexico',
    course: 'Graphic Design',
    courseCount: 1,
    enrollmentDate: '01/15/2023',
    paymentStatus: 'Paid',
    progress: 60,
    activityStatus: 'Active',
    secondaryProgress: 12,
  },
  {
    id: 7,
    name: 'Ethan Brown',
    email: 'ethanbrown@email.com',
    phone: '+61 2 9876 5432',
    location: 'Australia',
    course: 'Product Management',
    courseCount: 3,
    enrollmentDate: '07/22/2024',
    paymentStatus: 'Paid',
    progress: 10,
    activityStatus: 'Active',
    secondaryProgress: 18,
  },
  {
    id: 8,
    name: 'Amina El-Amin',
    email: 'amina@email.com',
    phone: '+27 21 123 4567',
    location: 'South Africa',
    course: 'Cybersecurity',
    courseCount: 2,
    enrollmentDate: '05/19/2025',
    paymentStatus: 'Paid',
    progress: 80,
    activityStatus: 'Inactive',
    secondaryProgress: 5,
  },
  {
    id: 9,
    name: 'Noah Smith',
    email: 'noahsmith@email.com',
    phone: '+1 (415) 555-0167',
    location: 'USA',
    course: 'DevOps',
    courseCount: 1,
    enrollmentDate: '04/10/2024',
    paymentStatus: 'Paid',
    progress: 80,
    activityStatus: 'Active',
    secondaryProgress: 25,
  },
  {
    id: 10,
    name: 'Amara Ndlovu',
    email: 'amara@email.com',
    phone: '+256 759 123 456',
    location: 'Uganda',
    course: 'AI',
    courseCount: 3,
    enrollmentDate: '06/30/2023',
    paymentStatus: 'Paid',
    progress: 5,
    activityStatus: 'Active',
    secondaryProgress: 5,
  },
];

const getPaymentStatusStyle = (status: string) => {
  switch (status) {
    case 'Paid': return 'bg-green-50 text-green-600 border-green-100';
    case 'Pending': return 'bg-orange-50 text-orange-600 border-orange-100';
    case 'Unpaid': return 'bg-red-50 text-red-600 border-red-100';
    default: return 'bg-gray-50 text-gray-600 border-gray-100';
  }
};

const getActivityStatusStyle = (status: string) => {
  return status === 'Active' 
    ? 'bg-green-50 text-green-600 border-green-200' 
    : 'bg-orange-50 text-orange-600 border-orange-200';
};

const StudentsTable = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Mobile Card View */}
      <div className="md:hidden">
        {students.map((student) => (
          <div key={student.id} className="border-b border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
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
                  <span className="text-sm text-gray-900 font-medium">{student.phone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Location</span>
                  <span className="text-sm text-gray-900 font-medium">{student.location}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Courses</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900 font-medium">{student.course}</span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                      {student.courseCount}
                    </span>
                    <MoreVertical size={16} className="text-gray-400" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Payment Status</span>
                  <span className={`px-2.5 py-0.5 rounded border text-xs font-medium ${getPaymentStatusStyle(student.paymentStatus)}`}>
                    {student.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Progress</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#10B981] rounded-full" 
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{student.progress}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Activity Status</span>
                  <span className={`px-2.5 py-0.5 rounded border text-xs font-medium ${getActivityStatusStyle(student.activityStatus)}`}>
                    {student.activityStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Enrolment Date</span>
                  <span className="text-sm text-gray-900 font-medium">{student.enrollmentDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Progress</span>
                  <span className="text-sm text-gray-900 font-medium">{student.secondaryProgress}%</span>
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
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Course(s)</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment Date</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Activity Status</th>
              <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th className="py-3 px-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <Link href={`/admin/students/${student.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                    {student.name}
                  </Link>
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 whitespace-nowrap">{student.email}</td>
                <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{student.phone}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{student.location}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900">{student.course}</span>
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-xs font-medium text-gray-600">
                      {student.courseCount}
                    </span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{student.enrollmentDate}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded border text-xs font-medium ${getPaymentStatusStyle(student.paymentStatus)}`}>
                    {student.paymentStatus}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3 w-32">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#10B981] rounded-full" 
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{student.progress}%</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded border text-xs font-medium ${getActivityStatusStyle(student.activityStatus)}`}>
                    {student.activityStatus}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{student.secondaryProgress}%</td>
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
        <span className="text-xs text-gray-500">0 of 68 row(s) selected.</span>
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Rows per page</span>
                <div className="flex items-center gap-1 px-2 py-1 border border-gray-200 rounded bg-white">
                    <span className="text-xs text-gray-900">10</span>
                    <ChevronDown size={12} className="text-gray-500" />
                </div>
            </div>
            <span className="text-xs font-medium text-gray-900">Page 1 of 7</span>
            <div className="flex items-center gap-1">
                <button className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50">
                    <ChevronsLeft size={16} />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50">
                    <ChevronLeft size={16} />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                    <ChevronRight size={16} />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsTable;
