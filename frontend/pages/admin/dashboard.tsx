import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import StatsCard from '@/components/admin/StatsCard';
import EnrollmentChart from '@/components/admin/charts/EnrollmentChart';
import DistributionChart from '@/components/admin/charts/DistributionChart';
import PerformanceChart from '@/components/admin/charts/PerformanceChart';
import RecentActivity from '@/components/admin/RecentActivity';
import TopCourses from '@/components/admin/TopCourses';
import { NewEnrollments, UpcomingConsultations, RecentMilestones } from '@/components/admin/DashboardWidgets';
import { api, DashboardData } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminRouteGuard>
        <AdminLayout>
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </AdminLayout>
      </AdminRouteGuard>
    );
  }

  if (error || !dashboardData) {
    return (
      <AdminRouteGuard>
        <AdminLayout>
          <div className="flex flex-col items-center justify-center h-96">
            <p className="text-red-500 mb-4">{error || 'Failed to load dashboard'}</p>
            <button 
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Retry
            </button>
          </div>
        </AdminLayout>
      </AdminRouteGuard>
    );
  }

  const { stats } = dashboardData;

  return (
    <AdminRouteGuard>
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
              value={stats.total_students.value} 
              trend={stats.total_students.trend} 
              percentage={stats.total_students.percentage} 
              trendLabel={stats.total_students.label}
              description="Total enrolled students"
            />
            <StatsCard 
              title="Active Courses" 
              value={stats.active_courses.value} 
              trend={stats.active_courses.trend} 
              percentage={stats.active_courses.percentage} 
              trendLabel={stats.active_courses.label}
              description="Courses with active students"
            />
            <StatsCard 
              title="Pending Consultations" 
              value={stats.pending_consultations.value} 
              trend={stats.pending_consultations.trend} 
              percentage={stats.pending_consultations.percentage} 
              trendLabel={stats.pending_consultations.label}
              description="Scheduled consultations"
            />
            <StatsCard 
              title="Course Completion Rate" 
              value={stats.completion_rate.value} 
              trend={stats.completion_rate.trend} 
              percentage={stats.completion_rate.percentage} 
              trendLabel={stats.completion_rate.label}
              description="Average completion rate"
            />
            <StatsCard 
              title="Paid Users" 
              value={stats.paid_users.value} 
              trend={stats.paid_users.trend} 
              percentage={stats.paid_users.percentage} 
              trendLabel={stats.paid_users.label}
              description="Students with completed payments"
            />
            <StatsCard 
              title="Unpaid Users" 
              value={stats.unpaid_users.value} 
              trend={stats.unpaid_users.trend} 
              percentage={stats.unpaid_users.percentage} 
              trendLabel={stats.unpaid_users.label}
              description="Students pending payment"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-full">
              <EnrollmentChart data={dashboardData.enrollment_chart} />
            </div>
            <div className="lg:col-span-1 h-full">
              <DistributionChart data={dashboardData.distribution_chart} />
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-full">
              <PerformanceChart data={dashboardData.performance_chart} />
            </div>
            <div className="lg:col-span-1 h-full">
              <RecentActivity activities={dashboardData.recent_activity} />
            </div>
          </div>

          {/* Top Courses */}
          <div className="w-full">
            <TopCourses courses={dashboardData.top_courses} />
          </div>

          {/* Bottom Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NewEnrollments data={dashboardData.new_enrollments} />
            <UpcomingConsultations data={dashboardData.upcoming_consultations} />
            <RecentMilestones data={dashboardData.recent_milestones} />
          </div>
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}

export default Dashboard;