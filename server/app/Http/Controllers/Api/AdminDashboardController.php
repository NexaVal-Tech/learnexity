<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Models\User;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\Consultation;
use App\Models\UserCourseStatistic;
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

    /**
     * Compares a "this month" count against "last month" and returns the
     * up/down trend + percentage change, same shape every stat card uses.
     * Handles the 0-baseline case (can't divide by zero) by treating any
     * growth from 0 as a flat 100% rather than an undefined/infinite jump.
     */
    private function trendFor(int $thisPeriod, int $lastPeriod, string $upLabel, string $downLabel, string $flatLabel): array
    {
        if ($lastPeriod === 0) {
            $change = $thisPeriod > 0 ? 100.0 : 0.0;
        } else {
            $change = round((($thisPeriod - $lastPeriod) / $lastPeriod) * 100, 1);
        }

        return [
            'trend' => $change >= 0 ? 'up' : 'down',
            'percentage' => ($change >= 0 ? '+' : '') . $change . '%',
            'label' => $change > 0 ? $upLabel : ($change < 0 ? $downLabel : $flatLabel),
        ];
    }

    private function getStats(): array
    {
        $totalStudents = User::count();

        $lastMonthStudents = User::whereBetween('created_at', [now()->subMonth(), now()])->count();
        $twoMonthsAgoStudents = User::whereBetween('created_at', [now()->subMonths(2), now()->subMonth()])->count();
        $studentTrend = $this->trendFor(
            $lastMonthStudents, $twoMonthsAgoStudents,
            'Trending up this month', 'Down this month', 'Flat this month'
        );

        $activeCourses = Course::whereHas('enrollments', function ($q) {
            $q->where('payment_status', 'completed');
        })->count();
        $coursesAddedThisMonth = Course::whereBetween('created_at', [now()->subMonth(), now()])->count();
        $coursesAddedLastMonth = Course::whereBetween('created_at', [now()->subMonths(2), now()->subMonth()])->count();
        $activeCoursesTrend = $this->trendFor(
            $coursesAddedThisMonth, $coursesAddedLastMonth,
            'New courses added', 'Fewer courses added', 'No change'
        );

        // Consultations awaiting their scheduled date (not yet completed/cancelled/no-show).
        $pendingConsultations = Consultation::where('status', 'scheduled')->count();
        $consultationsBookedThisWeek = Consultation::whereBetween('created_at', [now()->startOfWeek(), now()])->count();
        $consultationsBookedLastWeek = Consultation::whereBetween('created_at', [now()->subWeek()->startOfWeek(), now()->subWeek()->endOfWeek()])->count();
        $consultationsTrend = $this->trendFor(
            $consultationsBookedThisWeek, $consultationsBookedLastWeek,
            'More booked this week', 'Fewer booked this week', 'Same as last week'
        );

        // Real course-completion rate — how many *paid* enrollments actually
        // finished the material (overall_progress >= 100 in
        // UserCourseStatistic), not just how many paid. This corrects the
        // previous metric, which conflated "paid" with "completed".
        $paidEnrollments = CourseEnrollment::where('payment_status', 'completed')->get(['user_id', 'course_id']);
        $completedCount = 0;
        foreach ($paidEnrollments as $enrollment) {
            $progress = UserCourseStatistic::where('user_id', $enrollment->user_id)
                ->where('course_id', $enrollment->course_id)
                ->value('overall_progress');
            if ($progress !== null && (float) $progress >= 100) {
                $completedCount++;
            }
        }
        $completionRate = $paidEnrollments->count() > 0
            ? round(($completedCount / $paidEnrollments->count()) * 100, 1)
            : 0;

        // Same calculation for last month's cohort, to get a real trend.
        $paidThisMonth = CourseEnrollment::where('payment_status', 'completed')
            ->whereBetween('payment_date', [now()->subMonth(), now()])->count();
        $paidLastMonthPeriod = CourseEnrollment::where('payment_status', 'completed')
            ->whereBetween('payment_date', [now()->subMonths(2), now()->subMonth()])->count();
        $completionTrend = $this->trendFor(
            $paidThisMonth, $paidLastMonthPeriod,
            'More enrollments this month', 'Fewer enrollments this month', 'Flat this month'
        );

        $paidUsers = User::whereHas('enrollments', function ($q) {
            $q->where('payment_status', 'completed');
        })->count();
        $unpaidUsers = $totalStudents - $paidUsers;

        $paidUsersThisMonth = User::whereHas('enrollments', fn ($q) => $q->where('payment_status', 'completed'))
            ->whereBetween('created_at', [now()->subMonth(), now()])->count();
        $paidUsersLastMonth = User::whereHas('enrollments', fn ($q) => $q->where('payment_status', 'completed'))
            ->whereBetween('created_at', [now()->subMonths(2), now()->subMonth()])->count();
        $paidTrend = $this->trendFor(
            $paidUsersThisMonth, $paidUsersLastMonth,
            'Revenue growth', 'Fewer paid signups', 'Flat this month'
        );

        $unpaidUsersThisMonth = $lastMonthStudents - $paidUsersThisMonth;
        $unpaidUsersLastMonth = $twoMonthsAgoStudents - $paidUsersLastMonth;
        $unpaidTrend = $this->trendFor(
            $unpaidUsersThisMonth, $unpaidUsersLastMonth,
            'More follow-up needed', 'Follow-ups going down', 'Flat this month'
        );

        return [
            'total_students' => [
                'value' => number_format($totalStudents),
                ...$studentTrend,
            ],
            'active_courses' => [
                'value' => number_format($activeCourses),
                ...$activeCoursesTrend,
            ],
            'pending_consultations' => [
                'value' => number_format($pendingConsultations),
                ...$consultationsTrend,
            ],
            'completion_rate' => [
                'value' => $completionRate . '%',
                ...$completionTrend,
            ],
            'paid_users' => [
                'value' => number_format($paidUsers),
                ...$paidTrend,
            ],
            'unpaid_users' => [
                'value' => number_format($unpaidUsers),
                ...$unpaidTrend,
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
            // Real completion rate: average overall_progress (from
            // UserCourseStatistic) across everyone who paid for this course.
            $avgProgress = UserCourseStatistic::where('course_id', $course->course_id)
                ->whereIn('user_id', CourseEnrollment::where('course_id', $course->course_id)
                    ->where('payment_status', 'completed')
                    ->pluck('user_id'))
                ->avg('overall_progress');

            return [
                'id' => $course->id,
                'course_id' => $course->course_id,
                'title' => $course->title,
                'students' => $course->enrollments_count,
                'revenue' => '$' . number_format($course->price * $course->enrollments_count, 0),
                'completion_rate' => round((float) ($avgProgress ?? 0)) . '%',
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
        $upcoming = Consultation::where('status', 'scheduled')
            ->whereDate('preferred_date', '>=', today())
            ->orderBy('preferred_date')
            ->orderBy('preferred_time')
            ->take(3)
            ->get();

        return [
            'total' => Consultation::where('status', 'scheduled')->count(),
            'upcoming' => $upcoming->map(function ($c) {
                $when = $c->preferred_date->isToday()
                    ? 'Today'
                    : ($c->preferred_date->isTomorrow() ? 'Tomorrow' : $c->preferred_date->format('M j'));

                return [
                    'student_name' => $c->full_name,
                    'course' => $c->course ?: ucfirst(str_replace('_', ' ', $c->consultation_type ?? 'Consultation')),
                    'time' => trim($when . ' at ' . ($c->preferred_time ?: '')),
                ];
            })->toArray(),
        ];
    }

    /**
     * Get recent milestones
     */
    /**
     * Derives real milestones from the data instead of showing placeholder
     * copy. Any milestone with no supporting data is simply omitted rather
     * than faked.
     */
    private function getRecentMilestones(): array
    {
        $milestones = [];

        // ── Student count milestone — most recent round number crossed ──────
        $totalStudents = User::count();
        $thresholds = [10000, 5000, 2500, 1000, 500, 250, 100, 50, 25, 10];
        foreach ($thresholds as $threshold) {
            if ($totalStudents >= $threshold) {
                $crossingUser = User::orderBy('created_at')->skip($threshold - 1)->first();
                if ($crossingUser) {
                    $milestones[] = [
                        'title' => number_format($threshold) . ' Students Milestone',
                        'description' => 'Reached ' . number_format($threshold) . ' enrolled students',
                        'date' => $crossingUser->created_at->diffForHumans(),
                        'icon' => 'Users',
                        'color' => 'text-purple-600',
                        'bg' => 'bg-purple-50',
                    ];
                }
                break;
            }
        }

        // ── Most recently added active course ────────────────────────────────
        $newestCourse = Course::where('is_active', true)->latest('created_at')->first();
        if ($newestCourse) {
            $milestones[] = [
                'title' => 'New Course Launch',
                'description' => '"' . $newestCourse->title . '" course launched',
                'date' => $newestCourse->created_at->diffForHumans(),
                'icon' => 'Rocket',
                'color' => 'text-blue-600',
                'bg' => 'bg-blue-50',
            ];
        }

        // ── Best real completion rate among courses with a meaningful sample ─
        $bestCourse = Course::all()->map(function ($course) {
            $enrolledUserIds = CourseEnrollment::where('course_id', $course->course_id)
                ->where('payment_status', 'completed')
                ->pluck('user_id');

            if ($enrolledUserIds->count() < 3) {
                return null;
            }

            $avg = UserCourseStatistic::where('course_id', $course->course_id)
                ->whereIn('user_id', $enrolledUserIds)
                ->avg('overall_progress');

            return $avg === null ? null : ['course' => $course, 'rate' => round((float) $avg)];
        })->filter()->sortByDesc('rate')->first();

        if ($bestCourse && $bestCourse['rate'] >= 50) {
            $milestones[] = [
                'title' => 'High Completion Rate',
                'description' => '"' . $bestCourse['course']->title . '" hit a ' . $bestCourse['rate'] . '% completion rate',
                'date' => 'Currently',
                'icon' => 'Award',
                'color' => 'text-green-600',
                'bg' => 'bg-green-50',
            ];
        }

        return $milestones;
    }
}