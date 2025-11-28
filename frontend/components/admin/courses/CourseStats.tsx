import React from 'react';
import { BookOpen, TrendingUp, Users, BarChart2 } from 'lucide-react';

const CourseStats = () => {
  const stats = [
    {
      label: 'Total Courses',
      value: '6',
      icon: BookOpen,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      label: 'Active Courses',
      value: '5',
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      label: 'Total Students',
      value: '190',
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
    {
      label: 'Avg. Completion',
      value: '63%',
      icon: TrendingUp,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <h3 className="text-2xl font-semibold text-gray-900">{stat.value}</h3>
          </div>
          <div className={`p-3 rounded-lg ${stat.bgColor} ${stat.textColor}`}>
            <stat.icon size={24} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseStats;
