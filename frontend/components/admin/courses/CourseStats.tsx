import React, { useEffect, useState } from 'react';
import { BookOpen, TrendingUp, Users, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const CourseStats = () => {
  const [stats, setStats] = useState({
    total_courses: 0,
    active_courses: 0,
    total_enrollments: 0,
    average_completion_rate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.admin.courses.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Error fetching course statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      label: 'Total Courses',
      value: stats.total_courses,
      icon: BookOpen,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      label: 'Active Courses',
      value: stats.active_courses,
      icon: TrendingUp,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      label: 'Total Enrollments',
      value: stats.total_enrollments,
      icon: Users,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
    {
      label: 'Avg. Completion',
      value: `${stats.average_completion_rate}%`,
      icon: TrendingUp,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 flex items-center justify-center h-24">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((stat, index) => (
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