<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Course editor extras: the course's own instructors and the optional
 * slashed ("was") prices shown next to the real track prices.
 */
class AdminCourseExtrasController extends Controller
{
    private const TRACKS = ['self_paced', 'group_mentorship', 'one_on_one', 'intermediate'];
    private const PLATFORMS = ['linkedin', 'x', 'twitter', 'instagram', 'facebook', 'youtube', 'github', 'website'];

    /**
     * POST /api/admin/courses/{courseId}/instructors (multipart)
     *   instructors[i][name], [role], [website], [photo_url] (keep existing),
     *   instructors[i][socials][j][platform|url], instructor_photos[i] (new file)
     */
    public function syncInstructors(Request $request, string $courseId): JsonResponse
    {
        $course = Course::where('course_id', $courseId)->firstOrFail();

        // NOTE: photos are validated by hand below (extension whitelist +
        // getimagesize) instead of Laravel's `image|mimes` rules. Those rules
        // need PHP's fileinfo extension, which many production PHP builds
        // don't ship — when it's missing they throw a LogicException and the
        // whole request 500s, which is what "Server error" was.
        $request->validate([
            'instructors'                      => 'nullable|array|max:12',
            'instructors.*.name'               => 'nullable|string|max:120',
            'instructors.*.role'               => 'nullable|string|max:160',
            'instructors.*.website'            => 'nullable|string|max:500',
            'instructors.*.photo_url'          => 'nullable|string|max:500',
            'instructors.*.socials'            => 'nullable|array|max:8',
            'instructors.*.socials.*.platform' => 'nullable|string|max:30',
            'instructors.*.socials.*.url'      => 'nullable|string|max:500',
            'instructor_photos'                => 'nullable|array',
        ]);

        try {
            $photos = $request->file('instructor_photos') ?? [];
            if (!is_array($photos)) $photos = [];
            $list = [];
            $rows = $request->input('instructors');
            if (!is_array($rows)) $rows = [];

            foreach ($rows as $i => $row) {
                if (!is_array($row)) continue;
                $name = trim(strip_tags((string) ($row['name'] ?? '')));
                if ($name === '') {
                    continue;
                }

                $photo = null;
                $file = $photos[$i] ?? null;
                if ($file instanceof UploadedFile) {
                    $photo = $this->storeInstructorPhoto($file, $name);
                } elseif (!empty($row['photo_url'])) {
                    $photo = $this->keepStoragePath((string) $row['photo_url']);
                }

                $socials = [];
                foreach ((is_array($row['socials'] ?? null) ? $row['socials'] : []) as $social) {
                    if (!is_array($social)) continue;
                    $url = $this->safeUrl($social['url'] ?? null);
                    $platform = strtolower(trim((string) ($social['platform'] ?? 'website')));
                    if ($url && in_array($platform, self::PLATFORMS, true)) {
                        $socials[] = ['platform' => $platform, 'url' => $url];
                    }
                }

                $list[] = [
                    'name'    => $name,
                    'role'    => trim(strip_tags((string) ($row['role'] ?? ''))),
                    'photo'   => $photo,
                    'website' => $this->safeUrl($row['website'] ?? null),
                    'socials' => $socials,
                ];
            }

            $course->course_instructors = $list;
            $course->save();
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error('Saving course instructors failed', [
                'course_id' => $courseId,
                'error'     => $e->getMessage(),
                'file'      => $e->getFile() . ':' . $e->getLine(),
            ]);
            return response()->json([
                'message' => 'Could not save instructors: ' . $e->getMessage(),
            ], 500);
        }

        return response()->json(['message' => 'Instructors saved', 'instructors' => $list]);
    }

    /** Validate + store one instructor photo without relying on fileinfo. */
    private function storeInstructorPhoto(UploadedFile $file, string $name): string
    {
        $label = "Photo for {$name}";
        if (!$file->isValid()) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'instructor_photos' => ["{$label} failed to upload (" . $file->getErrorMessage() . ')'],
            ]);
        }
        if ($file->getSize() > 4 * 1024 * 1024) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'instructor_photos' => ["{$label} must be 4 MB or smaller."],
            ]);
        }
        $ext = strtolower($file->getClientOriginalExtension());
        $info = @getimagesize($file->getRealPath());
        $allowed = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'];
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true) || !$info || !isset($allowed[$info[2]])) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'instructor_photos' => ["{$label} must be a JPG, PNG or WebP image."],
            ]);
        }

        $disk = Storage::disk('public');
        if (!$disk->exists('course-instructors')) {
            $disk->makeDirectory('course-instructors');
        }
        $filename = Str::random(32) . '.' . $allowed[$info[2]];
        $path = $disk->putFileAs('course-instructors', $file, $filename);
        if (!$path) {
            throw new \RuntimeException('the server could not write to storage/app/public/course-instructors (check folder permissions).');
        }
        return $path;
    }

    /**
     * PUT /api/admin/courses/{courseId}/compare-prices
     *   { compare_prices: { self_paced: { usd, ngn }, … } } — empty = not shown
     */
    public function updateComparePrices(Request $request, string $courseId): JsonResponse
    {
        $course = Course::where('course_id', $courseId)->firstOrFail();

        $request->validate([
            'compare_prices'         => 'nullable|array',
            'compare_prices.*.usd'   => 'nullable|numeric|min:0|max:100000000',
            'compare_prices.*.ngn'   => 'nullable|numeric|min:0|max:100000000000',
        ]);

        $out = [];
        foreach (self::TRACKS as $track) {
            $row = $request->input("compare_prices.$track", []);
            $usd = isset($row['usd']) && $row['usd'] !== '' && $row['usd'] !== null ? round((float) $row['usd'], 2) : null;
            $ngn = isset($row['ngn']) && $row['ngn'] !== '' && $row['ngn'] !== null ? round((float) $row['ngn'], 2) : null;
            if ($usd || $ngn) {
                $out[$track] = ['usd' => $usd ?: null, 'ngn' => $ngn ?: null];
            }
        }

        $course->update(['compare_prices' => $out ?: null]);

        return response()->json(['message' => 'Slashed prices saved', 'compare_prices' => $out]);
    }

    private function safeUrl(mixed $url): ?string
    {
        $url = trim((string) $url);
        if ($url === '') return null;
        if (!preg_match('#^https?://#i', $url)) $url = 'https://' . $url;
        return filter_var($url, FILTER_VALIDATE_URL) ? $url : null;
    }

    /** Keep an existing photo: accept a full /storage/ URL or a relative path. */
    private function keepStoragePath(string $value): ?string
    {
        if (preg_match('#/storage/(.+)$#', $value, $m)) {
            return $m[1];
        }
        return preg_match('#^[A-Za-z0-9_./-]+$#', $value) && !str_contains($value, '..') ? ltrim($value, '/') : null;
    }
}
