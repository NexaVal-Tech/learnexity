import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, MessageSquare, Download, Filter, ExternalLink } from 'lucide-react';
import ComposeMessageModal from './ComposeMessageModal';
import { api } from '@/lib/api';

interface StudentFiltersProps {
  onFilterChange: (filters: {
    search?: string;
    activity_status?: 'active' | 'inactive';
    payment_status?: 'completed' | 'pending' | 'failed' | 'unpaid';
    course_id?: string;
    country?: string;
    enrollment_period?: '1_month' | '3_months' | '6_months' | '12_plus_months';
    course_progress?: 'active' | 'completed' | 'inactive';
    multi_course?: boolean;
  }) => void;
  selectedCount: number;
  onMessageClick: () => void;
}

const MONTHS_ENROLLED_MAP: Record<string, '1_month' | '3_months' | '6_months' | '12_plus_months'> = {
  '1 month': '1_month',
  '3 months': '3_months',
  '6 months': '6_months',
  '12+ months': '12_plus_months',
};

// "Enrolment Status" now reflects real course-progress data (via
// UserCourseStatistic) instead of the previous unwired labels.
const COURSE_PROGRESS_MAP: Record<string, 'active' | 'completed' | 'inactive'> = {
  'In Progress': 'active',
  Completed: 'completed',
  'Not Started': 'inactive',
};

const PAYMENT_STATUS_MAP: Record<string, 'completed' | 'pending' | 'failed' | 'unpaid'> = {
  Paid: 'completed',
  // "Unpaid" means the student has never completed a payment on any
  // course — distinct from "Pending", which means a payment is currently
  // awaiting completion.
  Unpaid: 'unpaid',
  Pending: 'pending',
};

const StudentFilters: React.FC<StudentFiltersProps> = ({ onFilterChange,  selectedCount,  onMessageClick }) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<{ course_id: string; title: string }[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<{
    courseEnrolled?: string;
    monthsEnrolled?: string;
    country?: string;
    paymentStatus?: string;
    activityStatus?: string;
    enrolmentStatus?: string;
    multipleCourse?: string;
  }>({});

  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    api.admin.students
      .getFilterOptions()
      .then((res) => {
        if (cancelled) return;
        setCourses(res.courses || []);
        setCountries(res.countries || []);
      })
      .catch(() => {
        // Filter dropdowns just stay empty for those two filters if this
        // fails — the rest of the filters don't depend on it.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filters: { [key: string]: string[] } = {
    'Course Enrolled': courses.map((c) => c.title),
    'Months Enrolled': ['1 month', '3 months', '6 months', '12+ months'],
    Country: countries,
    'Payment Status': ['Paid', 'Unpaid', 'Pending'],
    'Activity Status': ['Active', 'Inactive'],
    'Enrolment Status': ['In Progress', 'Completed', 'Not Started'],
    'Multiple Course': ['2 or more courses'],
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

  const handleFilterSelect = (filterType: string, option: string) => {
    const filterKey = filterType.replace(/\s+/g, '').replace(/^./, str => str.toLowerCase());

    setSelectedFilters(prev => ({
      ...prev,
      [filterKey]: option
    }));

    setActiveFilter(null);
  };

  const applyFilters = (overrides?: typeof selectedFilters, overrideSearch?: string) => {
    const active = overrides ?? selectedFilters;
    const search = overrideSearch ?? searchTerm;
    const filters: any = {};

    if (search) {
      filters.search = search;
    }

    if (active.activityStatus) {
      filters.activity_status = active.activityStatus.toLowerCase();
    }

    if (active.paymentStatus) {
      filters.payment_status = PAYMENT_STATUS_MAP[active.paymentStatus] || active.paymentStatus.toLowerCase();
    }

    if (active.courseEnrolled) {
      const match = courses.find((c) => c.title === active.courseEnrolled);
      if (match) {
        filters.course_id = match.course_id;
      }
    }

    if (active.country) {
      filters.country = active.country;
    }

    if (active.monthsEnrolled) {
      const mapped = MONTHS_ENROLLED_MAP[active.monthsEnrolled];
      if (mapped) {
        filters.enrollment_period = mapped;
      }
    }

    if (active.enrolmentStatus) {
      const mapped = COURSE_PROGRESS_MAP[active.enrolmentStatus];
      if (mapped) {
        filters.course_progress = mapped;
      }
    }

    if (active.multipleCourse) {
      filters.multi_course = true;
    }

    onFilterChange(filters);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFilters({});
    onFilterChange({});
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      applyFilters();
    }, 500);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <div className="space-y-4 mb-6">
      {/* Mobile Header & Search */}
      <div className="flex gap-2 md:hidden">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search for a student"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-white/20 text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-sm font-medium text-gray-700 dark:text-gray-300 md:hidden">
          <Filter size={16} />
          Filters
        </button>
        <button className="p-2 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300">
          <ExternalLink size={20} />
        </button>
      </div>

      {/* Desktop Search Bar */}
      <div className="hidden md:block">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search for a student"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-white/20 text-sm"
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
                  ? 'bg-gray-50 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white'
                  : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10'
              }`}
            >
              {filter}
              {selectedFilters[filter.replace(/\s+/g, '').replace(/^./, str => str.toLowerCase()) as keyof typeof selectedFilters] && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded text-xs">1</span>
              )}
              <ChevronDown size={14} className={`text-gray-400 dark:text-gray-500 transition-transform ${activeFilter === filter ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {activeFilter === filter && filters[filter].length > 0 && (
              <div className="fixed md:absolute top-auto left-4 right-4 md:left-0 md:right-auto mt-2 w-auto md:w-48 max-h-64 overflow-y-auto bg-white dark:bg-[#14141c] rounded-lg shadow-xl border border-gray-300 dark:border-white/10 md:border-gray-200 dark:md:border-white/10 py-2 z-50 md:z-10 px-4 md:px-0">
                {filters[filter].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleFilterSelect(filter, option)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <button
          onClick={() => applyFilters()}
          className="hidden md:block px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 ml-auto"
        >
          Apply filters
        </button>
        <button
          onClick={clearFilters}
          className="hidden md:block px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-white/5"
        >
          Clear
        </button>
      </div>

      {/* Selection Bar (Desktop) */}
      <div className="hidden md:flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 dark:border-white/20 dark:bg-white/5 text-gray-900 focus:ring-gray-900" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Select all <span className="font-medium text-gray-900 dark:text-white">{selectedCount} students selected</span></span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onMessageClick}
            disabled={selectedCount === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageSquare size={16} />
            Message Selected ({selectedCount})
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* <ComposeMessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        recipientCount={0}
        recipients={[]}
      /> */}
    </div>
  );
};

export default StudentFilters;
