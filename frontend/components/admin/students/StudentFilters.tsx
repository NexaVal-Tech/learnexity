import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, MessageSquare, Download, Filter, ExternalLink } from 'lucide-react';
import ComposeMessageModal from './ComposeMessageModal';

const StudentFilters = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const filters: { [key: string]: string[] } = {
    'Course Enrolled': [
      'Product Management',
      'UI/UX Design',
      'Web3 Development',
      'Data Science',
      'Digital Marketing'
    ],
    // Placeholders for other filters to be implemented later
    'Months Enrolled': [
      '1 month',
      '3 months',
      '6 months',
      '12+ months'
    ],
    'Country': [
      'United States',
      'United Kingdom',
      'Nigeria',
      'Kenya',
      'Ghana',
      'South Africa'
    ],
    'Payment Status': [
      'Paid',
      'Unpaid'
    ],
    'Activity Status': [
      'Active',
      'Inactive'
    ],
    'Enrolment Status': [
      'Active',
      'Completed',
      'Inactive'
    ],
    'Multiple Course': [
      'AI',
      'Cybersecurity'
    ]
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setActiveFilter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleFilter = (filterName: string) => {
    setActiveFilter(activeFilter === filterName ? null : filterName);
  };
  return (
    <div className="space-y-4 mb-6">
      {/* Mobile Header & Search */}
      <div className="flex gap-2 md:hidden">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search for a student"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 md:hidden">
          <Filter size={16} />
          Filters
        </button>
        <button className="p-2 border border-gray-200 rounded-lg bg-white text-gray-700">
          <ExternalLink size={20} />
        </button>
      </div>

      {/* Desktop Search Bar */}
      <div className="hidden md:block">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for a student"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
          />
        </div>
      </div>

      {/* Filters Row (Scrollable on Mobile, Wrap on Desktop) */}
      <div className="flex overflow-x-auto md:overflow-visible md:flex-wrap items-center gap-3 pb-2 md:pb-0 scrollbar-hide" ref={filterRef}>
        {Object.keys(filters).map((filter) => (
          <div key={filter} className="relative flex-shrink-0">
            <button 
              onClick={() => toggleFilter(filter)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeFilter === filter 
                  ? 'bg-gray-50 border-gray-300 text-gray-900' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {filter}
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${activeFilter === filter ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {activeFilter === filter && filters[filter].length > 0 && (
              <div className="fixed md:absolute top-auto left-4 right-4 md:left-0 md:right-auto mt-2 w-auto md:w-48 bg-white rounded-lg shadow-xl border border-gray-300 md:border-gray-200 py-2 z-50 md:z-10 px-4 md:px-0">
                {filters[filter].map((option) => (
                  <button
                    key={option}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <button className="hidden md:block px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 ml-auto">
          Apply filters
        </button>
        <button className="hidden md:block px-4 py-2 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50">
          Clear
        </button>
      </div>

      {/* Selection Bar (Desktop) */}
      <div className="hidden md:flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
          <span className="text-sm text-gray-600">Select all <span className="font-medium text-gray-900">5 students selected</span></span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMessageModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <MessageSquare size={16} />
            Message Selected (5)
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <ComposeMessageModal 
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        recipientCount={3}
        recipients={['Alice Johnson', 'Carol White', 'Henry Taylor']}
      />
    </div>
  );
};

export default StudentFilters;
