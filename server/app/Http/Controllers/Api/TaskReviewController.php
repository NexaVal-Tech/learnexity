<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\TaskReviewedMail;
use App\Models\CourseMaterial;
use App\Models\MaterialItem;
use App\Models\MaterialItemSubmission;
use App\Services\TaskSubmissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Staff side of sprint tasks — shared by admins (admin.permission:courses)
 * and instructors (only for courses assigned to them).
 *
 *  Admin:      /api/admin/courses/{courseId}/tasks/...           /api/admin/task-submissions/{id}/...
 *  Instructor: /api/instructor/courses/{courseId}/tasks/...      /api/instructor/task-submissions/{id}/...
 */
class TaskReviewController extends Controller
{
    public function __construct(private TaskSubmissionService $tasks) {}

    // ── Admin entry points ──────────────────────────────────────────────
    public function adminSaveConfig(Request $r, string $courseId, int $itemId): JsonResponse { return $this->saveConfig($r, $courseId, $itemId); }
    public function adminList(Request $r, string $courseId): JsonResponse { return $this->listSubmissions($r, $courseId); }
    public function adminGrade(Request $r, int $submissionId): JsonResponse
    {
        $admin = $r->user('admin') ?? $r->user();
        return $this->gradeSubmission($r, $this->findSubmission($submissionId), 'admin', $admin?->id, $admin?->name);
    }
    public function adminFile(int $submissionId) { return $this->tasks->download($this->findSubmission($submissionId)); }

    // ── Instructor entry points ─────────────────────────────────────────
    public function instructorSaveConfig(Request $r, string $courseId, int $itemId): JsonResponse
    {
        $this->assertInstructorCourse($courseId);
        return $this->saveConfig($r, $courseId, $itemId);
    }
    public function instructorList(Request $r, string $courseId): JsonResponse
    {
        $this->assertInstructorCourse($courseId);
        return $this->listSubmissions($r, $courseId);
    }
    public function instructorGrade(Request $r, int $submissionId): JsonResponse
    {
        $s = $this->findSubmission($submissionId);
        $instructor = $this->assertInstructorCourse($s->course_id);
        return $this->gradeSubmission($r, $s, 'instructor', $instructor->id, $instructor->name ?? null);
    }
    public function instructorFile(int $submissionId)
    {
        $s = $this->findSubmission($submissionId);
        $this->assertInstructorCourse($s->course_id);
        return $this->tasks->download($s);
    }

    // ── Shared ──────────────────────────────────────────────────────────

    private function saveConfig(Request $request, string $courseId, int $itemId): JsonResponse
    {
        $item = $this->itemInCourse($courseId, $itemId);

        $request->validate([
            'task_config'                      => 'required|array',
            'task_config.enabled'              => 'boolean',
            'task_config.instructions'         => 'nullable|string|max:5000',
            'task_config.text'                 => 'nullable|array',
            'task_config.text.keywords'        => 'nullable|array|max:30',
            'task_config.text.keywords.*'      => 'nullable|string|max:60',
            'task_config.link'                 => 'nullable|array',
            'task_config.link.allowed_domains' => 'nullable|array|max:10',
            'task_config.link.allowed_domains.*' => 'nullable|string|max:100',
            'task_config.file'                 => 'nullable|array',
            'task_config.file.allowed_types'   => 'nullable|array|max:12',
            'task_config.file.allowed_types.*' => 'string|max:10',
            'task_config.pass_mark'            => 'nullable|numeric|min:0|max:100',
            'task_config.max_attempts'         => 'nullable|integer|min:1|max:20',
        ]);

        $cfg = $this->tasks->normalizeConfig($request->input('task_config', []));
        $item->task_config = $cfg['enabled'] ? $cfg : array_merge($cfg, ['enabled' => false]);
        $item->save();

        return response()->json(['message' => $cfg['enabled'] ? 'Task requirements saved' : 'Task turned off', 'task_config' => $item->task_config]);
    }

    private function listSubmissions(Request $request, string $courseId): JsonResponse
    {
        $request->validate([
            'status'  => 'nullable|in:submitted,passed,needs_revision,graded,all',
            'item_id' => 'nullable|integer',
            'search'  => 'nullable|string|max:100',
            'page'    => 'nullable|integer|min:1',
        ]);

        $q = MaterialItemSubmission::query()
            ->where('course_id', $courseId)
            ->with(['user:id,name,email', 'item:id,title,course_material_id,task_config', 'item.courseMaterial:id,sprint_name,sprint_number'])
            ->orderByRaw("CASE WHEN status = 'submitted' THEN 0 WHEN status = 'needs_revision' THEN 1 ELSE 2 END")
            ->orderByDesc('created_at');

        $status = $request->input('status');
        if ($status && $status !== 'all') $q->where('status', $status);
        if ($request->filled('item_id')) $q->where('material_item_id', (int) $request->input('item_id'));
        if ($request->filled('search')) {
            $term = '%' . addcslashes((string) $request->input('search'), '%_\\') . '%';
            $q->whereHas('user', fn ($u) => $u->where('name', 'like', $term)->orWhere('email', 'like', $term));
        }

        $page = $q->paginate(20);

        $counts = MaterialItemSubmission::where('course_id', $courseId)
            ->select('status', DB::raw('COUNT(*) as c'))
            ->groupBy('status')
            ->pluck('c', 'status');

        $tasks = MaterialItem::whereIn('course_material_id', CourseMaterial::where('course_id', $courseId)->pluck('id'))
            ->whereNotNull('task_config')
            ->get(['id', 'title', 'task_config'])
            ->filter(fn ($i) => $i->isTask())
            ->map(fn ($i) => ['id' => $i->id, 'title' => $i->title])
            ->values();

        return response()->json([
            'submissions' => collect($page->items())->map(fn ($s) => $this->tasks->presentForGrader($s))->values(),
            'pagination'  => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()],
            'counts'      => $counts,
            'tasks'       => $tasks,
        ]);
    }

    private function gradeSubmission(Request $request, MaterialItemSubmission $s, string $byType, ?int $byId, ?string $byName): JsonResponse
    {
        $request->validate([
            'action'   => 'required|in:grade,request_revision',
            'score'    => 'nullable|numeric|min:0|max:100',
            'feedback' => 'nullable|string|max:5000',
            'notify'   => 'nullable|boolean',
        ]);

        $s->loadMissing(['item.courseMaterial', 'user']);
        $score = $request->filled('score') ? (float) $request->input('score') : null;
        $this->tasks->grade($s, $request->input('action'), $score, $request->input('feedback'), $byType, $byId, $byName);

        // Keep the student's progress in step with the grade.
        $pass = $s->item->task_config['pass_mark'] ?? null;
        try {
            app(CourseResourcesController::class)->syncTaskCompletion($s->user_id, $s->item, $s->countsAsComplete($pass !== null ? (float) $pass : null));
        } catch (\Throwable $e) {
            Log::warning('Task completion sync failed', ['submission' => $s->id, 'error' => $e->getMessage()]);
        }

        if ($request->boolean('notify', true) && $s->user && $s->user->email) {
            try {
                Mail::to($s->user->email)->queue(new TaskReviewedMail($s->user, $s));
            } catch (\Throwable $e) {
                Log::warning('Task reviewed email failed', ['submission' => $s->id, 'error' => $e->getMessage()]);
            }
        }

        return response()->json(['message' => 'Review saved', 'submission' => $this->tasks->presentForGrader($s->fresh(['user', 'item.courseMaterial']))]);
    }

    private function findSubmission(int $id): MaterialItemSubmission
    {
        return MaterialItemSubmission::with(['item.courseMaterial', 'user'])->findOrFail($id);
    }

    private function itemInCourse(string $courseId, int $itemId): MaterialItem
    {
        $item = MaterialItem::with('courseMaterial')->findOrFail($itemId);
        if (!$item->courseMaterial || (string) $item->courseMaterial->course_id !== $courseId) {
            abort(404, 'Material not found in this course.');
        }
        return $item;
    }

    private function assertInstructorCourse(string $courseId)
    {
        auth()->shouldUse('instructor');
        $instructor = auth()->user();
        if (!$instructor) abort(401);
        $ok = DB::table('instructor_courses')
            ->where('instructor_id', $instructor->id)
            ->where('course_id', $courseId)
            ->exists();
        if (!$ok) abort(403, 'You are not assigned to this course.');
        return $instructor;
    }
}
