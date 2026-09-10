<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendingFlyerSetting;
use App\Services\CertificateBadgeRenderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class AdminAttendingFlyerController extends Controller
{
    public function __construct(private CertificateBadgeRenderService $renderService)
    {
    }

    public function getSettings(): JsonResponse
    {
        $setting = AttendingFlyerSetting::current();

        return response()->json([
            'setting' => $setting,
            'font_options' => $this->renderService->fontOptions(),
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'slug'                          => 'sometimes|required|string|max:255|alpha_dash|unique:attending_flyer_settings,slug,' . AttendingFlyerSetting::current()->id,
            'is_active'                     => 'sometimes|boolean',
            'page_heading'                  => 'sometimes|string|max:255',
            'background_template'          => 'nullable|image|max:8192',
            'foreground_template'          => 'nullable|image|max:8192',
            'remove_foreground_template'   => 'sometimes|boolean',
            'photo_x_pct'                   => 'sometimes|numeric|min:0|max:100',
            'photo_y_pct'                   => 'sometimes|numeric|min:0|max:100',
            'photo_width_pct'               => 'sometimes|numeric|min:1|max:100',
            'photo_height_pct'              => 'sometimes|numeric|min:1|max:100',
            'fields'                        => 'nullable|string',
        ]);

        $setting = AttendingFlyerSetting::current();

        if (isset($validated['slug'])) {
            $setting->slug = $validated['slug'];
        }
        if ($request->has('is_active')) {
            $setting->is_active = $request->boolean('is_active');
        }
        if (isset($validated['page_heading'])) {
            $setting->page_heading = $validated['page_heading'];
        }
        foreach (['photo_x_pct', 'photo_y_pct', 'photo_width_pct', 'photo_height_pct'] as $key) {
            if (isset($validated[$key])) {
                $setting->{$key} = $validated[$key];
            }
        }

        $fields = $this->decodeFields($request->input('fields'));
        if ($fields !== null) {
            $setting->fields = $fields;
        }

        if ($request->hasFile('background_template')) {
            $this->deleteIfExists($setting->background_template_path);
            $setting->background_template_path = $request->file('background_template')->store('attending-flyer', 'public');
        }
        if ($request->hasFile('foreground_template')) {
            $this->deleteIfExists($setting->foreground_template_path);
            $setting->foreground_template_path = $request->file('foreground_template')->store('attending-flyer', 'public');
        } elseif ($request->boolean('remove_foreground_template')) {
            $this->deleteIfExists($setting->foreground_template_path);
            $setting->foreground_template_path = null;
        }

        $setting->save();

        return response()->json(['message' => 'Attending flyer settings updated', 'setting' => $setting]);
    }

    /**
     * Live preview while editing — takes a sample photo upload + field
     * overrides directly from the request, not what's persisted yet.
     */
    public function previewFlyer(Request $request): Response
    {
        $request->validate([
            'photo' => 'required|image|max:8192',
        ]);

        $setting = AttendingFlyerSetting::current();

        $fields = $this->decodeFields($request->input('fields'));
        if ($fields !== null) {
            $setting->fields = $fields;
        }
        foreach (['photo_x_pct', 'photo_y_pct', 'photo_width_pct', 'photo_height_pct'] as $key) {
            if ($request->filled($key)) {
                $setting->{$key} = (float) $request->input($key);
            }
        }

        try {
            $binary = $this->renderService->renderAttendingFlyer(
                $setting,
                $request->file('photo')->getRealPath(),
                $request->input('preview_name') ?: 'Jane Doe'
            );

            return response($binary, 200)->header('Content-Type', 'image/png');
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    private function decodeFields(?string $json): ?array
    {
        if ($json === null || $json === '') {
            return null;
        }
        $decoded = json_decode($json, true);

        return is_array($decoded) ? $decoded : null;
    }

    private function deleteIfExists(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
