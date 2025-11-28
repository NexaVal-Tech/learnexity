import React from 'react';
import { Trophy } from 'lucide-react';

export const NewEnrollments = () => {
  const students = [
    { name: 'Ezinne Nwosu', time: '152 days' },
    { name: 'Halima Tukur', time: '178 days' },
    { name: 'Somtochukwu Okafor', time: '179 days' },
    { name: 'Ngozi Obi', time: '200 days' },
    { name: 'Umar Gambo', time: '204 days' },
    { name: 'Umar Gambo', time: '234 days' },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-900 font-semibold text-sm">New Enrollments (Last 7 days)</h3>
        <button className="text-xs text-blue-600 font-medium hover:underline">View All</button>
      </div>
      <div className="space-y-4">
        {students.map((student, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-600">{student.name}</span>
            <span className="text-xs text-gray-400">{student.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const UpcomingConsultations = () => {
  const consultations = [
    { name: 'Ezinne Nwosu', role: 'Web Development', date: 'Today at 2:00PM', link: 'Join call' },
    { name: 'Lisa Wang', role: 'Product Design', date: 'Nov 12, 2025 at 2:00PM', link: 'Join call' },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-900 font-semibold text-sm">Upcoming Consultations</h3>
        <button className="text-xs text-blue-600 font-medium hover:underline">View All</button>
      </div>
      <div className="space-y-6">
        {consultations.map((item, index) => (
          <div key={index} className="flex justify-between items-start">
            <div>
              <div className="text-sm font-bold text-gray-900">{item.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{item.role}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">{item.date}</div>
              <a href="#" className="text-xs font-medium text-blue-600 hover:underline">{item.link}</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const RecentMilestones = () => {
  const milestones = [
    { user: 'Emma Davis', action: 'completed "Javascript"', icon: Trophy },
    { user: 'Lisa Wang', action: 'reached Top 10 on Leaderboard', icon: Trophy },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-900 font-semibold text-sm">New Enrollments (Last 7 days)</h3>
        <button className="text-xs text-blue-600 font-medium hover:underline">View All</button>
      </div>
      <div className="space-y-4">
        {milestones.map((item, index) => (
          <div key={index} className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <item.icon size={14} />
            </div>
            <div className="text-xs text-gray-600 leading-relaxed">
              <span className="font-medium text-gray-900">Milestone Achieved:</span> {item.user} {item.action}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
