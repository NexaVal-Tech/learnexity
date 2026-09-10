<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ScholarshipSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminScholarshipSettingController extends Controller
{
    /**
     * Admin: read the current scholarship countdown deadline + on/off flag.
     */
    public function getSettings(): JsonResponse
    {
        $settings = ScholarshipSetting::current();

        return response()->json([
            'deadline'  => $settings->deadline?->toIso8601String(),
            'is_active' => $settings->is_active,
        ]);
    }

    /**
     * Admin: set/clear the deadline and toggle whether the homepage banner
     * shows it. Deadline is optional so the admin can switch the banner
     * off (is_active = false) without losing the previously-configured
     * date.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'deadline'  => 'nullable|date',
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $settings = ScholarshipSetting::current();
        $settings->update($request->only(['deadline', 'is_active']));

        return response()->json([
            'message'   => 'Scholarship countdown settings updated successfully',
            'deadline'  => $settings->deadline?->toIso8601String(),
            'is_active' => $settings->is_active,
        ]);
    }

    /**
     * Public: what the homepage countdown banner reads. Only ever reports
     * a deadline when it should actually be shown — the frontend doesn't
     * need to separately re-derive "is this expired / turned off".
     */
    public function publicDeadline(): JsonResponse
    {
        $settings = ScholarshipSetting::current();

        return response()->json([
            'deadline' => $settings->isCurrentlyActive() ? $settings->deadline?->toIso8601String() : null,
        ]);
    }
}
