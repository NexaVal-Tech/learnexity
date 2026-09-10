<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserBadge;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BadgeController extends Controller
{
    /**
     * The authenticated user's earned badges, newest first.
     */
    public function mine(Request $request): JsonResponse
    {
        $badges = UserBadge::where('user_id', $request->user()->id)
            ->with('badge')
            ->latest('unlocked_at')
            ->get()
            ->map(fn ($ub) => [
                'id'               => $ub->badge->id,
                'user_badge_id'    => $ub->id,
                'name'             => $ub->badge->name,
                'description'      => $ub->badge->description,
                'badge_icon'       => $ub->badge->badge_icon,
                'badge_color'      => $ub->badge->badge_color,
                'course_id'        => $ub->badge->course_id,
                'unlocked_at'      => $ub->unlocked_at,
                'reference_number' => $ub->reference_number,
                'download_url'     => $ub->download_url,
            ]);

        return response()->json(['badges' => $badges]);
    }

    /**
     * Download the learner's own rendered badge PDF. Not payment-gated
     * (badges today have no such gate anywhere in the app) — just an
     * ownership check.
     */
    public function download(Request $request, int $userBadgeId)
    {
        $userBadge = \App\Models\UserBadge::where('id', $userBadgeId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if (! $userBadge->pdf_path || ! \Illuminate\Support\Facades\Storage::disk('local')->exists($userBadge->pdf_path)) {
            return response()->json(['message' => 'This badge has not been rendered yet.'], 404);
        }

        return \Illuminate\Support\Facades\Storage::disk('local')->response(
            $userBadge->pdf_path,
            "badge-{$userBadge->reference_number}.pdf"
        );
    }
}
