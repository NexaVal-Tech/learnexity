<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\CourseMaterial;
use App\Models\MaterialItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminCourseController extends Controller
{
    /**
     * Get all courses with statistics
     */
    public function index(Request $request): JsonResponse
    {
        $query = Course::with(['enrollments']);

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('course_id', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status')) {
            $status = $request->status;
            if ($status === 'active') {
                $query->whereHas('enrollments', function($q) {
                    $q->where('created_at', '>=', now()->subDays(30));
                });
            }
        }

        $courses = $query->latest()->paginate($request->per_page ?? 10);

        // Add computed fields
        $courses->getCollection()->transform(function($course) {
            $enrollments = $course->enrollments;
            $totalEnrollments = $enrollments->count();
            $activeEnrollments = $enrollments->where('payment_status', 'completed')->count();
            
            // Get sprint count
            $sprintCount = CourseMaterial::where('course_id', $course->course_id)->count();
            
            $course->stats = [
                'total_enrollments' => $totalEnrollments,
                'active_students' => $activeEnrollments,
                'completion_rate' => $totalEnrollments > 0 ? round(($activeEnrollments / $totalEnrollments) * 100) : 0,
                'sprint_count' => $sprintCount,
                'week_count' => $sprintCount,
            ];
            
            return $course;
        });

        return response()->json($courses);
    }

    /**
     * Get single course with full details
     */
    public function show(string $courseId): JsonResponse
    {
        $course = Course::where('course_id', $courseId)->firstOrFail();
        
        // Get sprints with topics
        $sprints = CourseMaterial::where('course_id', $courseId)
            ->with(['items'])
            ->orderBy('sprint_number')
            ->get()
            ->map(function($sprint) {
                return [
                    'id' => $sprint->id,
                    'number' => $sprint->sprint_number,
                    'week' => $sprint->sprint_number,
                    'title' => $sprint->sprint_name,
                    'topics' => $sprint->items->map(function($item) {
                        return [
                            'id' => $item->id,
                            'title' => $item->title,
                            'type' => $item->type,
                        ];
                    }),
                ];
            });

        // Get course materials for materials tab
        $materials = MaterialItem::whereHas('courseMaterial', function($q) use ($courseId) {
            $q->where('course_id', $courseId);
        })
        ->with('courseMaterial')
        ->get()
        ->map(function($item) {
            return [
                'id' => $item->id,
                'name' => $item->title,
                'type' => strtoupper($item->type),
                'sprint' => 'Sprint ' . $item->courseMaterial->sprint_number,
                'size' => $item->file_size ?? 'N/A',
                'access' => $item->type === 'pdf' ? 'Downloadable' : 'View Only',
                'upload_date' => $item->created_at->format('Y-m-d'),
            ];
        });

        // Get external resources
        $externalResources = DB::table('external_resources')
            ->where('course_id', $courseId)
            ->get()
            ->map(function($resource) {
                return [
                    'id' => $resource->id,
                    'title' => $resource->title,
                    'type' => strpos($resource->url, 'youtube') !== false || strpos($resource->url, 'vimeo') !== false ? 'video' : 'document',
                    'platform' => $this->extractPlatform($resource->url),
                    'url' => $resource->url,
                    'date' => date('Y-m-d', strtotime($resource->created_at)),
                ];
            });

        // Get enrollment statistics
        $enrollments = CourseEnrollment::where('course_id', $courseId)->get();
        $totalEnrollments = $enrollments->count();
        $activeStudents = $enrollments->where('payment_status', 'completed')->count();
        $paymentRate = $totalEnrollments > 0 ? round(($activeStudents / $totalEnrollments) * 100) : 0;

        // Calculate average progress
        $avgProgress = 40; // Implement actual calculation

        // Get enrolled students
        $students = $enrollments->map(function($enrollment) use ($courseId) {
            $user = \App\Models\User::find($enrollment->user_id);
            
            // Calculate progress
            $totalTopics = DB::table('material_items')
                ->join('course_materials', 'material_items.course_material_id', '=', 'course_materials.id')
                ->where('course_materials.course_id', $courseId)
                ->count();
            
            $completedTopics = DB::table('material_item_progress')
                ->where('user_id', $enrollment->user_id)
                ->whereIn('material_item_id', function($query) use ($courseId) {
                    $query->select('material_items.id')
                        ->from('material_items')
                        ->join('course_materials', 'material_items.course_material_id', '=', 'course_materials.id')
                        ->where('course_materials.course_id', $courseId);
                })
                ->where('is_completed', true)
                ->count();
            
            $progress = $totalTopics > 0 ? round(($completedTopics / $totalTopics) * 100) : 0;
            
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'payment' => ucfirst($enrollment->payment_status),
                'activity' => $user->updated_at->diffInDays(now()) <= 7 ? 'Active' : 'Inactive',
                'progress' => $progress,
                'date' => date('Y-m-d', strtotime($enrollment->enrollment_date)),
            ];
        });

        // Sprint completion data for chart
        $sprintCompletionData = $sprints->map(function($sprint, $index) use ($courseId) {
            $totalStudents = CourseEnrollment::where('course_id', $courseId)
                ->where('payment_status', 'completed')
                ->count();
            
            if ($totalStudents === 0) {
                return [
                    'sprint' => (string)($index + 1),
                    'completion' => 0,
                ];
            }
            
            $completedStudents = 0;
            
            return [
                'sprint' => (string)($index + 1),
                'completion' => rand(15, 85),
            ];
        });

        return response()->json([
            'course' => [
                'id' => $course->id,
                'course_id' => $course->course_id,
                'name' => $course->title,
                'instructor' => 'Sarah Chen',
                'sprints_count' => $sprints->count(),
                'weeks_count' => $sprints->count(),
            ],
            'sprints' => $sprints,
            'materials' => $materials,
            'external_resources' => $externalResources,
            'statistics' => [
                'total_enrollments' => $totalEnrollments,
                'active_students' => $activeStudents,
                'avg_progress' => $avgProgress,
                'payment_rate' => $paymentRate,
            ],
            'students' => $students,
            'chart_data' => [
                'sprint_completion' => $sprintCompletionData,
                'progress_distribution' => [
                    ['name' => '0-25%', 'value' => 15, 'color' => '#EF4444'],
                    ['name' => '26-50%', 'value' => 28, 'color' => '#F59E0B'],
                    ['name' => '51-75%', 'value' => 45, 'color' => '#3B82F6'],
                    ['name' => '76-100%', 'value' => 68, 'color' => '#10B981'],
                ],
            ],
        ]);
    }

    /**
     * Get course statistics
     */
    public function getStatistics(): JsonResponse
    {
        $totalCourses = Course::count();
        $activeCourses = Course::whereHas('enrollments', function($q) {
            $q->where('payment_status', 'completed');
        })->count();
        
        $totalEnrollments = CourseEnrollment::count();
        $completionRate = 0;

        return response()->json([
            'total_courses' => $totalCourses,
            'active_courses' => $activeCourses,
            'total_enrollments' => $totalEnrollments,
            'average_completion_rate' => $completionRate,
        ]);
    }

    /**
     * Create a new course with full pricing support
     */
    public function store(Request $request): JsonResponse
    {
        Log::info('📝 Course creation request received', [
            'data' => $request->all()
        ]);

        $validated = $request->validate([
            // Basic Information
            'title' => 'required|string|max:255',
            'course_id' => 'required|string|unique:courses,course_id',
            'description' => 'required|string',
            'project' => 'nullable|string',
            'duration' => 'nullable|string',
            'level' => 'nullable|string',
            'is_freemium' => 'boolean',
            'is_premium' => 'boolean',
            
            // Images
            'hero_image' => 'nullable|string',
            'secondary_image' => 'nullable|string',
            
            // Base Prices (Currency-specific)
            'price_usd' => 'required|numeric|min:0',
            'price_ngn' => 'required|numeric|min:0',
            
            // Track Availability
            'offers_one_on_one' => 'boolean',
            'offers_group_mentorship' => 'boolean',
            'offers_self_paced' => 'boolean',
            
            // Track Prices (USD)
            'one_on_one_price_usd' => 'nullable|numeric|min:0',
            'group_mentorship_price_usd' => 'nullable|numeric|min:0',
            'self_paced_price_usd' => 'nullable|numeric|min:0',
            
            // Track Prices (NGN)
            'one_on_one_price_ngn' => 'nullable|numeric|min:0',
            'group_mentorship_price_ngn' => 'nullable|numeric|min:0',
            'self_paced_price_ngn' => 'nullable|numeric|min:0',
            
            // One-time Discounts
           'onetime_discount_usd' => 'nullable|numeric|min:0|max:100',
            'onetime_discount_ngn' => 'nullable|numeric|min:0|max:100',
        ]);

        // Set default values for track availability if not provided
        $validated['offers_one_on_one'] = $validated['offers_one_on_one'] ?? true;
        $validated['offers_group_mentorship'] = $validated['offers_group_mentorship'] ?? true;
        $validated['offers_self_paced'] = $validated['offers_self_paced'] ?? true;

        // Also set the legacy 'price' field to match price_usd for backwards compatibility
        $validated['price'] = $validated['price_usd'];

        try {
            $course = Course::create($validated);

            Log::info('✅ Course created successfully', [
                'course_id' => $course->course_id,
                'id' => $course->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Course created successfully',
                'course' => $course->load(['tools', 'learnings', 'benefits', 'careerPaths', 'industries', 'salary']),
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('❌ Course creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create course: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update course
     */
    public function update(Request $request, string $courseId): JsonResponse
    {
        $course = Course::where('course_id', $courseId)->firstOrFail();

        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'string',
            'project' => 'nullable|string',
            'duration' => 'nullable|string',
            'level' => 'nullable|string',
            'is_freemium' => 'boolean',
            'is_premium' => 'boolean',
            'hero_image' => 'nullable|string',
            'secondary_image' => 'nullable|string',
            
            // Prices
            'price_usd' => 'nullable|numeric|min:0',
            'price_ngn' => 'nullable|numeric|min:0',
            
            // Track availability
            'offers_one_on_one' => 'boolean',
            'offers_group_mentorship' => 'boolean',
            'offers_self_paced' => 'boolean',
            
            // Track prices
            'one_on_one_price_usd' => 'nullable|numeric|min:0',
            'group_mentorship_price_usd' => 'nullable|numeric|min:0',
            'self_paced_price_usd' => 'nullable|numeric|min:0',
            'one_on_one_price_ngn' => 'nullable|numeric|min:0',
            'group_mentorship_price_ngn' => 'nullable|numeric|min:0',
            'self_paced_price_ngn' => 'nullable|numeric|min:0',
            
            // Discounts
            'onetime_discount_usd' => 'nullable|numeric|min:0|max:100',
            'onetime_discount_ngn' => 'nullable|numeric|min:0|max:100',
        ]);

        // Update legacy price field if price_usd is provided
        if (isset($validated['price_usd'])) {
            $validated['price'] = $validated['price_usd'];
        }

        $course->update($validated);

        return response()->json([
            'message' => 'Course updated successfully',
            'course' => $course->fresh()->load(['tools', 'learnings', 'benefits', 'careerPaths', 'industries', 'salary']),
        ]);
    }

    /**
     * Delete course
     */
    public function destroy(string $courseId): JsonResponse
    {
        $course = Course::where('course_id', $courseId)->firstOrFail();
        
        // Check if course has enrollments
        if ($course->enrollments()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete course with active enrollments',
            ], 400);
        }

        $course->delete();

        return response()->json([
            'message' => 'Course deleted successfully',
        ]);
    }

    /**
     * Extract platform from URL
     */
    private function extractPlatform(string $url): ?string
    {
        if (strpos($url, 'youtube.com') !== false || strpos($url, 'youtu.be') !== false) {
            return 'YouTube';
        }
        if (strpos($url, 'vimeo.com') !== false) {
            return 'Vimeo';
        }
        return null;
    }

    /**
     * Update pricing and settings (backward compatibility)
     */
    public function updatePricingAndSettings(Request $request, string $courseId): JsonResponse
    {
        $course = Course::where('course_id', $courseId)->firstOrFail();

        $validated = $request->validate([
            // Track availability
            'offers_one_on_one' => 'boolean',
            'offers_group_mentorship' => 'boolean',
            'offers_self_paced' => 'boolean',

            // Base prices
            'price_usd' => 'nullable|numeric|min:0',
            'price_ngn' => 'nullable|numeric|min:0',

            // Track prices (USD)
            'one_on_one_price_usd' => 'nullable|numeric|min:0',
            'group_mentorship_price_usd' => 'nullable|numeric|min:0',
            'self_paced_price_usd' => 'nullable|numeric|min:0',

            // Track prices (NGN)
            'one_on_one_price_ngn' => 'nullable|numeric|min:0',
            'group_mentorship_price_ngn' => 'nullable|numeric|min:0',
            'self_paced_price_ngn' => 'nullable|numeric|min:0',

            // One-time discounts
            'onetime_discount_usd' => 'nullable|numeric|min:0|max:100',
            'onetime_discount_ngn' => 'nullable|numeric|min:0|max:100',
        ]);

        // Update legacy price if price_usd is set
        if (isset($validated['price_usd'])) {
            $validated['price'] = $validated['price_usd'];
        }

        $course->update($validated);

        return response()->json([
            'message' => 'Course pricing and settings updated successfully',
            'course' => $course->fresh(),
        ]);
    }
}