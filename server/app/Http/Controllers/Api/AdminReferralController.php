<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ReferralHistory;
use App\Models\PublicReferrer;

class AdminReferralController extends Controller
{
    // ─────────────────────────────────────────────
    // GET /api/admin/referrals/stats
    // ─────────────────────────────────────────────
    public function stats()
    {
        return response()->json([
            'total_referrals' => ReferralHistory::count(),
            'successful' => ReferralHistory::where('status', 'completed')->count(),
            'pending' => ReferralHistory::where('status', 'pending')->count(),
            'public_referrers' => PublicReferrer::count(),
            'total_earnings' => PublicReferrer::sum('total_earnings'),
        ]);
    }

    // ─────────────────────────────────────────────
    // GET /api/admin/referrals/history
    // ─────────────────────────────────────────────
    public function history(Request $request)
    {
        $query = ReferralHistory::with(['user', 'publicReferrer'])
            ->orderBy('created_at', 'desc');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $perPage = $request->per_page ?? 20;

        return response()->json(
            $query->paginate($perPage)
        );
    }

    // ─────────────────────────────────────────────
    // GET /api/admin/referrals/public-referrers
    // ─────────────────────────────────────────────
    public function publicReferrers(Request $request)
    {
        $query = PublicReferrer::orderBy('created_at', 'desc');

        if ($request->search) {
            $query->where('email', 'like', "%{$request->search}%");
        }

        $perPage = $request->per_page ?? 20;

        return response()->json(
            $query->paginate($perPage)
        );
    }
}