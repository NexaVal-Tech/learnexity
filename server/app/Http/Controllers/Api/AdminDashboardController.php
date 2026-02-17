<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Models\User;
use App\Models\Course;
use App\Models\CourseEnrollment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminDashboardController extends Controller
{
    /**
     * Get dashboard overview data
     */
    public function index(): JsonResponse
    {
        Log::info('📊 DASHBOARD REQUEST START');
        
        try {
            // ✅ SET THE ADMIN GUARD
            auth()->shouldUse('admin');
            
            // ✅ CHECK IF ADMIN IS AUTHENTICATED
            $admin = auth()->user();
            
            if (!$admin) {
                Log::error('🚫 DASHBOARD - No admin authenticated');
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            Log::info('✅ DASHBOARD - Admin authenticated', [
                'admin_id' => $admin->id,
                'email' => $admin->email
            ]);

            // Return dashboard data
            return response()->json([
                'stats' => $this->getStats(),
                'enrollment_chart' => $this->getEnrollmentChartData(),
                'distribution_chart' => $this->getDistributionChartData(),
                'performance_chart' => $this->getPerformanceChartData(),
                'recent_activity' => $this->getRecentActivity(),
                'top_courses' => $this->getTopCourses(),
                'new_enrollments' => $this->getNewEnrollments(),
                'upcoming_consultations' => $this->getUpcomingConsultations(),
                'recent_milestones' => $this->getRecentMilestones(),
            ]);
            
        } catch (\Exception $e) {
            Log::error('❌ DASHBOARD ERROR', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get statistics cards data
     */

    private function getStats(): array
    {
        $totalStudents = User::count();

        $lastMonthStudents = User::whereBetween('created_at', [
            now()->subMonth(),
            now()
        ])->count();

        $twoMonthsAgoStudents = User::whereBetween('created_at', [
            now()->subMonths(2),
            now()->subMonth()
        ])->count();

        $studentTrend = $twoMonthsAgoStudents > 0
            ? round((($lastMonthStudents - $twoMonthsAgoStudents) / $twoMonthsAgoStudents) * 100, 1)
            : 0;

        $activeCourses = Course::whereHas('enrollments', function ($q) {
            $q->where('payment_status', 'completed');
        })->count();

        $completedEnrollments = CourseEnrollment::where('payment_status', 'completed')->count();
        $totalEnrollments = CourseEnrollment::count();

        $completionRate = $totalEnrollments > 0
            ? round(($completedEnrollments / $totalEnrollments) * 100, 1)
            : 0;

        $paidUsers = User::whereHas('enrollments', function ($q) {
            $q->where('payment_status', 'completed');
        })->count();

        $unpaidUsers = $totalStudents - $paidUsers;

        return [
            'total_students' => [
                'value' => number_format($totalStudents),
                'trend' => $studentTrend >= 0 ? 'up' : 'down',
                'percentage' => abs($studentTrend) . '%',
                'label' => $studentTrend >= 0 ? 'Trending up this month' : 'Down this month',
            ],
            'active_courses' => [
                'value' => number_format($activeCourses),
                'trend' => 'up',
                'percentage' => '+5%',
                'label' => 'New courses added',
            ],
            'pending_consultations' => [
                'value' => 12,
                'trend' => 'up',
                'percentage' => '+8%',
                'label' => 'Scheduled this week',
            ],
            'completion_rate' => [
                'value' => $completionRate . '%',
                'trend' => 'up',
                'percentage' => '+2.3%',
                'label' => 'Improved completion',
            ],
            'paid_users' => [
                'value' => number_format($paidUsers),
                'trend' => 'up',
                'percentage' => '+15%',
                'label' => 'Revenue growth',
            ],
            'unpaid_users' => [
                'value' => number_format($unpaidUsers),
                'trend' => 'down',
                'percentage' => '-10%',
                'label' => 'Follow up needed',
            ],
        ];
    }


    /**
     * Get enrollment trend data for chart
     */
    private function getEnrollmentChartData(): array
    {
        $months = [];
        $data = [];

        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthName = $date->format('M');
            $months[] = $monthName;

            $enrollments = CourseEnrollment::whereYear('enrollment_date', $date->year)
                ->whereMonth('enrollment_date', $date->month)
                ->count();

            $data[] = [
                'month' => $monthName,
                'enrollments' => $enrollments,
            ];
        }

        return $data;
    }

    /**
     * Get payment status distribution
     */
    private function getDistributionChartData(): array
    {
        $paid = CourseEnrollment::where('payment_status', 'completed')->count();
        $pending = CourseEnrollment::where('payment_status', 'pending')->count();
        $failed = CourseEnrollment::where('payment_status', 'failed')->count();

        return [
            ['name' => 'Paid', 'value' => $paid, 'color' => '#10B981'],
            ['name' => 'Pending', 'value' => $pending, 'color' => '#F59E0B'],
            ['name' => 'Failed', 'value' => $failed, 'color' => '#EF4444'],
        ];
    }

    /**
     * Get course performance data
     */
    private function getPerformanceChartData(): array
    {
        $courses = Course::withCount(['enrollments' => function($q) {
            $q->where('payment_status', 'completed');
        }])
        ->orderBy('enrollments_count', 'desc')
        ->take(6)
        ->get();

        return $courses->map(function($course) {
            return [
                'course' => substr($course->title, 0, 20) . '...',
                'students' => $course->enrollments_count,
            ];
        })->toArray();
    }

    /**
     * Get recent activity
     */
    private function getRecentActivity(): array
    {
        $activities = [];

        // Recent enrollments
        $recentEnrollments = CourseEnrollment::with('user')
            ->latest()
            ->take(5)
            ->get();

        foreach ($recentEnrollments as $enrollment) {
            $userName = $enrollment->user?->name ?? 'Unknown User';

            $activities[] = [
                'type' => 'enrollment',
                'title' => $userName . ' enrolled in ' . $enrollment->course_name,
                'time' => $enrollment->created_at->diffForHumans(),
                'icon' => 'BookOpen',
                'color' => 'text-blue-600',
                'bg' => 'bg-blue-50',
            ];
        }

        // Recent payments
        $recentPayments = CourseEnrollment::with('user')
            ->where('payment_status', 'completed')
            ->whereNotNull('payment_date')
            ->orderBy('payment_date', 'desc')
            ->take(5)
            ->get();

            foreach ($recentPayments as $payment) {
                $userName = $payment->user?->name ?? 'Unknown User';

                $activities[] = [
                    'type' => 'payment',
                    'title' => $userName . ' completed payment for ' . $payment->course_name,
                    'time' => \Carbon\Carbon::parse($payment->payment_date)->diffForHumans(),
                    'icon' => 'DollarSign',
                    'color' => 'text-green-600',
                    'bg' => 'bg-green-50',
                ];
            }

        // Sort by time
        usort($activities, function($a, $b) {
            return strcmp($a['time'], $b['time']);
        });

        return array_slice($activities, 0, 10);
    }

    /**
     * Get top performing courses
     */
    private function getTopCourses(): array
    {
        return Course::withCount(['enrollments' => function($q) {
            $q->where('payment_status', 'completed');
        }])
        ->orderBy('enrollments_count', 'desc')
        ->take(5)
        ->get()
        ->map(function($course) {
            return [
                'id' => $course->id,
                'course_id' => $course->course_id,
                'title' => $course->title,
                'students' => $course->enrollments_count,
                'revenue' => '$' . number_format($course->price * $course->enrollments_count, 0),
                'completion_rate' => rand(60, 95) . '%', // Calculate actual rate
            ];
        })
        ->toArray();
    }

    /**
     * Get new enrollments widget data
     */
    private function getNewEnrollments(): array
    {
        $today = CourseEnrollment::whereDate('enrollment_date', today())->count();
        $thisWeek = CourseEnrollment::whereBetween('enrollment_date', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ])->count();

        return [
            'today' => $today,
            'this_week' => $thisWeek,
            'recent' => CourseEnrollment::with('user')
                ->latest()
                ->take(3)
                ->get()
                ->map(function($enrollment) {
                    return [
                        'student_name' => $enrollment->user?->name ?? 'Unknown User',
                        'course_name' => $enrollment->course_name,
                        'time' => $enrollment->created_at->diffForHumans(),
                    ];
                })
                ->toArray(),
        ];
    }

    /**
     * Get upcoming consultations
     */
    private function getUpcomingConsultations(): array
    {
        // Implement consultation tracking
        return [
            'total' => 12,
            'upcoming' => [
                [
                    'student_name' => 'John Doe',
                    'course' => 'Web Development',
                    'time' => 'Today at 2:00 PM',
                ],
                [
                    'student_name' => 'Jane Smith',
                    'course' => 'Data Science',
                    'time' => 'Tomorrow at 10:00 AM',
                ],
                [
                    'student_name' => 'Mike Johnson',
                    'course' => 'UI/UX Design',
                    'time' => 'Tomorrow at 3:00 PM',
                ],
            ],
        ];
    }

    /**
     * Get recent milestones
     */
    private function getRecentMilestones(): array
    {
        // Implement milestone tracking
        return [
            [
                'title' => '100 Students Milestone',
                'description' => 'Reached 100 enrolled students',
                'date' => '2 days ago',
                'icon' => 'Users',
                'color' => 'text-purple-600',
                'bg' => 'bg-purple-50',
            ],
            [
                'title' => 'New Course Launch',
                'description' => 'Advanced JavaScript course launched',
                'date' => '1 week ago',
                'icon' => 'Rocket',
                'color' => 'text-blue-600',
                'bg' => 'bg-blue-50',
            ],
            [
                'title' => 'High Completion Rate',
                'description' => '85% completion rate achieved',
                'date' => '2 weeks ago',
                'icon' => 'Award',
                'color' => 'text-green-600',
                'bg' => 'bg-green-50',
            ],
        ];
    }
}