import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import StatsCard from '@/components/admin/StatsCard';
import EnrollmentChart from '@/components/admin/charts/EnrollmentChart';
import DistributionChart from '@/components/admin/charts/DistributionChart';
import PerformanceChart from '@/components/admin/charts/PerformanceChart';
import RecentActivity from '@/components/admin/RecentActivity';
import TopCourses from '@/components/admin/TopCourses';
import { NewEnrollments, UpcomingConsultations, RecentMilestones } from '@/components/admin/DashboardWidgets';

function Dashboard() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Students Enrolled" 
            value="$1,250.00" 
            trend="up" 
            percentage="+12.5%" 
            trendLabel="Trending up this month"
            description="Visitors for the last 6 months"
          />
          <StatsCard 
            title="Active Courses" 
            value="1,234" 
            trend="down" 
            percentage="-20%" 
            trendLabel="Down 20% this period"
            description="Acquisition needs attention"
          />
          <StatsCard 
            title="Pending Consultations" 
            value="45,678" 
            trend="up" 
            percentage="+12.5%" 
            trendLabel="Strong user retention"
            description="Engagement exceed targets"
          />
          <StatsCard 
            title="Course Completion Rate" 
            value="4.5%" 
            trend="up" 
            percentage="+4.5%" 
            trendLabel="Steady performance increase"
            description="Meets growth projections"
          />
           <StatsCard 
            title="Paid Users" 
            value="$1,250.00" 
            trend="up" 
            percentage="+12.5%" 
            trendLabel="Trending up this month"
            description="Visitors for the last 6 months"
          />
          <StatsCard 
            title="Unpaid Users" 
            value="1,234" 
            trend="down" 
            percentage="-20%" 
            trendLabel="Down 20% this period"
            description="Acquisition needs attention"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-full">
            <EnrollmentChart />
          </div>
          <div className="lg:col-span-1 h-full">
            <DistributionChart />
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-full">
            <PerformanceChart />
          </div>
          <div className="lg:col-span-1 h-full">
            <RecentActivity />
          </div>
        </div>

        {/* Top Courses */}
        <div className="w-full">
          <TopCourses />
        </div>

        {/* Bottom Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NewEnrollments />
          <UpcomingConsultations />
          <RecentMilestones />
        </div>
      </div>
    </AdminLayout>
  );
}

export default Dashboard;