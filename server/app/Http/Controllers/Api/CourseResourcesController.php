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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CourseResourcesController extends Controller
{
    /**
     * Get all resources for a specific course
     */
    public function getCourseResources(Request $request, string $courseId): JsonResponse
    {
        $userId = $request->user()->id;

        // Get course materials with progress
        $materials = CourseMaterial::where('course_id', $courseId)
            ->with(['items'])
            ->orderBy('order')
            ->get()
            ->map(function ($material) use ($userId) {
                $progress = SprintProgress::firstOrCreate(
                    [
                        'user_id' => $userId,
                        'course_material_id' => $material->id,
                        'course_id' => $material->course_id,
                    ],
                    [
                        'progress_percentage' => 0,
                        'completed_items' => 0,
                        'total_items' => $material->items->count(),
                    ]
                );

                return [
                    'id' => $material->id,
                    'sprint_name' => $material->sprint_name,
                    'sprint_number' => $material->sprint_number,
                    'progress_percentage' => $progress->progress_percentage,
                    'completed_items' => $progress->completed_items,
                    'total_items' => $progress->total_items,
                    'items' => $material->items->map(function ($item) use ($userId) {
                        $itemProgress = MaterialItemProgress::where('user_id', $userId)
                            ->where('material_item_id', $item->id)
                            ->first();

                        // Fix: Check if file exists and generate proper URL
                        $downloadUrl = null;
                        if ($item->file_path) {
                            // Check if file exists in storage
                            if (Storage::disk('public')->exists($item->file_path)) {
                                $downloadUrl = Storage::url($item->file_path);
                            }
                        } elseif ($item->file_url) {
                            // Use external URL if provided
                            $downloadUrl = $item->file_url;
                        }

                        return [
                            'id' => $item->id,
                            'title' => $item->title,
                            'type' => $item->type,
                            'file_size' => $item->file_size,
                            'download_url' => $downloadUrl,
                            'is_completed' => $itemProgress ? $itemProgress->is_completed : false,
                        ];
                    }),
                ];
            });

        // Get user statistics
        $statistics = UserCourseStatistic::firstOrCreate(
            [
                'user_id' => $userId,
                'course_id' => $courseId,
            ],
            [
                'overall_progress' => 0,
                'total_sprints' => $materials->count(),
                'completed_sprints' => 0,
                'time_spent_minutes' => 0,
                'sprints_ahead' => 0,
            ]
        );

        // Get external resources
        $externalResources = [
            'video_tutorials' => ExternalResource::where('course_id', $courseId)
                ->where('category', 'video_tutorials')
                ->orderBy('order')
                ->get(),
            'industry_articles' => ExternalResource::where('course_id', $courseId)
                ->where('category', 'industry_articles')
                ->orderBy('order')
                ->get(),
            'recommended_reading' => ExternalResource::where('course_id', $courseId)
                ->where('category', 'recommended_reading')
                ->orderBy('order')
                ->get(),
        ];

        // Get achievement badges
        $badges = AchievementBadge::where('course_id', $courseId)
            ->get()
            ->map(function ($badge) use ($userId) {
                $unlocked = UserBadge::where('user_id', $userId)
                    ->where('achievement_badge_id', $badge->id)
                    ->first();

                return [
                    'id' => $badge->id,
                    'name' => $badge->name,
                    'description' => $badge->description,
                    'badge_color' => $badge->badge_color,
                    'unlock_type' => $badge->unlock_type,
                    'unlock_value' => $badge->unlock_value,
                    'is_unlocked' => $unlocked !== null,
                    'unlocked_at' => $unlocked ? $unlocked->unlocked_at : null,
                ];
            });

        // Get cohort leaderboard
        $cohort = CohortLeaderboard::where('course_id', $courseId)
            ->with(['participants.user'])
            ->latest()
            ->first();

        $leaderboard = null;
        if ($cohort) {
            $leaderboard = [
                'cohort_name' => $cohort->cohort_name,
                'participants' => $cohort->participants->map(function ($participant) use ($userId) {
                    return [
                        'rank' => $participant->rank,
                        'user_id' => $participant->user_id,
                        'user_name' => $participant->user->name,
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

        // Calculate course averages
        $courseAverage = CohortLeaderboard::where('course_id', $courseId)
            ->with('participants')
            ->get()
            ->flatMap->participants
            ->avg('overall_score') ?? 0;

        return response()->json([
            'materials' => $materials,
            'statistics' => [
                'overall_progress' => $statistics->overall_progress,
                'time_spent' => $this->formatTimeSpent($statistics->time_spent_minutes),
                'sprints_ahead' => $statistics->sprints_ahead,
                'completed_sprints' => $statistics->completed_sprints,
                'total_sprints' => $statistics->total_sprints,
            ],
            'external_resources' => $externalResources,
            'badges' => $badges,
            'leaderboard' => $leaderboard,
            'course_average' => round($courseAverage, 2),
        ]);
    }

    /**
     * Mark material item as completed
     */
    public function markItemCompleted(Request $request, int $itemId): JsonResponse
    {
        $userId = $request->user()->id;

        $materialItem = MaterialItem::findOrFail($itemId);

        // Mark item as completed
        $progress = MaterialItemProgress::updateOrCreate(
            [
                'user_id' => $userId,
                'material_item_id' => $itemId,
            ],
            [
                'is_completed' => true,
                'completed_at' => now(),
            ]
        );

        // Update sprint progress
        $this->updateSprintProgress($userId, $materialItem->course_material_id);

        // Update overall statistics
        $courseMaterial = CourseMaterial::find($materialItem->course_material_id);
        $this->updateCourseStatistics($userId, $courseMaterial->course_id);

        // Check for badge unlocks
        $this->checkAndUnlockBadges($userId, $courseMaterial->course_id);

        return response()->json([
            'message' => 'Item marked as completed',
            'progress' => $progress,
        ]);
    }

    /**
     * Mark material item as incomplete
     */
    public function markItemIncomplete(Request $request, int $itemId): JsonResponse
    {
        $userId = $request->user()->id;

        $materialItem = MaterialItem::findOrFail($itemId);

        // Mark item as incomplete
        MaterialItemProgress::updateOrCreate(
            [
                'user_id' => $userId,
                'material_item_id' => $itemId,
            ],
            [
                'is_completed' => false,
                'completed_at' => null,
            ]
        );

        // Update sprint progress
        $this->updateSprintProgress($userId, $materialItem->course_material_id);

        // Update overall statistics
        $courseMaterial = CourseMaterial::find($materialItem->course_material_id);
        $this->updateCourseStatistics($userId, $courseMaterial->course_id);

        return response()->json([
            'message' => 'Item marked as incomplete',
        ]);
    }

    /**
     * Download course material file
     */
    /**
     * Download course material file
     */
    public function downloadMaterial(Request $request, int $itemId): mixed
    {
        $materialItem = MaterialItem::findOrFail($itemId);

        // Check if file_path exists
        if (!$materialItem->file_path) {
            return response()->json([
                'error' => 'No file available for download'
            ], 404);
        }

        // Check if file exists in public disk
        if (!Storage::disk('public')->exists($materialItem->file_path)) {
            \Log::error('File not found in storage', [
                'item_id' => $itemId,
                'file_path' => $materialItem->file_path,
                'title' => $materialItem->title,
            ]);
            
            return response()->json([
                'error' => 'File not found in storage',
                'debug' => [
                    'file_path' => $materialItem->file_path,
                    'storage_path' => Storage::disk('public')->path($materialItem->file_path),
                ]
            ], 404);
        }

        // Get the file extension
        $extension = pathinfo($materialItem->file_path, PATHINFO_EXTENSION);
        
        // Generate download filename
        $downloadName = $materialItem->title;
        if (!str_ends_with(strtolower($downloadName), '.' . strtolower($extension))) {
            $downloadName .= '.' . $extension;
        }

        return Storage::disk('public')->download(
            $materialItem->file_path,
            $downloadName
        );
    }

    /**
     * Update sprint progress
     */
    private function updateSprintProgress(int $userId, int $courseMaterialId): void
    {
        $courseMaterial = CourseMaterial::with('items')->findOrFail($courseMaterialId);
        
        $totalItems = $courseMaterial->items->count();
        $completedItems = MaterialItemProgress::where('user_id', $userId)
            ->whereIn('material_item_id', $courseMaterial->items->pluck('id'))
            ->where('is_completed', true)
            ->count();

        $progressPercentage = $totalItems > 0 ? ($completedItems / $totalItems) * 100 : 0;

        SprintProgress::updateOrCreate(
            [
                'user_id' => $userId,
                'course_material_id' => $courseMaterialId,
                'course_id' => $courseMaterial->course_id,
            ],
            [
                'progress_percentage' => round($progressPercentage, 2),
                'completed_items' => $completedItems,
                'total_items' => $totalItems,
                'completed_at' => $progressPercentage >= 100 ? now() : null,
            ]
        );
    }

    /**
     * Update overall course statistics
     */
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
            [
                'user_id' => $userId,
                'course_id' => $courseId,
            ],
            [
                'overall_progress' => round($averageProgress, 2),
                'total_sprints' => $totalSprints,
                'completed_sprints' => $completedSprints,
                'sprints_ahead' => $completedSprints,
            ]
        );
    }

    /**
     * Check and unlock badges based on progress
     */
    private function checkAndUnlockBadges(int $userId, string $courseId): void
    {
        // Get user's completed sprints
        $completedSprints = SprintProgress::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->where('progress_percentage', 100)
            ->get();

        // Check sprint completion badges
        foreach ($completedSprints as $sprint) {
            $courseMaterial = CourseMaterial::find($sprint->course_material_id);
            
            $badge = AchievementBadge::where('course_id', $courseId)
                ->where('unlock_type', 'sprint_completion')
                ->where('unlock_value', $courseMaterial->sprint_number)
                ->first();

            if ($badge) {
                UserBadge::firstOrCreate(
                    [
                        'user_id' => $userId,
                        'achievement_badge_id' => $badge->id,
                    ],
                    [
                        'unlocked_at' => now(),
                    ]
                );
            }
        }

        // Check course completion badge
        $statistics = UserCourseStatistic::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->first();

        if ($statistics && $statistics->overall_progress >= 100) {
            $completionBadge = AchievementBadge::where('course_id', $courseId)
                ->where('unlock_type', 'course_completion')
                ->first();

            if ($completionBadge) {
                UserBadge::firstOrCreate(
                    [
                        'user_id' => $userId,
                        'achievement_badge_id' => $completionBadge->id,
                    ],
                    [
                        'unlocked_at' => now(),
                    ]
                );
            }
        }
    }

    /**
     * Format time spent in readable format
     */
    private function formatTimeSpent(int $minutes): string
    {
        $hours = floor($minutes / 60);
        $mins = $minutes % 60;

        if ($hours > 0) {
            return "{$hours}h {$mins}m";
        }

        return "{$mins}m";
    }

    /**
     * Update time spent on course
     */
    public function updateTimeSpent(Request $request, string $courseId): JsonResponse
    {
        $request->validate([
            'minutes' => 'required|integer|min:1',
        ]);

        $userId = $request->user()->id;
        
        $statistics = UserCourseStatistic::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->firstOrFail();

        $statistics->increment('time_spent_minutes', $request->minutes);

        return response()->json([
            'message' => 'Time updated',
            'total_time' => $this->formatTimeSpent($statistics->time_spent_minutes),
        ]);
    }
}