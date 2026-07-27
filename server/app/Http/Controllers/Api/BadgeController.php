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
                'id'          => $ub->badge->id,
                'name'        => $ub->badge->name,
                'description' => $ub->badge->description,
                'badge_icon'  => $ub->badge->badge_icon,
                'badge_color' => $ub->badge->badge_color,
                'course_id'   => $ub->badge->course_id,
                'unlocked_at' => $ub->unlocked_at,
            ]);

        return response()->json(['badges' => $badges]);
    }
}
