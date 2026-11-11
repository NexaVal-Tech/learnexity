<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LandingPageSetting;
use App\Models\RegistrationFeeSetting;
use App\Services\TeamDirectory;
use App\Support\LandingPageDefaults;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Admin → Landing Page (permission: landing).
 *   GET  /api/admin/landing          content + defaults + live fees + team names
 *   PUT  /api/admin/landing          { content, meta_pixel_id }
 *   POST /api/admin/landing/image    multipart image → { url }
 *   POST /api/admin/landing/reset    back to the default content
 */
class AdminLandingController extends Controller
{
    public function show(): JsonResponse
    {
        $s = LandingPageSetting::current();
        $fees = RegistrationFeeSetting::current();

        return response()->json([
            'content'       => $s->mergedContent(),
            'defaults'      => LandingPageDefaults::content(),
            'meta_pixel_id' => $s->meta_pixel_id,
            'fees'          => [
                'deeptech'    => ['usd' => (float) $fees->deeptech_price_usd,     'ngn' => (float) $fees->deeptech_price_ngn],
                'accelerator' => ['usd' => (float) $fees->intermediate_price_usd, 'ngn' => (float) $fees->intermediate_price_ngn],
                'flex'        => ['usd' => (float) $fees->flexible_price_usd,     'ngn' => (float) $fees->flexible_price_ngn],
            ],
            'team'          => collect(TeamDirectory::members())->map(fn ($m) => ['name' => $m['name'], 'role' => $m['role']])->values(),
            'page_url'      => config('app.landing_url'),
            'updated_at'    => optional($s->updated_at)->toIso8601String(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'content'       => 'required|array',
            'meta_pixel_id' => ['nullable', 'string', 'max:30', 'regex:/^\d{5,25}$/'],
        ], [
            'meta_pixel_id.regex' => 'The Meta Pixel ID should be numbers only (from Meta Events Manager).',
        ]);

        $s = LandingPageSetting::current();
        $s->update([
            'content'       => LandingPageDefaults::sanitize($request->input('content', [])),
            'meta_pixel_id' => $request->input('meta_pixel_id') ?: null,
            'updated_by'    => optional($request->user('admin') ?? $request->user())->id,
        ]);

        return response()->json(['message' => 'Landing page saved', 'content' => $s->fresh()->mergedContent()]);
    }

    public function reset(): JsonResponse
    {
        $s = LandingPageSetting::current();
        $s->update(['content' => null]);
        return response()->json(['message' => 'Landing page reset to the default content', 'content' => $s->fresh()->mergedContent()]);
    }

    /** Image upload (checked without relying on the fileinfo extension). */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate(['image' => 'required|file|max:6144']);
        $file = $request->file('image');

        $ext = strtolower($file->getClientOriginalExtension());
        $info = @getimagesize($file->getRealPath());
        $types = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'];
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true) || !$info || !isset($types[$info[2]])) {
            throw ValidationException::withMessages(['image' => ['Upload a JPG, PNG or WebP image (max 6 MB).']]);
        }

        $disk = Storage::disk('public');
        if (!$disk->exists('landing')) $disk->makeDirectory('landing');
        $path = $disk->putFileAs('landing', $file, Str::random(32) . '.' . $types[$info[2]]);
        if (!$path) {
            return response()->json(['message' => 'Could not save the image (check storage permissions).'], 500);
        }

        return response()->json(['url' => rtrim((string) config('app.url'), '/') . '/storage/' . $path]);
    }
}
