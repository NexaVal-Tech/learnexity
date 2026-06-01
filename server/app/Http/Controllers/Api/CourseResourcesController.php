<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\CourseMaterial;
use App\Models\MaterialItem;
use App\Models\SprintProgress;
use App\Models\MaterialItemProgress;
use App\Models\UserCourseStatistic;
use App\Models\CohortLeaderboard;
use App\Models\ExternalResource;
use App\Models\AchievementBadge;
use App\Models\UserBadge;
use App\Models\CourseEnrollment;
use App\Models\Course;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Services\UserPerformanceTracker;
use App\Models\EmailSequenceLog;
use App\Mail\SprintCompletedMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;


class CourseResourcesController extends Controller
{
    /**
     * Number of sprints that are always freely accessible when a course
     * has is_freemium = true. Sprints beyond this threshold require a
     * completed (or active installment) enrollment to view.
     */
    private const FREE_SPRINT_LIMIT = 2;

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Determine whether the authenticated user has full (paid) access to a
     * course.  Returns true if:
     *   • The course is NOT freemium/premium-gated (i.e. is_freemium = false
     *     and is_premium = false — a fully-open course).
     *   • The user has a completed one-time payment enrollment.
     *   • The user has an installment enrollment where has_access = true
     *     (first installment paid and not overdue).
     */
    private function userHasFullAccess(int $userId, string $courseId): bool
    {
        $course = Course::where('course_id', $courseId)->first();

        // If the course is neither gated nor freemium, everyone has full access
        if ($course && !$course->is_freemium && !$course->is_premium) {
            return true;
        }

        $enrollment = CourseEnrollment::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->first();

        if (!$enrollment) {
            return false;
        }

        // Update access status (handles overdue installments etc.)
        $enrollment->updateAccessStatus();
        $enrollment->refresh();

        return (bool) $enrollment->has_access;
    }

    /**
     * Decide whether a sprint is locked for a given user.
     *
     * Rules:
     *   1. If the user has full paid access  → never locked.
     *   2. If the course is NOT is_freemium  → all sprints locked without
     *      payment (standard premium behaviour).
     *   3. If the course IS is_freemium      → sprints 1–FREE_SPRINT_LIMIT
     *      are free; everything beyond is locked.
     */
    private function isSprintLocked(
        bool $userHasFullAccess,
        bool $courseIsFreemium,
        int  $sprintNumber
    ): bool {
        if ($userHasFullAccess) {
            return false;
        }

        // Fully premium course with no freemium tier — all sprints locked
        if (!$courseIsFreemium) {
            return true;
        }

        // Freemium course — first N sprints are free previews
        return $sprintNumber > self::FREE_SPRINT_LIMIT;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/courses/{courseId}/resources
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Get all resources for a specific course.
     *
     * Locked sprints are returned with:
     *   • is_locked = true
     *   • items stripped of text_content and download_url (only id/title/type
     *     remain so the frontend can render a locked placeholder row)
     */
    public function getCourseResources(Request $request, string $courseId): JsonResponse
    {
        $userId = $request->user()->id;

        $course         = Course::where('course_id', $courseId)->firstOrFail();
        $hasFullAccess  = $this->userHasFullAccess($userId, $courseId);
        $isFreemium     = (bool) $course->is_freemium;

        // Get course materials with progress
        $materials = CourseMaterial::where('course_id', $courseId)
            ->with(['items'])
            ->orderBy('order')
            ->get()
            ->map(function ($material) use ($userId, $hasFullAccess, $isFreemium) {

                $locked = $this->isSprintLocked(
                    $hasFullAccess,
                    $isFreemium,
                    $material->sprint_number
                );

                // Only create/fetch progress records for accessible sprints
                $progress = SprintProgress::firstOrCreate(
                    [
                        'user_id'            => $userId,
                        'course_material_id' => $material->id,
                        'course_id'          => $material->course_id,
                    ],
                    [
                        'progress_percentage' => 0,
                        'completed_items'     => 0,
                        'total_items'         => $material->items->count(),
                    ]
                );

                $items = $material->items->map(function ($item) use ($userId, $locked) {
                    // For locked sprints: return minimal metadata only — no content
                    if ($locked) {
                        return [
                            'id'           => $item->id,
                            'title'        => $item->title,
                            'type'         => $item->type,
                            'file_size'    => $item->file_size,
                            'download_url' => null,
                            'text_content' => null,
                            'is_completed' => false,
                            'is_locked'    => true,
                            'order'        => $item->order ?? 0,
                        ];
                    }

                    // Unlocked — full data
                    $itemProgress = MaterialItemProgress::where('user_id', $userId)
                        ->where('material_item_id', $item->id)
                        ->first();

                    $downloadUrl = null;
                    if ($item->file_path && Storage::disk('public')->exists($item->file_path)) {
                        $downloadUrl = Storage::url($item->file_path);
                    } elseif ($item->file_url) {
                        $downloadUrl = $item->file_url;
                    }

                    return [
                        'id'           => $item->id,
                        'title'        => $item->title,
                        'type'         => $item->type,
                        'file_size'    => $item->file_size,
                        'download_url' => $downloadUrl,
                        'text_content' => $item->text_content ?? null,
                        'is_completed' => $itemProgress ? $itemProgress->is_completed : false,
                        'is_locked'    => false,
                        'order'        => $item->order ?? 0,
                    ];
                });

                return [
                    'id'                  => $material->id,
                    'sprint_name'         => $material->sprint_name,
                    'sprint_number'       => $material->sprint_number,
                    'progress_percentage' => $locked ? 0 : $progress->progress_percentage,
                    'completed_items'     => $locked ? 0 : $progress->completed_items,
                    'total_items'         => $progress->total_items,
                    'is_locked'           => $locked,
                    'items'               => $items,
                ];
            });

        // User statistics
        $statistics = UserCourseStatistic::firstOrCreate(
            ['user_id' => $userId, 'course_id' => $courseId],
            [
                'overall_progress'   => 0,
                'total_sprints'      => $materials->count(),
                'completed_sprints'  => 0,
                'time_spent_minutes' => 0,
                'sprints_ahead'      => 0,
            ]
        );

        // External resources
        $externalResources = [
            'video_tutorials' => ExternalResource::where('course_id', $courseId)
                ->where('category', 'video_tutorials')
                ->orderBy('order')->get(),
            'industry_articles' => ExternalResource::where('course_id', $courseId)
                ->where('category', 'industry_articles')
                ->orderBy('order')->get(),
            'recommended_reading' => ExternalResource::where('course_id', $courseId)
                ->where('category', 'recommended_reading')
                ->orderBy('order')->get(),
        ];

        // Achievement badges
        $badges = AchievementBadge::where('course_id', $courseId)
            ->get()
            ->map(function ($badge) use ($userId) {
                $unlocked = UserBadge::where('user_id', $userId)
                    ->where('achievement_badge_id', $badge->id)
                    ->first();

                return [
                    'id'          => $badge->id,
                    'name'        => $badge->name,
                    'description' => $badge->description,
                    'badge_color' => $badge->badge_color,
                    'unlock_type' => $badge->unlock_type,
                    'unlock_value'=> $badge->unlock_value,
                    'is_unlocked' => $unlocked !== null,
                    'unlocked_at' => $unlocked ? $unlocked->unlocked_at : null,
                ];
            });

        // Cohort leaderboard
        $cohort = CohortLeaderboard::where('course_id', $courseId)
            ->with(['participants.user'])
            ->latest()
            ->first();

        $leaderboard = null;
        if ($cohort) {
            $leaderboard = [
                'cohort_name'  => $cohort->cohort_name,
                'participants' => $cohort->participants->map(function ($participant) use ($userId) {
                    return [
                        'rank'          => $participant->rank,
                        'user_id'       => $participant->user_id,
                        'user_name'     => $participant->user?->name ?? 'Unknown',
                        'sprint1_score' => $participant->sprint1_score,
                        'sprint2_score' => $participant->sprint2_score,
                        'sprint3_score' => $participant->sprint3_score,
                        'sprint4_score' => $participant->sprint4_score,
                        'overall_score' => $participant->overall_score,
                        'is_current_user' => $participant->user_id === $userId,
                    ];
                }),
            ];
        }

        $courseAverage = CohortLeaderboard::where('course_id', $courseId)
            ->with('participants')
            ->get()
            ->flatMap->participants
            ->avg('overall_score') ?? 0;

        // Expose freemium metadata so the frontend can render upgrade CTAs
        $freemiumMeta = [
            'is_freemium'       => $isFreemium,
            'free_sprint_limit' => self::FREE_SPRINT_LIMIT,
            'user_has_access'   => $hasFullAccess,
        ];

        return response()->json([
            'materials'          => $materials,
            'statistics'         => [
                'overall_progress'  => $statistics->overall_progress,
                'time_spent'        => $this->formatTimeSpent($statistics->time_spent_minutes),
                'sprints_ahead'     => $statistics->sprints_ahead,
                'completed_sprints' => $statistics->completed_sprints,
                'total_sprints'     => $statistics->total_sprints,
            ],
            'external_resources' => $externalResources,
            'badges'             => $badges,
            'leaderboard'        => $leaderboard,
            'course_average'     => round($courseAverage, 2),
            'freemium_meta'      => $freemiumMeta,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/courses/{courseId}/items/{itemId}/complete
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Mark material item as completed.
     * Rejects the request if the item belongs to a locked sprint.
     */
    public function markItemCompleted(Request $request, int $itemId): JsonResponse
    {
        $userId      = $request->user()->id;
        $materialItem = MaterialItem::findOrFail($itemId);

        // ── Freemium guard ────────────────────────────────────────────────────
        $courseMaterial = CourseMaterial::with('items')->find($materialItem->course_material_id);
        $courseId       = $courseMaterial->course_id;
        $course         = Course::where('course_id', $courseId)->first();

        $hasFullAccess = $this->userHasFullAccess($userId, $courseId);
        $locked        = $this->isSprintLocked(
            $hasFullAccess,
            (bool) ($course->is_freemium ?? false),
            $courseMaterial->sprint_number
        );

        if ($locked) {
            return response()->json([
                'message' => 'This sprint is locked. Please enroll to continue learning.',
                'locked'  => true,
            ], 403);
        }
        // ── End guard ─────────────────────────────────────────────────────────

        MaterialItemProgress::updateOrCreate(
            ['user_id' => $userId, 'material_item_id' => $itemId],
            ['is_completed' => true, 'completed_at' => now()]
        );

        $this->updateSprintProgress($userId, $materialItem->course_material_id);
        $this->updateCourseStatistics($userId, $courseId);
        $this->checkAndUnlockBadges($userId, $courseId);

        // Sprint completion email + performance tracking
        $sprintProgress = SprintProgress::where('user_id', $userId)
            ->where('course_material_id', $materialItem->course_material_id)
            ->first();

        if ($sprintProgress && $sprintProgress->progress_percentage >= 100) {
            $this->firSprintCompletedEmail($userId, $courseId, $courseMaterial);
        }

        return response()->json(['message' => 'Item marked as completed']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // All methods below are unchanged from your original file
    // ─────────────────────────────────────────────────────────────────────────

    private function firSprintCompletedEmail(int $userId, string $courseId, CourseMaterial $sprint): void
    {
        $emailKey = "sprint_completed_{$sprint->id}";

        if (EmailSequenceLog::sentWithinHours($userId, $emailKey, 1, $courseId)) {
            return;
        }

        $user = \App\Models\User::find($userId);
        if (!$user) return;

        $totalSprints     = CourseMaterial::where('course_id', $courseId)->count();
        $completedSprints = SprintProgress::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->where('progress_percentage', 100)
            ->count();

        $progressPercent = $totalSprints > 0
            ? round(($completedSprints / $totalSprints) * 100)
            : 0;

        $courseName = \DB::table('courses')->where('course_id', $courseId)->value('title') ?? $courseId;

        try {
            Mail::to($user->email)->queue(
                new SprintCompletedMail(
                    user:            $user,
                    sprintName:      $sprint->sprint_name,
                    sprintNumber:    $sprint->sprint_number,
                    courseName:      $courseName,
                    progressPercent: $progressPercent,
                    totalSprints:    $totalSprints
                )
            );

            EmailSequenceLog::record($userId, $emailKey, $courseId, [
                'sprint_number' => $sprint->sprint_number,
                'progress'      => $progressPercent,
            ]);

            Log::info('✅ Sprint completed email queued', [
                'user_id'       => $userId,
                'sprint_number' => $sprint->sprint_number,
                'course_id'     => $courseId,
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Failed to queue sprint completed email', [
                'error' => $e->getMessage(),
            ]);
        }

        try {
            app(UserPerformanceTracker::class)
                ->onSprintCompleted($userId, $courseId, $sprint->sprint_number);
        } catch (\Exception $e) {
            Log::error('❌ Performance tracker failed', ['error' => $e->getMessage()]);
        }
    }

    public function markItemIncomplete(Request $request, int $itemId): JsonResponse
    {
        $userId = $request->user()->id;

        $materialItem = MaterialItem::findOrFail($itemId);

        // ── Freemium guard ────────────────────────────────────────────────────
        $courseMaterial = CourseMaterial::find($materialItem->course_material_id);
        $courseId       = $courseMaterial->course_id;
        $course         = Course::where('course_id', $courseId)->first();

        $hasFullAccess = $this->userHasFullAccess($userId, $courseId);
        $locked        = $this->isSprintLocked(
            $hasFullAccess,
            (bool) ($course->is_freemium ?? false),
            $courseMaterial->sprint_number
        );

        if ($locked) {
            return response()->json([
                'message' => 'This sprint is locked.',
                'locked'  => true,
            ], 403);
        }
        // ─────────────────────────────────────────────────────────────────────

        MaterialItemProgress::updateOrCreate(
            ['user_id' => $userId, 'material_item_id' => $itemId],
            ['is_completed' => false, 'completed_at' => null]
        );

        $this->updateSprintProgress($userId, $materialItem->course_material_id);
        $this->updateCourseStatistics($userId, $courseId);

        return response()->json(['message' => 'Item marked as incomplete']);
    }

    public function downloadMaterial(Request $request, int $itemId): mixed
    {
        $userId      = $request->user()->id;
        $materialItem = MaterialItem::findOrFail($itemId);

        // ── Freemium guard ────────────────────────────────────────────────────
        $courseMaterial = CourseMaterial::find($materialItem->course_material_id);
        $courseId       = $courseMaterial->course_id;
        $course         = Course::where('course_id', $courseId)->first();

        $hasFullAccess = $this->userHasFullAccess($userId, $courseId);
        $locked        = $this->isSprintLocked(
            $hasFullAccess,
            (bool) ($course->is_freemium ?? false),
            $courseMaterial->sprint_number
        );

        if ($locked) {
            return response()->json([
                'message' => 'This sprint is locked. Please enroll to download materials.',
                'locked'  => true,
            ], 403);
        }
        // ─────────────────────────────────────────────────────────────────────

        if ($materialItem->type === 'text') {
            if (empty($materialItem->text_content)) {
                return response()->json(['error' => 'No text content available'], 404);
            }
            return response($materialItem->text_content, 200, [
                'Content-Type'        => 'text/plain; charset=UTF-8',
                'Content-Disposition' => 'inline; filename="' . $materialItem->title . '.txt"',
            ]);
        }

        if (!$materialItem->file_path) {
            return response()->json(['error' => 'No file available for download'], 404);
        }

        if (!Storage::disk('public')->exists($materialItem->file_path)) {
            Log::error('Material file missing from storage', [
                'item_id'   => $itemId,
                'file_path' => $materialItem->file_path,
            ]);
            return response()->json(['error' => 'File not found on server'], 404);
        }

        $extension    = pathinfo($materialItem->file_path, PATHINFO_EXTENSION);
        $downloadName = $materialItem->title;
        if (!str_ends_with(strtolower($downloadName), '.' . strtolower($extension))) {
            $downloadName .= '.' . $extension;
        }

        return Storage::disk('public')->download($materialItem->file_path, $downloadName);
    }

    public function getPreviewUrl(Request $request, int $itemId): JsonResponse
    {
        $userId      = $request->user()->id;
        $materialItem = MaterialItem::findOrFail($itemId);

        // ── Freemium guard ────────────────────────────────────────────────────
        $courseMaterial = CourseMaterial::find($materialItem->course_material_id);
        $courseId       = $courseMaterial->course_id;
        $course         = Course::where('course_id', $courseId)->first();

        $hasFullAccess = $this->userHasFullAccess($userId, $courseId);
        $locked        = $this->isSprintLocked(
            $hasFullAccess,
            (bool) ($course->is_freemium ?? false),
            $courseMaterial->sprint_number
        );

        if ($locked) {
            return response()->json([
                'message' => 'This sprint is locked.',
                'locked'  => true,
            ], 403);
        }
        // ─────────────────────────────────────────────────────────────────────

        if (!$materialItem->file_path) {
            return response()->json(['error' => 'No file available'], 404);
        }

        if (!Storage::disk('public')->exists($materialItem->file_path)) {
            return response()->json(['error' => 'File not found on server'], 404);
        }

        $url = Storage::disk('public')->url($materialItem->file_path);

        if (!str_starts_with($url, 'http')) {
            $url = config('app.url') . $url;
        }

        return response()->json([
            'url'   => $url,
            'type'  => $materialItem->type,
            'title' => $materialItem->title,
        ]);
    }

    private function updateSprintProgress(int $userId, int $courseMaterialId): void
    {
        $courseMaterial = CourseMaterial::with('items')->findOrFail($courseMaterialId);

        $totalItems     = $courseMaterial->items->count();
        $completedItems = MaterialItemProgress::where('user_id', $userId)
            ->whereIn('material_item_id', $courseMaterial->items->pluck('id'))
            ->where('is_completed', true)
            ->count();

        $progressPercentage = $totalItems > 0 ? ($completedItems / $totalItems) * 100 : 0;

        SprintProgress::updateOrCreate(
            [
                'user_id'            => $userId,
                'course_material_id' => $courseMaterialId,
                'course_id'          => $courseMaterial->course_id,
            ],
            [
                'progress_percentage' => round($progressPercentage, 2),
                'completed_items'     => $completedItems,
                'total_items'         => $totalItems,
                'completed_at'        => $progressPercentage >= 100 ? now() : null,
            ]
        );
    }

    private function updateCourseStatistics(int $userId, string $courseId): void
    {
        $totalSprints = CourseMaterial::where('course_id', $courseId)->count();

        $completedSprints = SprintProgress::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->where('progress_percentage', 100)
            ->count();

        $averageProgress = SprintProgress::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->avg('progress_percentage') ?? 0;

        UserCourseStatistic::updateOrCreate(
            ['user_id' => $userId, 'course_id' => $courseId],
            [
                'overall_progress'  => round($averageProgress, 2),
                'total_sprints'     => $totalSprints,
                'completed_sprints' => $completedSprints,
                'sprints_ahead'     => $completedSprints,
            ]
        );
    }

    private function checkAndUnlockBadges(int $userId, string $courseId): void
    {
        $completedSprints = SprintProgress::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->where('progress_percentage', 100)
            ->get();

        foreach ($completedSprints as $sprint) {
            $courseMaterial = CourseMaterial::find($sprint->course_material_id);

            $badge = AchievementBadge::where('course_id', $courseId)
                ->where('unlock_type', 'sprint_completion')
                ->where('unlock_value', $courseMaterial->sprint_number)
                ->first();

            if ($badge) {
                UserBadge::firstOrCreate(
                    ['user_id' => $userId, 'achievement_badge_id' => $badge->id],
                    ['unlocked_at' => now()]
                );
            }
        }

        $statistics = UserCourseStatistic::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->first();

        if ($statistics && $statistics->overall_progress >= 100) {
            $completionBadge = AchievementBadge::where('course_id', $courseId)
                ->where('unlock_type', 'course_completion')
                ->first();

            if ($completionBadge) {
                UserBadge::firstOrCreate(
                    ['user_id' => $userId, 'achievement_badge_id' => $completionBadge->id],
                    ['unlocked_at' => now()]
                );
            }
        }
    }

    private function formatTimeSpent(int $minutes): string
    {
        $hours = floor($minutes / 60);
        $mins  = $minutes % 60;

        return $hours > 0 ? "{$hours}h {$mins}m" : "{$mins}m";
    }

    public function updateTimeSpent(Request $request, string $courseId): JsonResponse
    {
        $request->validate([
            'minutes' => 'required|integer|min:1',
        ]);

        $userId     = $request->user()->id;
        $statistics = UserCourseStatistic::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->firstOrFail();

        $statistics->increment('time_spent_minutes', $request->minutes);

        return response()->json([
            'message'    => 'Time updated',
            'total_time' => $this->formatTimeSpent($statistics->time_spent_minutes),
        ]);
    }
}