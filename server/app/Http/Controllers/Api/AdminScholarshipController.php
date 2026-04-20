<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Scholarship;

class AdminScholarshipController extends Controller
{
    // ─────────────────────────────────────────────
    // GET /api/admin/scholarships/stats
    // ─────────────────────────────────────────────
    public function stats()
    {
        return response()->json([
            'total' => Scholarship::count(),
            'pending' => Scholarship::where('status', 'pending')->count(),
            'approved' => Scholarship::where('status', 'approved')->count(),
            'rejected' => Scholarship::where('status', 'rejected')->count(),
        ]);
    }

    // ─────────────────────────────────────────────
    // GET /api/admin/scholarships
    // ─────────────────────────────────────────────
    public function index(Request $request)
    {
        $query = Scholarship::with('user')
            ->orderBy('created_at', 'desc');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where('course_name', 'like', "%{$request->search}%");
        }

        $perPage = $request->per_page ?? 20;

        return response()->json(
            $query->paginate($perPage)
        );
    }

    // ─────────────────────────────────────────────
    // PATCH /api/admin/scholarships/{id}/review
    // ─────────────────────────────────────────────
    public function review(Request $request, $id)
    {
        $scholarship = Scholarship::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'review_notes' => 'nullable|string',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
        ]);

        $scholarship->update($validated);

        return response()->json([
            'message' => 'Scholarship reviewed successfully',
            'scholarship' => $scholarship
        ]);
    }
}