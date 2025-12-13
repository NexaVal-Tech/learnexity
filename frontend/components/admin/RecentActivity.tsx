import React from 'react';
import { GraduationCap, Users, Medal, BookOpen, DollarSign, LucideIcon } from 'lucide-react';

interface Activity {
  type: string;
  title: string;
  time: string;
  icon: string;
  color: string;
  bg: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  // Map icon names to actual icon components
  const iconMap: Record<string, LucideIcon> = {
    GraduationCap,
    Users,
    Medal,
    BookOpen,
    DollarSign,
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          No recent activity
        </div>
      ) : (
        <div className="space-y-6">
          {activities.map((activity, index) => {
            const IconComponent = iconMap[activity.icon] || BookOpen;
            
            return (
              <div key={index} className="flex gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${activity.bg} flex items-center justify-center`}>
                  <IconComponent size={20} className={activity.color} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium leading-snug">{activity.title}</p>
                  <span className="text-xs text-gray-400 mt-1 block">{activity.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;