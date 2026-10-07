<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\MaterialItem;
use App\Models\MaterialItemSubmission;
use App\Services\TaskSubmissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * Student side of sprint tasks:
 *   GET  /api/materials/{itemId}/task                         → requirements + my attempts
 *   POST /api/materials/{itemId}/task                         → submit (multipart: text, link, file)
 *   GET  /api/materials/task-submissions/{submissionId}/file  → download MY file
 */
class TaskSubmissionController extends Controller
{
    public function __construct(private TaskSubmissionService $tasks) {}

    public function show(Request $request, int $itemId): JsonResponse
    {
        [$item] = $this->authorizeItem($request, $itemId);
        return response()->json(['task' => $this->tasks->studentView($item, $request->user()->id)]);
    }

    public function submit(Request $request, int $itemId): JsonResponse
    {
        $user = $request->user();
        [$item, $courseId] = $this->authorizeItem($request, $itemId);

        // Shape/size checks first — deeper content checks happen in the service.
        $request->validate([
            'text' => 'nullable|string|max:' . (TaskSubmissionService::TEXT_MAX_CHARS * 2),
            'link' => 'nullable|string|max:' . TaskSubmissionService::LINK_MAX_CHARS,
            'file' => 'nullable|file|max:' . (TaskSubmissionService::HARD_MAX_MB * 1024),
        ]);

        // Only these fields are read — anything else in the request is ignored.
        $file = $request->file('file');
        if (is_array($file)) {
            throw ValidationException::withMessages(['file' => ['Upload one file at a time.']]);
        }

        // One submission at a time per student + task (double-click / replay).
        $lock = null;
        try {
            $lock = Cache::lock("task-submit:{$item->id}:{$user->id}", 30);
            if (!$lock->get()) {
                return response()->json(['message' => 'Your previous submission is still being processed.'], 429);
            }
        } catch (\Throwable $e) {
            $lock = null; // cache store without lock support — the rate limiter still applies
        }

        try {
            $latest = MaterialItemSubmission::where('material_item_id', $item->id)->where('user_id', $user->id)->orderByDesc('attempt')->first();
            $attempts = MaterialItemSubmission::where('material_item_id', $item->id)->where('user_id', $user->id)->count();
            if (!$this->tasks->canSubmit($item, $latest, $attempts)) {
                return response()->json([
                    'message' => ($item->task_config['max_attempts'] ?? null) && $attempts >= $item->task_config['max_attempts']
                        ? 'You have used all your attempts for this task.'
                        : 'This task has already been completed.',
                ], 422);
            }

            $submission = $this->tasks->submit(
                $item,
                $user->id,
                $courseId,
                $request->input('text'),
                $request->input('link'),
                $file,
                $request->ip(),
            );
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error('Task submission failed', ['item' => $itemId, 'user' => $user->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'We could not save your submission. Please try again.'], 500);
        } finally {
            optional($lock)->release();
        }

        $passMark = $item->task_config['pass_mark'] ?? null;
        app(CourseResourcesController::class)->syncTaskCompletion($user->id, $item, $submission->countsAsComplete($passMark !== null ? (float) $passMark : null));

        return response()->json([
            'message' => match ($submission->status) {
                MaterialItemSubmission::STATUS_PASSED         => 'Submitted — you passed this task!',
                MaterialItemSubmission::STATUS_NEEDS_REVISION => 'Submitted — this needs a little more work. See the feedback below.',
                MaterialItemSubmission::STATUS_GRADED         => 'Submitted and marked.',
                default                                       => 'Submitted — your instructor will review it.',
            },
            'task' => $this->tasks->studentView($item->fresh(), $user->id),
        ], 201);
    }

    public function downloadOwn(Request $request, int $submissionId)
    {
        $submission = MaterialItemSubmission::where('id', $submissionId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();
        return $this->tasks->download($submission);
    }

    /**
     * The student must be enrolled with access to the item's course (or be
     * inside the free preview sprints of a freemium course).
     *
     * @return array{0: MaterialItem, 1: string}
     */
    private function authorizeItem(Request $request, int $itemId): array
    {
        $item = MaterialItem::with('courseMaterial')->findOrFail($itemId);
        if (!$item->isTask() || !$item->courseMaterial) {
            abort(404, 'This material is not a task.');
        }

        $courseId = (string) $item->courseMaterial->course_id;
        $userId = $request->user()->id;

        $enrollment = CourseEnrollment::where('user_id', $userId)->where('course_id', $courseId)->first();
        if ($enrollment) {
            $enrollment->updateAccessStatus();
            $enrollment->refresh();
        }
        $hasAccess = $enrollment && ($enrollment->has_access || $enrollment->access_manually_granted);

        if (!$hasAccess) {
            $course = Course::where('course_id', $courseId)->first();
            $freePreview = $course && $course->is_freemium && (int) $item->courseMaterial->sprint_number <= 2;
            if (!$freePreview) {
                abort(403, 'Enroll and pay to unlock this task.');
            }
        }

        return [$item, $courseId];
    }
}
