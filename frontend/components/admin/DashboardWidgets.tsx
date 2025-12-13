import React from 'react';
import Link from 'next/link';
import { Trophy, Users, Rocket, Award, LucideIcon } from 'lucide-react';

// =================== NEW ENROLLMENTS ===================
interface NewEnrollmentsData {
  today: number;
  this_week: number;
  recent: Array<{
    student_name: string;
    course_name: string;
    time: string;
  }>;
}

interface NewEnrollmentsProps {
  data: NewEnrollmentsData;
}

export const NewEnrollments: React.FC<NewEnrollmentsProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-900 font-semibold text-sm">New Enrollments</h3>
        <Link href="/admin/students" className="text-xs text-blue-600 font-medium hover:underline">
          View All
        </Link>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{data.today}</div>
          <div className="text-xs text-gray-500 mt-1">Today</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{data.this_week}</div>
          <div className="text-xs text-gray-500 mt-1">This Week</div>
        </div>
      </div>

      {/* Recent Enrollments List */}
      {data.recent.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          No recent enrollments
        </div>
      ) : (
        <div className="space-y-4">
          {data.recent.map((enrollment, index) => (
            <div key={index} className="flex flex-col gap-1">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-blue-600 truncate flex-1">
                  {enrollment.student_name}
                </span>
                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{enrollment.time}</span>
              </div>
              <span className="text-xs text-gray-500">{enrollment.course_name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =================== UPCOMING CONSULTATIONS ===================
interface ConsultationsData {
  total: number;
  upcoming: Array<{
    student_name: string;
    course: string;
    time: string;
  }>;
}

interface UpcomingConsultationsProps {
  data: ConsultationsData;
}

export const UpcomingConsultations: React.FC<UpcomingConsultationsProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-900 font-semibold text-sm">Upcoming Consultations</h3>
        <div className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold">
          {data.total}
        </div>
      </div>
      
      {data.upcoming.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          No upcoming consultations
        </div>
      ) : (
        <div className="space-y-6">
          {data.upcoming.map((consultation, index) => (
            <div key={index} className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate">
                  {consultation.student_name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 truncate">
                  {consultation.course}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-gray-500 mb-1 whitespace-nowrap">
                  {consultation.time}
                </div>
                <a 
                  href="#" 
                  className="text-xs font-medium text-blue-600 hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  Join call
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =================== RECENT MILESTONES ===================
interface Milestone {
  title: string;
  description: string;
  date: string;
  icon: string;
  color: string;
  bg: string;
}

interface RecentMilestonesProps {
  data: Milestone[];
}

export const RecentMilestones: React.FC<RecentMilestonesProps> = ({ data }) => {
  // Map icon names to actual icon components
  const iconMap: Record<string, LucideIcon> = {
    Trophy,
    Users,
    Rocket,
    Award,
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-900 font-semibold text-sm">Recent Milestones</h3>
        <Link href="/admin/students" className="text-xs text-blue-600 font-medium hover:underline">
          View All
        </Link>
      </div>
      
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          No recent milestones
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((milestone, index) => {
            const IconComponent = iconMap[milestone.icon] || Trophy;
            
            return (
              <div key={index} className="flex gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${milestone.bg} flex items-center justify-center ${milestone.color}`}>
                  <IconComponent size={14} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-600 leading-relaxed">
                    <span className="font-medium text-gray-900">{milestone.title}:</span> {milestone.description}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{milestone.date}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};