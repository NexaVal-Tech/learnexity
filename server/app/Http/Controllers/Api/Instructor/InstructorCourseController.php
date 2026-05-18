<?php

namespace App\Http\Controllers\Api\Instructor;

use App\Http\Controllers\Controller;
use App\Models\CourseMaterial;
use App\Models\MaterialItem;
use App\Models\ExternalResource;
use App\Models\Project;
use App\Models\ProjectSubmission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Instructor-scoped course management.
 * Instructors can ONLY manage materials on courses assigned to them.
 * They CANNOT create or delete courses.
 */
class InstructorCourseController extends Controller
{
    // ── Guard helper ───────────────────────────────────────────────────────────

    private function instructor()
    {
        auth()->shouldUse('instructor');
        return auth()->user();
    }

    /**
     * Check that the instructor is assigned to this course.
     * Returns 403 if not.
     */
    private function assertCourseAccess(string $courseId): void
    {
        $instructor = $this->instructor();
        $hasAccess = DB::table('instructor_courses')
            ->where('instructor_id', $instructor->id)
            ->where('course_id', $courseId)
            ->exists();

        if (!$hasAccess) {
            abort(403, 'You are not assigned to this course.');
        }
    }

    // ── Courses ────────────────────────────────────────────────────────────────

    /**
     * GET /api/instructor/courses
     * Returns only courses this instructor is assigned to.
     */
    public function myCourses(): JsonResponse
    {
        $instructor = $this->instructor();

        $courseIds = DB::table('instructor_courses')
            ->where('instructor_id', $instructor->id)
            ->pluck('course_id');

        $courses = \App\Models\Course::whereIn('course_id', $courseIds)
            ->get()
            ->map(function ($course) {
                $sprintCount = CourseMaterial::where('course_id', $course->course_id)->count();
                return [
                    'id'           => $course->id,
                    'course_id'    => $course->course_id,
                    'title'        => $course->title,
                    'description'  => $course->description,
                    'hero_image'   => $course->hero_image_url ?? $course->hero_image,
                    'sprint_count' => $sprintCount,
                ];
            });

        return response()->json(['courses' => $courses]);
    }

    /**
     * GET /api/instructor/courses/{courseId}
     * Full course detail with sprints, topics, students, submissions.
     */
    public function getCourse(string $courseId): JsonResponse
    {
        $this->assertCourseAccess($courseId);

        $course = \App\Models\Course::where('course_id', $courseId)->firstOrFail();

        $sprints = CourseMaterial::where('course_id', $courseId)
            ->with('items')
            ->orderBy('sprint_number')
            ->get()
            ->map(fn ($s) => [
                'id'     => $s->id,
                'number' => $s->sprint_number,
                'week'   => $s->sprint_number,
                'title'  => $s->sprint_name,
                'topics' => $s->items->map(fn ($i) => [
                    'id'           => $i->id,
                    'title'        => $i->title,
                    'type'         => $i->type,
                    'text_content' => $i->text_content,
                    'file_url'     => $i->file_url,
                    'order'        => $i->order,
                ])->sortBy('order')->values(),
            ]);

        // Students enrolled in this course (completed payment)
        $students = \App\Models\CourseEnrollment::where('course_id', $courseId)
            ->where('payment_status', 'completed')
            ->with('user')
            ->get()
            ->map(fn ($e) => [
                'id'       => $e->user?->id,
                'name'     => $e->user?->name,
                'email'    => $e->user?->email,
                'progress' => $this->getStudentProgress($e->user_id, $courseId),
            ])->filter(fn ($s) => $s['id'] !== null)->values();

        // Projects for this course
        $projects = Project::where('course_id', $courseId)
            ->where('is_active', true)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'course'   => $course,
            'sprints'  => $sprints,
            'students' => $students,
            'projects' => $projects,
        ]);
    }

    // ── Sprint CRUD (same as admin, but scoped) ────────────────────────────────

    public function createSprint(Request $request, string $courseId): JsonResponse
    {
        $this->assertCourseAccess($courseId);

        $validated = $request->validate([
            'sprint_name'   => 'required|string|max:255',
            'sprint_number' => 'required|integer|min:1',
            'order'         => 'integer|min:0',
        ]);

        $sprint = CourseMaterial::create([
            'course_id'     => $courseId,
            'sprint_name'   => $validated['sprint_name'],
            'sprint_number' => $validated['sprint_number'],
            'order'         => $validated['order'] ?? 0,
        ]);

        return response()->json(['message' => 'Sprint created', 'sprint' => $sprint], 201);
    }

    public function updateSprint(Request $request, string $courseId, int $sprintId): JsonResponse
    {
        $this->assertCourseAccess($courseId);

        $sprint = CourseMaterial::where('course_id', $courseId)->findOrFail($sprintId);
        $sprint->update($request->only('sprint_name', 'sprint_number', 'order'));

        return response()->json(['message' => 'Sprint updated', 'sprint' => $sprint]);
    }

    public function deleteSprint(string $courseId, int $sprintId): JsonResponse
    {
        $this->assertCourseAccess($courseId);

        $sprint = CourseMaterial::where('course_id', $courseId)->findOrFail($sprintId);
        $sprint->delete();

        return response()->json(['message' => 'Sprint deleted']);
    }

    // ── Topic CRUD ─────────────────────────────────────────────────────────────

    public function createTopic(Request $request, string $courseId, int $sprintId): JsonResponse
    {
        $this->assertCourseAccess($courseId);

        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'type'         => 'required|in:text,pdf,document,video,link',
            'text_content' => 'nullable|string',
            'file_url'     => 'nullable|url',
            'order'        => 'integer|min:0',
        ]);

        $sprint = CourseMaterial::where('course_id', $courseId)->findOrFail($sprintId);

        $item = MaterialItem::create([
            'course_material_id' => $sprint->id,
            'title'              => $validated['title'],
            'type'               => $validated['type'],
            'text_content'       => $validated['text_content'] ?? null,
            'file_url'           => $validated['file_url'] ?? null,
            'order'              => $validated['order'] ?? 0,
        ]);

        return response()->json(['message' => 'Topic created', 'item' => $item], 201);
    }

    public function updateTopic(Request $request, string $courseId, int $itemId): JsonResponse
    {
        $this->assertCourseAccess($courseId);

        $item = MaterialItem::findOrFail($itemId);
        $item->update($request->only('title', 'type', 'text_content', 'file_url', 'order'));

        return response()->json(['message' => 'Topic updated', 'item' => $item]);
    }

    public function deleteTopic(string $courseId, int $itemId): JsonResponse
    {
        $this->assertCourseAccess($courseId);

        $item = MaterialItem::findOrFail($itemId);
        if ($item->file_path && Storage::disk('public')->exists($item->file_path)) {
            Storage::disk('public')->delete($item->file_path);
        }
        $item->delete();

        return response()->json(['message' => 'Topic deleted']);
    }

    public function uploadTopicFile(Request $request, string $courseId, int $itemId): JsonResponse
    {
        $this->assertCourseAccess($courseId);

        $request->validate(['file' => 'required|file|max:51200']);

        $item     = MaterialItem::findOrFail($itemId);
        $sprint   = CourseMaterial::findOrFail($item->course_material_id);
        $file     = $request->file('file');
        $path     = $file->storeAs("courses/{$courseId}/sprint{$sprint->sprint_number}", $file->getClientOriginalName(), 'public');

        $item->update([
            'file_path' => $path,
            'file_size' => $this->formatBytes($file->getSize()),
            'file_url'  => Storage::url($path),
        ]);

        return response()->json(['message' => 'File uploaded', 'download_url' => Storage::url($path)]);
    }

    // ── Projects ───────────────────────────────────────────────────────────────

    /**
     * GET /api/instructor/courses/{courseId}/projects
     */
    public function getProjects(string $courseId): JsonResponse
    {
        $this->assertCourseAccess($courseId);

        $projects = Project::where('course_id', $courseId)
            ->with(['submissions.user', 'teamRoles.user'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['projects' => $projects]);
    }

    /**
     * POST /api/instructor/courses/{courseId}/projects
     */
    public function createProject(Request $request, string $courseId): JsonResponse
    {
        $this->assertCourseAccess($courseId);
        $instructor = $this->instructor();

        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'brief'            => 'required|string',
            'expected_outcome' => 'nullable|string',
            'deadline'         => 'nullable|date',
            'sprint_id'        => 'nullable|exists:course_materials,id',
        ]);

        $project = Project::create([
            ...$validated,
            'course_id'              => $courseId,
            'created_by_instructor'  => $instructor->id,
            'phase'                  => 'brief',
            'is_active'              => true,
        ]);

        return response()->json(['message' => 'Project created', 'project' => $project], 201);
    }

    /**
     * PATCH /api/instructor/projects/{projectId}/phase
     * Advance the project to the next phase.
     */
    public function advancePhase(Request $request, int $projectId): JsonResponse
    {
        $project = Project::findOrFail($projectId);
        $this->assertCourseAccess($project->course_id);

        $phases = ['brief', 'team', 'execution', 'review', 'delivery'];
        $currentIndex = array_search($project->phase, $phases);

        if ($currentIndex === false || $currentIndex >= count($phases) - 1) {
            return response()->json(['message' => 'Project is already at the final phase.'], 400);
        }

        $project->update(['phase' => $phases[$currentIndex + 1]]);

        return response()->json(['message' => 'Phase advanced', 'project' => $project->fresh()]);
    }

    /**
     * GET /api/instructor/projects/{projectId}/submissions
     */
    public function getSubmissions(int $projectId): JsonResponse
    {
        $project = Project::findOrFail($projectId);
        $this->assertCourseAccess($project->course_id);

        $submissions = ProjectSubmission::where('project_id', $projectId)
            ->with('user')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['submissions' => $submissions]);
    }

    /**
     * POST /api/instructor/submissions/{submissionId}/review
     * Instructor provides feedback and status.
     */
    public function reviewSubmission(Request $request, int $submissionId): JsonResponse
    {
        $submission = ProjectSubmission::with('project')->findOrFail($submissionId);
        $this->assertCourseAccess($submission->project->course_id);
        $instructor = $this->instructor();

        $validated = $request->validate([
            'status'               => 'required|in:reviewed,revision_requested,approved',
            'instructor_feedback'  => 'required|string|min:10',
        ]);

        $submission->update([
            'status'              => $validated['status'],
            'instructor_feedback' => $validated['instructor_feedback'],
            'reviewed_by'         => $instructor->id,
            'reviewed_at'         => now(),
        ]);

        return response()->json(['message' => 'Submission reviewed', 'submission' => $submission->fresh()]);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private function getStudentProgress(int $userId, string $courseId): int
    {
        $total = DB::table('material_items')
            ->join('course_materials', 'material_items.course_material_id', '=', 'course_materials.id')
            ->where('course_materials.course_id', $courseId)
            ->count();

        if ($total === 0) return 0;

        $completed = DB::table('material_item_progress')
            ->where('user_id', $userId)
            ->where('is_completed', true)
            ->whereIn('material_item_id', function ($q) use ($courseId) {
                $q->select('material_items.id')
                    ->from('material_items')
                    ->join('course_materials', 'material_items.course_material_id', '=', 'course_materials.id')
                    ->where('course_materials.course_id', $courseId);
            })->count();

        return round(($completed / $total) * 100);
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes >= 1048576) return number_format($bytes / 1048576, 2) . ' MB';
        if ($bytes >= 1024)    return number_format($bytes / 1024, 2)    . ' KB';
        return $bytes . ' bytes';
    }
}