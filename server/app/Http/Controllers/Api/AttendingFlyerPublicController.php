<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendingFlyerSetting;
use App\Services\CertificateBadgeRenderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Public, unauthenticated — no nav link points here, it's only reachable
 * via the direct shareable URL. A visitor uploads their own photo + types
 * their name; everything else on the flyer is fixed admin text.
 */
class AttendingFlyerPublicController extends Controller
{
    public function __construct(private CertificateBadgeRenderService $renderService)
    {
    }

    public function show(string $slug): JsonResponse
    {
        $setting = AttendingFlyerSetting::where('slug', $slug)->where('is_active', true)->first();

        if (! $setting) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json([
            'setting' => [
                'slug' => $setting->slug,
                'page_heading' => $setting->page_heading,
                'ready' => (bool) $setting->background_template_path,
            ],
        ]);
    }

    /**
     * POST (not GET) because this accepts a photo file upload —
     * generates and streams the flyer PNG directly.
     */
    public function generate(Request $request, string $slug): Response
    {
        $setting = AttendingFlyerSetting::where('slug', $slug)->where('is_active', true)->first();
        abort_if(! $setting, 404, 'Not found');

        $request->validate([
            'photo' => 'required|image|mimes:jpg,jpeg,png,webp|max:8192',
            'name'  => 'required|string|max:255',
        ]);

        try {
            $binary = $this->renderService->renderAttendingFlyer(
                $setting,
                $request->file('photo')->getRealPath(),
                $request->input('name')
            );

            return response($binary, 200)->header('Content-Type', 'image/png');
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
