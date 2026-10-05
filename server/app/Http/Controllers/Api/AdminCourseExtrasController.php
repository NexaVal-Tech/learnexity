<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
            'instructor_photos.*'              => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $photos = $request->file('instructor_photos') ?? [];
        $list = [];

        foreach (($request->input('instructors') ?: []) as $i => $row) {
            $name = trim((string) ($row['name'] ?? ''));
            if ($name === '') {
                continue;
            }

            $photo = null;
            if (isset($photos[$i]) && $photos[$i]) {
                $photo = $photos[$i]->store('course-instructors', 'public');
            } elseif (!empty($row['photo_url'])) {
                $photo = $this->keepStoragePath((string) $row['photo_url']);
            }

            $socials = [];
            foreach (($row['socials'] ?? []) as $social) {
                $url = $this->safeUrl($social['url'] ?? null);
                $platform = strtolower(trim((string) ($social['platform'] ?? 'website')));
                if ($url && in_array($platform, self::PLATFORMS, true)) {
                    $socials[] = ['platform' => $platform, 'url' => $url];
                }
            }

            $list[] = [
                'name'    => $name,
                'role'    => trim((string) ($row['role'] ?? '')),
                'photo'   => $photo,
                'website' => $this->safeUrl($row['website'] ?? null),
                'socials' => $socials,
            ];
        }

        $course->update(['course_instructors' => $list]);

        return response()->json(['message' => 'Instructors saved', 'instructors' => $list]);
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
