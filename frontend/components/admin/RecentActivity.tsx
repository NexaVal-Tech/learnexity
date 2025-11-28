import React from 'react';
import { GraduationCap, Users, Medal, BookOpen } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'certificate',
    message: 'Certificate issued to Emma Johnson for Advanced Web Development',
    time: '2 hours ago',
    icon: GraduationCap,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    id: 2,
    type: 'enrollment',
    message: '45 new students enrolled in Data Science Fundamentals',
    time: '5 hours ago',
    icon: Users,
    color: 'text-green-600',
    bg: 'bg-green-50'
  },
  {
    id: 3,
    type: 'achievement',
    message: 'Achievement badge awarded to 23 students',
    time: '1 day ago',
    icon: Medal,
    color: 'text-purple-600',
    bg: 'bg-purple-50'
  },
  {
    id: 4,
    type: 'course',
    message: "New course 'Cloud Computing Basics' published",
    time: '2 days ago',
    icon: BookOpen,
    color: 'text-orange-600',
    bg: 'bg-orange-50'
  }
];

const RecentActivity = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${activity.bg} flex items-center justify-center`}>
              <activity.icon size={20} className={activity.color} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm text-gray-800 font-medium leading-snug">{activity.message}</p>
              <span className="text-xs text-gray-400 mt-1 block">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
