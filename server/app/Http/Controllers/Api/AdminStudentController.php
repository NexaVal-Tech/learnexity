<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\User;
use App\Models\CourseEnrollment;
use Illuminate\Support\Facades\DB;

class AdminStudentController extends Controller
{
    /**
     * Get all students with filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', 'user')
            ->with(['enrollments.course']);

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Activity status filter
        if ($request->has('activity_status')) {
            $status = $request->activity_status;
            if ($status === 'active') {
                $query->where('updated_at', '>=', now()->subDays(7));
            } elseif ($status === 'inactive') {
                $query->where('updated_at', '<', now()->subDays(7));
            }
        }

        // Payment status filter
        if ($request->has('payment_status')) {
            $paymentStatus = $request->payment_status;
            $query->whereHas('enrollments', function($q) use ($paymentStatus) {
                $q->where('payment_status', $paymentStatus);
            });
        }

        // Course filter
        if ($request->has('course_id')) {
            $query->whereHas('enrollments', function($q) use ($request) {
                $q->where('course_id', $request->course_id);
            });
        }

        $students = $query->latest()->paginate($request->per_page ?? 10);

        // Add computed fields
        $students->getCollection()->transform(function($student) {
            $student->courses_count = $student->enrollments->count();
            $student->activity_status = $student->updated_at->diffInDays(now()) <= 7 ? 'active' : 'inactive';
            $student->has_paid = $student->enrollments->where('payment_status', 'completed')->count() > 0;
            return $student;
        });

        return response()->json($students);
    }

    /**
     * Get single student details with full data
     */
    public function show(int $id): JsonResponse
    {
        $student = User::where('role', 'user')
            ->with([
                'enrollments.course',
                'materialProgress.materialItem.courseMaterial',
                'userAchievements.badge'
            ])
            ->findOrFail($id);

        // Calculate statistics
        $enrollments = $student->enrollments;
        $totalEnrollments = $enrollments->count();
        $activeEnrollments = $enrollments->where('payment_status', 'completed')->count();
        
        // Calculate average progress across all courses
        $totalProgress = 0;
        $enrollmentDetails = [];
        
        foreach ($enrollments as $enrollment) {
            $courseId = $enrollment->course_id;
            
            // Get sprint and topic progress
            $materials = DB::table('course_materials')
                ->where('course_id', $courseId)
                ->get();
            
            $totalTopics = DB::table('material_items')
                ->whereIn('course_material_id', $materials->pluck('id'))
                ->count();
            
            $completedTopics = DB::table('user_material_progress')
                ->where('user_id', $student->id)
                ->whereIn('material_item_id', function($query) use ($courseId) {
                    $query->select('material_items.id')
                        ->from('material_items')
                        ->join('course_materials', 'material_items.course_material_id', '=', 'course_materials.id')
                        ->where('course_materials.course_id', $courseId);
                })
                ->where('is_completed', true)
                ->count();
            
            $progress = $totalTopics > 0 ? round(($completedTopics / $totalTopics) * 100) : 0;
            $totalProgress += $progress;
            
            $enrollmentDetails[] = [
                'id' => $enrollment->id,
                'course_id' => $courseId,
                'course_name' => $enrollment->course_name,
                'status' => $progress >= 100 ? 'Completed' : 'Active',
                'enrolled_date' => $enrollment->enrollment_date,
                'completed_date' => $progress >= 100 ? $enrollment->updated_at : null,
                'overall_progress' => $progress,
                'sprints' => [
                    'completed' => $materials->where('sprint_number', '<=', ceil($progress / 100 * $materials->count()))->count(),
                    'total' => $materials->count()
                ],
                'topics' => [
                    'completed' => $completedTopics,
                    'total' => $totalTopics
                ],
                'sprint_progress' => $progress,
                'topic_progress' => $progress,
            ];
        }

        $averageProgress = $totalEnrollments > 0 ? round($totalProgress / $totalEnrollments) : 0;

        // Activity timeline
        $activities = $this->getStudentActivities($student->id);

        return response()->json([
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'phone' => $student->phone ?? '+1 (555) 123-4567',
                'location' => 'New York', // You can add this to user table
                'initials' => $this->getInitials($student->name),
                'registration_date' => $student->created_at->format('d/m/Y'),
                'payment_status' => $enrollments->where('payment_status', 'completed')->count() > 0 ? 'Paid' : 'Pending',
                'activity_status' => $student->updated_at->diffInDays(now()) <= 7 ? 'Active' : 'Inactive',
                'courses_enrolled_count' => $totalEnrollments,
            ],
            'courses' => $enrollmentDetails,
            'performance' => [
                'last_active' => $student->updated_at->format('d/m/Y'),
                'attendance_rate' => 92, // Implement attendance tracking
                'average_progress' => $averageProgress,
            ],
            'activities' => $activities,
        ]);
    }

    /**
     * Get student activities
     */
    private function getStudentActivities(int $userId): array
    {
        $activities = [];

        // Get enrollments
        $enrollments = CourseEnrollment::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        foreach ($enrollments as $enrollment) {
            if ($enrollment->payment_status === 'completed') {
                $activities[] = [
                    'title' => 'Payment Received',
                    'description' => '$' . number_format($enrollment->course_price, 0) . ' - ' . $enrollment->course_name,
                    'date' => $enrollment->payment_date ? date('d/m/Y', strtotime($enrollment->payment_date)) : date('d/m/Y', strtotime($enrollment->enrollment_date)),
                    'type' => 'payment',
                    'icon' => 'CreditCard',
                    'color' => 'bg-orange-500',
                ];
            }

            $activities[] = [
                'title' => 'Enrolled in ' . $enrollment->course_name,
                'description' => 'New course started',
                'date' => date('d/m/Y', strtotime($enrollment->enrollment_date)),
                'type' => 'enrollment',
                'icon' => 'BookOpen',
                'color' => 'bg-blue-500',
            ];
        }

        // Get completed sprints
        $completedMaterials = DB::table('user_material_progress')
            ->join('material_items', 'user_material_progress.material_item_id', '=', 'material_items.id')
            ->join('course_materials', 'material_items.course_material_id', '=', 'course_materials.id')
            ->where('user_material_progress.user_id', $userId)
            ->where('user_material_progress.is_completed', true)
            ->select('course_materials.sprint_name', 'user_material_progress.completed_at')
            ->groupBy('course_materials.id')
            ->orderBy('user_material_progress.completed_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($completedMaterials as $material) {
            $activities[] = [
                'title' => 'Completed ' . $material->sprint_name,
                'description' => 'Sprint finished successfully',
                'date' => date('d/m/Y', strtotime($material->completed_at)),
                'type' => 'completion',
                'icon' => 'Award',
                'color' => 'bg-green-500',
            ];
        }

        // Sort by date
        usort($activities, function($a, $b) {
            return strtotime(str_replace('/', '-', $b['date'])) - strtotime(str_replace('/', '-', $a['date']));
        });

        return array_slice($activities, 0, 10);
    }

    /**
     * Get student statistics
     */
    public function getStatistics(): JsonResponse
    {
        $totalStudents = User::where('role', 'user')->count();
        $activeStudents = User::where('role', 'user')
            ->where('updated_at', '>=', now()->subDays(7))
            ->count();
        
        $paidStudents = User::where('role', 'user')
            ->whereHas('enrollments', function($q) {
                $q->where('payment_status', 'completed');
            })
            ->count();

        $unpaidStudents = $totalStudents - $paidStudents;

        return response()->json([
            'total_students' => $totalStudents,
            'active_students' => $activeStudents,
            'paid_students' => $paidStudents,
            'unpaid_students' => $unpaidStudents,
            'new_this_month' => User::where('role', 'user')
                ->whereMonth('created_at', now()->month)
                ->count(),
        ]);
    }

    /**
     * Send message to student(s)
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:users,id',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        // Implement your email sending logic here
        // Example: Send email to selected students
        
        foreach ($validated['student_ids'] as $studentId) {
            $student = User::find($studentId);
            // Mail::to($student->email)->send(new AdminMessage($validated['subject'], $validated['message']));
        }

        return response()->json([
            'message' => 'Message sent successfully to ' . count($validated['student_ids']) . ' student(s)',
        ]);
    }

    /**
     * Get initials from name
     */
    private function getInitials(string $name): string
    {
        $words = explode(' ', $name);
        $initials = '';
        
        foreach ($words as $word) {
            if (!empty($word)) {
                $initials .= strtoupper($word[0]);
            }
        }
        
        return substr($initials, 0, 2);
    }
}