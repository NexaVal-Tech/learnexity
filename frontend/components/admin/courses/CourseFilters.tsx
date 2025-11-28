import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

const CourseFilters = () => {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Filter Courses</h2>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search courses by name.."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative min-w-[160px]">
            <button className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
              All Status
              <ChevronDown size={16} className="text-gray-500" />
            </button>
          </div>
          <div className="relative min-w-[160px]">
            <button className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100">
              All Enrollments
              <ChevronDown size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseFilters;
