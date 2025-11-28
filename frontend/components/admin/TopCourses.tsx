import React from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';

const courses = [
  {
    id: 1,
    rank: 1,
    title: 'UI/UX Design Principles',
    instructor: 'Lisa Anderson',
    students: 67,
    rating: 4.9,
    completion: 88,
    isOpen: true
  },
  {
    id: 2,
    rank: 2,
    title: 'Digital Marketing Mastery',
    instructor: 'Emily Thompson',
    students: 59,
    rating: 4.5,
    completion: 52,
    isOpen: false
  },
  {
    id: 3,
    rank: 3,
    title: 'Advanced Web Development',
    instructor: 'Dr. Sarah Chen',
    students: 156,
    rating: 4.7,
    completion: 78,
    isOpen: false
  }
];

const TopCourses = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Top Performing Courses</h3>
        <button className="text-sm text-gray-500 hover:text-gray-900 font-medium border border-gray-200 px-3 py-1 rounded-lg">View All</button>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500">
                {course.rank}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 truncate">{course.title}</h4>
                <p className="text-xs text-gray-500 truncate">{course.instructor}</p>
              </div>

              {/* Desktop Stats */}
              <div className="hidden md:flex items-center gap-8">
                <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Students</div>
                    <div className="text-sm font-semibold text-gray-900">{course.students}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Rating</div>
                    <div className="flex items-center text-sm font-semibold text-gray-900">
                        <Star size={12} className="text-yellow-400 fill-yellow-400 mr-1" />
                        {course.rating}
                    </div>
                </div>
                <div className="w-32">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Completion</span>
                        <span className="font-semibold text-gray-900">{course.completion}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gray-900 rounded-full" 
                            style={{ width: `${course.completion}%` }}
                        ></div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopCourses;
