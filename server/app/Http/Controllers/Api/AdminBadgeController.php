<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AchievementBadge;
use App\Models\User;
use App\Models\UserBadge;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Global (cross-course) badge management for the admin "Badges" page.
 * Per-course badge CRUD also exists at
 * /admin/courses/{courseId}/resources/badges (AdminCourseResourcesController)
 * — both operate on the same AchievementBadge model.
 */
class AdminBadgeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AchievementBadge::withCount('userBadges')->with('course:course_id,title');

        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        $badges = $query->latest()->get()->map(function ($badge) {
            return [
                'id'            => $badge->id,
                'course_id'     => $badge->course_id,
                'course_title'  => optional($badge->course)->title,
                'name'          => $badge->name,
                'description'   => $badge->description,
                'badge_icon'    => $badge->badge_icon,
                'badge_color'   => $badge->badge_color,
                'unlock_type'   => $badge->unlock_type,
                'unlock_value'  => $badge->unlock_value,
                'holders_count' => $badge->user_badges_count,
                'created_at'    => $badge->created_at,
            ];
        });

        return response()->json(['badges' => $badges]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_id'    => 'required|string|exists:courses,course_id',
            'name'         => 'required|string|max:255',
            'description'  => 'required|string',
            'badge_icon'   => 'nullable|string|max:255',
            'badge_color'  => 'required|string|max:20',
            'unlock_type'  => 'required|in:sprint_completion,course_completion,milestone',
            'unlock_value' => 'required|integer|min:1',
        ]);

        $badge = AchievementBadge::create($validated);

        return response()->json(['message' => 'Badge created', 'badge' => $badge], 201);
    }

    public function update(Request $request, int $badgeId): JsonResponse
    {
        $badge = AchievementBadge::findOrFail($badgeId);

        $validated = $request->validate([
            'name'         => 'sometimes|string|max:255',
            'description'  => 'sometimes|string',
            'badge_icon'   => 'nullable|string|max:255',
            'badge_color'  => 'sometimes|string|max:20',
            'unlock_type'  => 'sometimes|in:sprint_completion,course_completion,milestone',
            'unlock_value' => 'sometimes|integer|min:1',
        ]);

        $badge->update($validated);

        return response()->json(['message' => 'Badge updated', 'badge' => $badge]);
    }

    public function destroy(int $badgeId): JsonResponse
    {
        $badge = AchievementBadge::findOrFail($badgeId);
        $badge->delete();

        return response()->json(['message' => 'Badge deleted']);
    }

    public function holders(int $badgeId): JsonResponse
    {
        $badge = AchievementBadge::findOrFail($badgeId);

        $holders = UserBadge::where('achievement_badge_id', $badgeId)
            ->with('user:id,name,email')
            ->latest('unlocked_at')
            ->get()
            ->map(fn ($ub) => [
                'user_id'     => $ub->user_id,
                'name'        => optional($ub->user)->name,
                'email'       => optional($ub->user)->email,
                'unlocked_at' => $ub->unlocked_at,
            ]);

        return response()->json(['badge' => $badge, 'holders' => $holders]);
    }

    /**
     * Manually award a badge to a user, bypassing the automatic unlock rules.
     */
    public function award(Request $request, int $badgeId): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $badge = AchievementBadge::findOrFail($badgeId);

        $userBadge = UserBadge::firstOrCreate(
            ['user_id' => $validated['user_id'], 'achievement_badge_id' => $badge->id],
            ['unlocked_at' => now()]
        );

        if (! $userBadge->rendered_at) {
            app(\App\Services\DynamicTemplateRenderService::class)->issueBadgeArtifact($userBadge);
        }

        $user = User::find($validated['user_id']);
        if ($user) {
            \App\Services\ActivityLogger::log(
                'badge.manually_awarded',
                "Admin awarded \"{$badge->name}\" to {$user->name}",
                actorType: 'admin',
                actorId: $request->user()?->id,
                metadata: ['badge_id' => $badge->id, 'recipient_id' => $user->id],
                courseId: $badge->course_id,
                request: $request
            );
        }

        return response()->json(['message' => 'Badge awarded', 'user_badge' => $userBadge], 201);
    }

    /** Admin download of a rendered badge PDF — no ownership check. */
    public function downloadArtifact(int $userBadgeId)
    {
        $userBadge = UserBadge::findOrFail($userBadgeId);

        if (! $userBadge->pdf_path || ! \Illuminate\Support\Facades\Storage::disk('local')->exists($userBadge->pdf_path)) {
            return response()->json(['message' => 'This badge has not been rendered yet.'], 404);
        }

        return \Illuminate\Support\Facades\Storage::disk('local')->response(
            $userBadge->pdf_path,
            "badge-{$userBadge->reference_number}.pdf"
        );
    }

    public function revokeAward(int $badgeId, int $userId): JsonResponse
    {
        UserBadge::where('achievement_badge_id', $badgeId)
            ->where('user_id', $userId)
            ->delete();

        return response()->json(['message' => 'Badge award revoked']);
    }

    /**
     * Lightweight user search for the "award badge to a user" picker.
     */
    public function searchUsers(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        if (strlen($q) < 2) {
            return response()->json(['users' => []]);
        }

        $users = User::where('name', 'like', "%{$q}%")
            ->orWhere('email', 'like', "%{$q}%")
            ->limit(10)
            ->get(['id', 'name', 'email']);

        return response()->json(['users' => $users]);
    }
}
