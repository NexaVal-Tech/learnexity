<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\KidsCourse;
use App\Models\KidsEnrollment;

class AdminKidsController extends Controller
{
    // ─────────────────────────────────────────────
    // GET /api/admin/kids/courses
    // ─────────────────────────────────────────────
    public function courses()
    {
        $courses = KidsCourse::orderBy('order')->get();

        $stats = [
            'total' => KidsEnrollment::count(),
            'completed' => KidsEnrollment::where('payment_status', 'completed')->count(),
            'pending' => KidsEnrollment::where('payment_status', 'pending')->count(),
            'revenue_usd' => KidsEnrollment::where('currency', 'USD')
                ->where('payment_status', 'completed')
                ->sum('amount_paid'),
            'revenue_ngn' => KidsEnrollment::where('currency', 'NGN')
                ->where('payment_status', 'completed')
                ->sum('amount_paid'),
        ];

        return response()->json([
            'courses' => $courses,
            'stats' => $stats
        ]);
    }

    // ─────────────────────────────────────────────
    // PUT /api/admin/kids/courses/{id}/prices
    // ─────────────────────────────────────────────
    public function updatePrices(Request $request, $id)
    {
        $course = KidsCourse::findOrFail($id);

        $validated = $request->validate([
            'one_on_one_price_usd' => 'sometimes|numeric',
            'group_price_usd' => 'sometimes|numeric',
            'one_on_one_price_ngn' => 'sometimes|numeric',
            'group_price_ngn' => 'sometimes|numeric',

            'bundle_one_on_one_usd' => 'sometimes|numeric',
            'bundle_group_usd' => 'sometimes|numeric',
            'bundle_one_on_one_ngn' => 'sometimes|numeric',
            'bundle_group_ngn' => 'sometimes|numeric',

            'onetime_discount_percent' => 'sometimes|numeric|min:0|max:100',
        ]);

        $course->update($validated);

        return response()->json([
            'message' => 'Prices updated successfully',
            'course' => $course
        ]);
    }

    // ─────────────────────────────────────────────
    // GET /api/admin/kids/enrollments
    // ─────────────────────────────────────────────
    public function enrollments(Request $request)
    {
        $query = KidsEnrollment::with('course')
            ->orderBy('created_at', 'desc');

        if ($request->payment_status) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->track) {
            $query->where('chosen_track', $request->track);
        }

        $perPage = $request->per_page ?? 15;

        return response()->json(
            $query->paginate($perPage)
        );
    }
}