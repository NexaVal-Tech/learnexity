import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface CourseFiltersProps {
  onFilterChange: (filters: { search?: string; status?: 'active' | 'inactive' }) => void;
}

const CourseFilters: React.FC<CourseFiltersProps> = ({ onFilterChange }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | ''>('');

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange({ search: value, status: status as any });
  };

  const handleStatusChange = (value: 'active' | 'inactive' | '') => {
    setStatus(value);
    onFilterChange({ search, status: value as any });
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    onFilterChange({});
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search courses by name or ID..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
          />
        </div>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as any)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm bg-white"
        >
          <option value="">All Courses</option>
          <option value="active">Active Courses</option>
          <option value="inactive">Inactive Courses</option>
        </select>

        {(search || status) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseFilters;