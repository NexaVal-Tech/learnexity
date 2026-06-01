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
use Illuminate\Support\Facades\Storage;

class AdminCourseController extends Controller
{
    /**
     * Get all courses with statistics
     */
    public function index(Request $request): JsonResponse
    {
        $query = Course::with(['enrollments']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('course_id', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $status = $request->status;
            if ($status === 'active') {
                $query->whereHas('enrollments', function($q) {
                    $q->where('created_at', '>=', now()->subDays(30));
                });
            }
        }

        $courses = $query->latest()->paginate($request->per_page ?? 10);

        $courses->getCollection()->transform(function($course) {
            $enrollments = $course->enrollments;
            $totalEnrollments = $enrollments->count();
            $activeEnrollments = $enrollments->where('payment_status', 'completed')->count();
            $sprintCount = CourseMaterial::where('course_id', $course->course_id)->count();

            $course->stats = [
                'total_enrollments' => $totalEnrollments,
                'active_students'   => $activeEnrollments,
                'completion_rate'   => $totalEnrollments > 0 ? round(($activeEnrollments / $totalEnrollments) * 100) : 0,
                'sprint_count'      => $sprintCount,
                'week_count'        => $sprintCount,
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

        $sprints = CourseMaterial::where('course_id', $courseId)
            ->with(['items'])
            ->orderBy('sprint_number')
            ->get()
            ->map(function($sprint) {
                return [
                    'id'     => $sprint->id,
                    'number' => $sprint->sprint_number,
                    'week'   => $sprint->sprint_number,
                    'title'  => $sprint->sprint_name,
                    'topics' => $sprint->items->map(function($item) {
                        return [
                            'id'           => $item->id,
                            'title'        => $item->title,
                            'type'         => $item->type,
                            'text_content' => $item->text_content,
                            'file_url'     => $item->file_url,
                        ];
                    }),
                ];
            });

        $materials = MaterialItem::whereHas('courseMaterial', function($q) use ($courseId) {
            $q->where('course_id', $courseId);
        })
        ->with('courseMaterial')
        ->get()
        ->map(function($item) {
            return [
                'id'           => $item->id,
                'name'         => $item->title,
                'type'         => strtoupper($item->type),
                'text_content' => $item->text_content,
                'sprint'       => 'Sprint ' . $item->courseMaterial->sprint_number,
                'size'         => $item->file_size ?? 'N/A',
                'access'       => $item->type === 'pdf' ? 'Downloadable' : 'View Only',
                'upload_date'  => $item->created_at->format('Y-m-d'),
            ];
        });

        $externalResources = DB::table('external_resources')
            ->where('course_id', $courseId)
            ->get()
            ->map(function($resource) {
                return [
                    'id'       => $resource->id,
                    'title'    => $resource->title,
                    'type'     => strpos($resource->url, 'youtube') !== false || strpos($resource->url, 'vimeo') !== false ? 'video' : 'document',
                    'platform' => $this->extractPlatform($resource->url),
                    'url'      => $resource->url,
                    'date'     => date('Y-m-d', strtotime($resource->created_at)),
                ];
            });

        $enrollments     = CourseEnrollment::where('course_id', $courseId)->get();
        $totalEnrollments = $enrollments->count();
        $activeStudents  = $enrollments->where('payment_status', 'completed')->count();
        $paymentRate     = $totalEnrollments > 0 ? round(($activeStudents / $totalEnrollments) * 100) : 0;
        $avgProgress     = 40;

        $students = $enrollments->map(function($enrollment) use ($courseId) {
            $user = \App\Models\User::find($enrollment->user_id);
            if (!$user) return null;

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
                'id'       => $user->id,
                'name'     => $user->name,
                'email'    => $user->email,
                'payment'  => ucfirst($enrollment->payment_status),
                'activity' => $user->updated_at->diffInDays(now()) <= 7 ? 'Active' : 'Inactive',
                'progress' => $progress,
                'date'     => date('Y-m-d', strtotime($enrollment->enrollment_date)),
            ];
        })->filter()->values();

        $sprintCompletionData = $sprints->map(function($sprint, $index) use ($courseId) {
            $totalStudents = CourseEnrollment::where('course_id', $courseId)
                ->where('payment_status', 'completed')
                ->count();

            if ($totalStudents === 0) {
                return ['sprint' => (string)($index + 1), 'completion' => 0];
            }

            return ['sprint' => (string)($index + 1), 'completion' => rand(15, 85)];
        });

        return response()->json([
            'course' => [
                'id'                         => $course->id,
                'course_id'                  => $course->course_id,
                'name'                       => $course->title,
                'title'                      => $course->title,
                'description'                => $course->description,
                'project'                    => $course->project,
                'duration'                   => $course->duration,
                'level'                      => $course->level,
                'is_freemium'                => $course->is_freemium,
                'is_premium'                 => $course->is_premium,
                'hero_image'                 => $course->hero_image_url,
                'secondary_image'            => $course->secondary_image_url,
                'instructor'                 => 'Sarah Chen',
                'sprints_count'              => $sprints->count(),
                'weeks_count'                => $sprints->count(),
                'offers_one_on_one'          => $course->offers_one_on_one,
                'offers_group_mentorship'    => $course->offers_group_mentorship,
                'offers_self_paced'          => $course->offers_self_paced,
                'price_usd'                  => $course->price_usd,
                'price_ngn'                  => $course->price_ngn,
                'one_on_one_price_usd'       => $course->one_on_one_price_usd,
                'group_mentorship_price_usd' => $course->group_mentorship_price_usd,
                'self_paced_price_usd'       => $course->self_paced_price_usd,
                'one_on_one_price_ngn'       => $course->one_on_one_price_ngn,
                'group_mentorship_price_ngn' => $course->group_mentorship_price_ngn,
                'self_paced_price_ngn'       => $course->self_paced_price_ngn,
                'onetime_discount_usd'       => $course->onetime_discount_usd,
                'onetime_discount_ngn'       => $course->onetime_discount_ngn,
            ],
            'sprints'            => $sprints,
            'materials'          => $materials,
            'external_resources' => $externalResources,
            'statistics'         => [
                'total_enrollments' => $totalEnrollments,
                'active_students'   => $activeStudents,
                'avg_progress'      => $avgProgress,
                'payment_rate'      => $paymentRate,
            ],
            'students'   => $students,
            'chart_data' => [
                'sprint_completion'    => $sprintCompletionData,
                'progress_distribution' => [
                    ['name' => '0-25%',   'value' => 15, 'color' => '#EF4444'],
                    ['name' => '26-50%',  'value' => 28, 'color' => '#F59E0B'],
                    ['name' => '51-75%',  'value' => 45, 'color' => '#3B82F6'],
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
        $totalCourses  = Course::count();
        $activeCourses = Course::whereHas('enrollments', function($q) {
            $q->where('payment_status', 'completed');
        })->count();
        $totalEnrollments = CourseEnrollment::count();

        return response()->json([
            'total_courses'           => $totalCourses,
            'active_courses'          => $activeCourses,
            'total_enrollments'       => $totalEnrollments,
            'average_completion_rate' => 0,
        ]);
    }

    /**
     * Create a new course with full pricing support
     */
    public function store(Request $request): JsonResponse
    {
        // ── DEBUG LOGGING ──────────────────────────────────────────────────────
        Log::info('📝 [store] Raw request content type: ' . $request->header('Content-Type'));
        Log::info('📝 [store] All input keys: ' . implode(', ', array_keys($request->all())));
        Log::info('📝 [store] Files received: ' . implode(', ', array_keys($request->allFiles())));
        Log::info('📝 [store] Input (no files): ', $request->except(['hero_image', 'secondary_image']));

        // Log individual image fields
        Log::info('📝 [store] hero_image input value: ' . json_encode($request->input('hero_image')));
        Log::info('📝 [store] hero_image has file: ' . ($request->hasFile('hero_image') ? 'YES' : 'NO'));
        Log::info('📝 [store] secondary_image input value: ' . json_encode($request->input('secondary_image')));
        Log::info('📝 [store] secondary_image has file: ' . ($request->hasFile('secondary_image') ? 'YES' : 'NO'));

        if ($request->hasFile('hero_image')) {
            $file = $request->file('hero_image');
            Log::info('📝 [store] hero_image file details: ', [
                'original_name' => $file->getClientOriginalName(),
                'mime'          => $file->getMimeType(),
                'size'          => $file->getSize(),
                'valid'         => $file->isValid(),
                'error'         => $file->getError(),
            ]);
        }
        // ── END DEBUG ──────────────────────────────────────────────────────────

        try {
            $validated = $request->validate([
                // Basic Information
                'title'       => 'required|string|max:255',
                'course_id'   => 'required|string|unique:courses,course_id',
                'description' => 'required|string',
                'project'     => 'nullable|string',
                'duration'    => 'nullable|string',
                'level'       => 'nullable|string',
                'is_freemium' => 'nullable|in:0,1,true,false',
                'is_premium'  => 'nullable|in:0,1,true,false',

                // Images — accept file upload OR a plain string URL
                'hero_image'      => 'nullable',
                'secondary_image' => 'nullable',

                // Base Prices
                'price_usd' => 'required|numeric|min:0',
                'price_ngn' => 'required|numeric|min:0',

                // Track Availability
                'offers_one_on_one'       => 'nullable|in:0,1,true,false',
                'offers_group_mentorship' => 'nullable|in:0,1,true,false',
                'offers_self_paced'       => 'nullable|in:0,1,true,false',

                // Track Prices (USD)
                'one_on_one_price_usd'       => 'nullable|numeric|min:0',
                'group_mentorship_price_usd' => 'nullable|numeric|min:0',
                'self_paced_price_usd'       => 'nullable|numeric|min:0',

                // Track Prices (NGN)
                'one_on_one_price_ngn'       => 'nullable|numeric|min:0',
                'group_mentorship_price_ngn' => 'nullable|numeric|min:0',
                'self_paced_price_ngn'       => 'nullable|numeric|min:0',

                // One-time Discounts
                'onetime_discount_usd' => 'nullable|numeric|min:0',
                'onetime_discount_ngn' => 'nullable|numeric|min:0',
            ]);

            Log::info('✅ [store] Validation passed');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('❌ [store] Validation FAILED', [
                'errors'    => $e->errors(),
                'all_input' => $request->except(['hero_image', 'secondary_image']),
            ]);

            // Return detailed errors so the frontend toast shows what failed
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        }

        // Cast booleans (FormData sends strings)
        $validated['is_freemium']             = filter_var($validated['is_freemium'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $validated['is_premium']              = filter_var($validated['is_premium'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $validated['offers_one_on_one']       = filter_var($validated['offers_one_on_one'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $validated['offers_group_mentorship'] = filter_var($validated['offers_group_mentorship'] ?? true, FILTER_VALIDATE_BOOLEAN);
        $validated['offers_self_paced']       = filter_var($validated['offers_self_paced'] ?? true, FILTER_VALIDATE_BOOLEAN);

        // Handle images
        $validated['hero_image']      = $this->handleImageInput($request, 'hero_image');
        $validated['secondary_image'] = $this->handleImageInput($request, 'secondary_image');

        Log::info('📝 [store] Resolved hero_image path: ' . ($validated['hero_image'] ?? 'null'));
        Log::info('📝 [store] Resolved secondary_image path: ' . ($validated['secondary_image'] ?? 'null'));

        // Legacy price field
        $validated['price'] = $validated['price_usd'];

        try {
            $course = Course::create($validated);

            Log::info('✅ [store] Course created successfully', ['course_id' => $course->id]);

            return response()->json([
                'success' => true,
                'message' => 'Course created successfully',
                'course'  => $course->load(['tools', 'learnings', 'benefits', 'careerPaths', 'industries', 'salary']),
            ], 201);

        } catch (\Exception $e) {
            Log::error('❌ [store] Course creation DB error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create course: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update course basic info + pricing
     *
     * NOTE: The frontend sends this as POST with _method=PUT (FormData method spoofing).
     * Laravel's router handles _method spoofing automatically.
     */
    public function update(Request $request, string $courseId): JsonResponse
    {
        // ── DEBUG LOGGING ──────────────────────────────────────────────────────
        Log::info('📝 [update] Called for courseId: ' . $courseId);
        Log::info('📝 [update] HTTP method: ' . $request->method());
        Log::info('📝 [update] Content-Type: ' . $request->header('Content-Type'));
        Log::info('📝 [update] _method field: ' . $request->input('_method', 'NOT SET'));
        Log::info('📝 [update] All input keys: ' . implode(', ', array_keys($request->all())));
        Log::info('📝 [update] Files received: ' . implode(', ', array_keys($request->allFiles())));
        Log::info('📝 [update] Input (no files): ', $request->except(['hero_image', 'secondary_image', '_method']));

        Log::info('📝 [update] hero_image input: ' . json_encode($request->input('hero_image')));
        Log::info('📝 [update] hero_image has file: ' . ($request->hasFile('hero_image') ? 'YES' : 'NO'));
        Log::info('📝 [update] secondary_image input: ' . json_encode($request->input('secondary_image')));
        Log::info('📝 [update] secondary_image has file: ' . ($request->hasFile('secondary_image') ? 'YES' : 'NO'));

        if ($request->hasFile('hero_image')) {
            $file = $request->file('hero_image');
            Log::info('📝 [update] hero_image file: ', [
                'original_name' => $file->getClientOriginalName(),
                'mime'          => $file->getMimeType(),
                'size'          => $file->getSize(),
                'valid'         => $file->isValid(),
                'error'         => $file->getError(),
            ]);
        }
        // ── END DEBUG ──────────────────────────────────────────────────────────

        $course = Course::where('course_id', $courseId)->firstOrFail();

        try {
            $validated = $request->validate([
                'title'       => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'project'     => 'nullable|string',
                'duration'    => 'nullable|string',
                'level'       => 'nullable|string',
                'is_freemium' => 'nullable|in:0,1,true,false',
                'is_premium'  => 'nullable|in:0,1,true,false',

                // Images — no MIME validation here; handleImageInput deals with it
                'hero_image'      => 'nullable',
                'secondary_image' => 'nullable',

                // Prices
                'price_usd' => 'nullable|numeric|min:0',
                'price_ngn' => 'nullable|numeric|min:0',

                // Track availability
                'offers_one_on_one'       => 'nullable|in:0,1,true,false',
                'offers_group_mentorship' => 'nullable|in:0,1,true,false',
                'offers_self_paced'       => 'nullable|in:0,1,true,false',

                // Track prices
                'one_on_one_price_usd'       => 'nullable|numeric|min:0',
                'group_mentorship_price_usd' => 'nullable|numeric|min:0',
                'self_paced_price_usd'       => 'nullable|numeric|min:0',
                'one_on_one_price_ngn'       => 'nullable|numeric|min:0',
                'group_mentorship_price_ngn' => 'nullable|numeric|min:0',
                'self_paced_price_ngn'       => 'nullable|numeric|min:0',

                // Discounts
                'onetime_discount_usd' => 'nullable|numeric|min:0',
                'onetime_discount_ngn' => 'nullable|numeric|min:0',
            ]);

            Log::info('✅ [update] Validation passed');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('❌ [update] Validation FAILED', [
                'errors'    => $e->errors(),
                'all_input' => $request->except(['hero_image', 'secondary_image', '_method']),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        }

        // Handle image uploads — only update if a new file/value was provided
        $heroImage = $this->handleImageInput($request, 'hero_image');
        if ($heroImage !== null) {
            $validated['hero_image'] = $heroImage;
            Log::info('📝 [update] New hero_image stored: ' . $heroImage);
        } else {
            // Don't overwrite the existing value with null
            unset($validated['hero_image']);
            Log::info('📝 [update] hero_image not changed (no new file/value)');
        }

        $secondaryImage = $this->handleImageInput($request, 'secondary_image');
        if ($secondaryImage !== null) {
            $validated['secondary_image'] = $secondaryImage;
            Log::info('📝 [update] New secondary_image stored: ' . $secondaryImage);
        } else {
            unset($validated['secondary_image']);
            Log::info('📝 [update] secondary_image not changed (no new file/value)');
        }

        // Update legacy price field if price_usd is provided
        if (isset($validated['price_usd'])) {
            $validated['price'] = $validated['price_usd'];
        }

        // Remove _method from validated so it doesn't get written to the DB
        unset($validated['_method']);

        $course->update($validated);

        Log::info('✅ [update] Course updated successfully', ['course_id' => $courseId]);

        return response()->json([
            'message' => 'Course updated successfully',
            'course'  => $course->fresh()->load(['tools', 'learnings', 'benefits', 'careerPaths', 'industries', 'salary']),
        ]);
    }

    /**
     * Delete course
     */
    public function destroy(string $courseId): JsonResponse
    {
        $course = Course::where('course_id', $courseId)->firstOrFail();

        if ($course->enrollments()->count() > 0) {
            return response()->json(['message' => 'Cannot delete course with active enrollments'], 400);
        }

        $course->delete();

        return response()->json(['message' => 'Course deleted successfully']);
    }

    /**
     * Update pricing and settings (dedicated endpoint)
     */
    public function updatePricingAndSettings(Request $request, string $courseId): JsonResponse
    {
        $course = Course::where('course_id', $courseId)->firstOrFail();

        $validated = $request->validate([
            'offers_one_on_one'          => 'boolean',
            'offers_group_mentorship'    => 'boolean',
            'offers_self_paced'          => 'boolean',
            'price_usd'                  => 'nullable|numeric|min:0',
            'price_ngn'                  => 'nullable|numeric|min:0',
            'one_on_one_price_usd'       => 'nullable|numeric|min:0',
            'group_mentorship_price_usd' => 'nullable|numeric|min:0',
            'self_paced_price_usd'       => 'nullable|numeric|min:0',
            'one_on_one_price_ngn'       => 'nullable|numeric|min:0',
            'group_mentorship_price_ngn' => 'nullable|numeric|min:0',
            'self_paced_price_ngn'       => 'nullable|numeric|min:0',
            'onetime_discount_usd'       => 'nullable|numeric|min:0',
            'onetime_discount_ngn'       => 'nullable|numeric|min:0',
        ]);

        if (isset($validated['price_usd'])) {
            $validated['price'] = $validated['price_usd'];
        }

        $course->update($validated);

        return response()->json([
            'message' => 'Course pricing and settings updated successfully',
            'course'  => $course->fresh(),
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // Course Detail Sections — Edit endpoints
    // ─────────────────────────────────────────────────────────────

    /**
     * Get all editable details for a course (tools, learnings, etc.)
     */
    public function getDetails(string $courseId): JsonResponse
    {
        $course = Course::where('course_id', $courseId)->firstOrFail();

        // ── FIX: Use the model accessor so icon_url is always a full URL ──────
        $tools = \App\Models\CourseTool::where('course_id', $course->id)
            ->orderBy('order')
            ->get()
            ->map(fn($t) => [
                'id'       => $t->id,
                'name'     => $t->name,
                'icon_url' => $t->icon_url,   // accessor on CourseTool must return full URL
                'order'    => $t->order,
            ]);

        $learnings  = DB::table('course_learnings')->where('course_id', $course->id)->orderBy('order')->get();
        $benefits   = DB::table('course_benefits')->where('course_id', $course->id)->orderBy('order')->get();
        $careerPaths = DB::table('course_career_paths')->where('course_id', $course->id)->orderBy('order')->get();
        $industries = DB::table('course_industries')->where('course_id', $course->id)->orderBy('order')->get();
        $salary     = DB::table('course_salaries')->where('course_id', $course->id)->first();

        return response()->json([
            'tools'        => $tools,
            'learnings'    => $learnings,
            'benefits'     => $benefits,
            'career_paths' => $careerPaths,
            'industries'   => $industries,
            'salary'       => $salary,
        ]);
    }

    /**
     * Sync tools (replace all existing)
     */
    public function syncTools(Request $request, string $courseId): JsonResponse
    {
        Log::info('📝 [syncTools] courseId: ' . $courseId);
        Log::info('📝 [syncTools] input tools: ' . json_encode($request->input('tools', [])));
        Log::info('📝 [syncTools] files: ' . json_encode(array_keys($request->allFiles())));

        $course = Course::where('course_id', $courseId)->firstOrFail();
        $tools  = $request->input('tools', []);

        DB::table('course_tools')->where('course_id', $course->id)->delete();

        $uploadedFiles = $request->file('tool_icons') ?? []; // ← fix here

        foreach ($tools as $index => $tool) {
            if (empty($tool['name'])) continue;

            $iconPath = null;

            if (isset($uploadedFiles[$index])) { // ← and here
                $iconPath = $uploadedFiles[$index]->store('course-tools', 'public');
                Log::info("📝 [syncTools] tool[{$index}] icon stored: {$iconPath}");
            } elseif (!empty($tool['icon_url'])) {
                $iconPath = $this->normalizeIconUrl($tool['icon_url']);
                Log::info("📝 [syncTools] tool[{$index}] icon kept: {$iconPath}");
            }

            DB::table('course_tools')->insert([
                'course_id'  => $course->id,
                'name'       => $tool['name'],
                'icon'       => $iconPath,
                'order'      => $index,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json(['message' => 'Tools updated successfully']);
    }

    /**
     * Normalize a tool icon URL or relative storage path.
     */
    protected function normalizeIconUrl(string $iconUrl): string
    {
        if (filter_var($iconUrl, FILTER_VALIDATE_URL)) {
            $storagePrefix = url('/storage/');
            if (str_starts_with($iconUrl, $storagePrefix)) {
                return ltrim(substr($iconUrl, strlen($storagePrefix)), '/');
            }
        }

        return ltrim($iconUrl, '/');
    }

    /**
     * Sync learnings
     */
    public function syncLearnings(Request $request, string $courseId): JsonResponse
    {
        $course = Course::where('course_id', $courseId)->firstOrFail();

        $validated = $request->validate([
            'learnings'                  => 'required|array',
            'learnings.*.learning_point' => 'required|string',
        ]);

        DB::table('course_learnings')->where('course_id', $course->id)->delete();

        foreach ($validated['learnings'] as $index => $learning) {
            DB::table('course_learnings')->insert([
                'course_id'      => $course->id,
                'learning_point' => $learning['learning_point'],
                'order'          => $index,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);
        }

        return response()->json(['message' => 'Learnings updated successfully']);
    }

    /**
     * Sync benefits
     */
    public function syncBenefits(Request $request, string $courseId): JsonResponse
    {
        $course = Course::where('course_id', $courseId)->firstOrFail();

        $validated = $request->validate([
            'benefits'         => 'required|array',
            'benefits.*.title' => 'required|string',
            'benefits.*.text'  => 'required|string',
        ]);

        DB::table('course_benefits')->where('course_id', $course->id)->delete();

        foreach ($validated['benefits'] as $index => $benefit) {
            DB::table('course_benefits')->insert([
                'course_id'  => $course->id,
                'title'      => $benefit['title'],
                'text'       => $benefit['text'],
                'order'      => $index,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json(['message' => 'Benefits updated successfully']);
    }

    /**
     * Sync career paths
     */
    public function syncCareerPaths(Request $request, string $courseId): JsonResponse
    {
        $course = Course::where('course_id', $courseId)->firstOrFail();

        $validated = $request->validate([
            'career_paths'           => 'required|array',
            'career_paths.*.level'   => 'required|in:entry,mid,advanced,specialized',
            'career_paths.*.position' => 'required|string',
        ]);

        DB::table('course_career_paths')->where('course_id', $course->id)->delete();

        foreach ($validated['career_paths'] as $index => $path) {
            DB::table('course_career_paths')->insert([
                'course_id'  => $course->id,
                'level'      => $path['level'],
                'position'   => $path['position'],
                'order'      => $index,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json(['message' => 'Career paths updated successfully']);
    }

    /**
     * Sync industries
     */
    public function syncIndustries(Request $request, string $courseId): JsonResponse
    {
        $course = Course::where('course_id', $courseId)->firstOrFail();

        $validated = $request->validate([
            'industries'         => 'required|array',
            'industries.*.title' => 'required|string',
            'industries.*.text'  => 'required|string',
        ]);

        DB::table('course_industries')->where('course_id', $course->id)->delete();

        foreach ($validated['industries'] as $index => $industry) {
            DB::table('course_industries')->insert([
                'course_id'  => $course->id,
                'title'      => $industry['title'],
                'text'       => $industry['text'],
                'order'      => $index,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json(['message' => 'Industries updated successfully']);
    }

    /**
     * Upsert salary info
     */
    public function upsertSalary(Request $request, string $courseId): JsonResponse
    {
        $course = Course::where('course_id', $courseId)->firstOrFail();

        $validated = $request->validate([
            'entry_level'  => 'nullable|string',
            'mid_level'    => 'nullable|string',
            'senior_level' => 'nullable|string',
        ]);

        DB::table('course_salaries')->updateOrInsert(
            ['course_id' => $course->id],
            array_merge($validated, [
                'course_id'  => $course->id,
                'updated_at' => now(),
                'created_at' => now(),
            ])
        );

        return response()->json(['message' => 'Salary info updated successfully']);
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    /**
     * Handle image input: uploaded file takes priority, then string URL.
     * Returns the stored path/URL, or null if nothing provided.
     */
    private function handleImageInput(Request $request, string $field): ?string
    {
        if ($request->hasFile($field)) {
            $file = $request->file($field);
            Log::info("📝 [handleImageInput] Uploading file for field '{$field}': " . $file->getClientOriginalName());
            return $file->store('course-images', 'public');
        }

        $value = $request->input($field);

        if ($value && is_string($value) && !empty(trim($value))) {
            Log::info("📝 [handleImageInput] Using string URL for field '{$field}': " . $value);
            return $value;
        }

        Log::info("📝 [handleImageInput] No value for field '{$field}'");
        return null;
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
}