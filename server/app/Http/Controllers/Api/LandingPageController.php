<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LandingPageSetting;
use App\Models\RegistrationFeeSetting;
use App\Services\LocationService;
use App\Services\TeamDirectory;
use Illuminate\Http\JsonResponse;

/**
 * GET /api/landing — everything the marketing landing page needs:
 * content (admin-edited), live registration fees per pathway in the
 * visitor's currency, the instructors from Meet Our Team, and the
 * Meta Pixel ID.
 */
class LandingPageController extends Controller
{
    public function show(): JsonResponse
    {
        $setting = LandingPageSetting::current();
        $content = $setting->mergedContent();

        $country = null;
        try {
            $country = LocationService::getLocationInfo()['country_code'] ?? null;
        } catch (\Throwable $e) {
            $country = null;
        }

        // Naira only when every row has a naira regular price; otherwise
        // show everything in dollars so the two columns always match.
        $rows = $content['offer']['rows'] ?? [];
        $allNgn = $rows && collect($rows)->every(fn ($r) => !empty($r['regular_ngn']));
        $currency = ($country === 'NG' && $allNgn) ? 'NGN' : 'USD';

        $fees = RegistrationFeeSetting::current();
        $catFor = [
            'deeptech'    => RegistrationFeeSetting::CATEGORY_DEEPTECH,
            'accelerator' => RegistrationFeeSetting::CATEGORY_INTERMEDIATE,
            'flex'        => RegistrationFeeSetting::CATEGORY_FLEXIBLE,
        ];
        $content['offer']['rows'] = array_map(function ($r) use ($fees, $catFor, $currency) {
            $r['fee'] = (float) $fees->priceForCategory($catFor[$r['pathway']] ?? RegistrationFeeSetting::CATEGORY_FLEXIBLE, $currency);
            $r['regular'] = $currency === 'NGN' ? $r['regular_ngn'] : $r['regular_usd'];
            unset($r['regular_usd'], $r['regular_ngn']);
            return $r;
        }, $rows);

        // Instructors from Meet Our Team — the names picked in the admin
        // (in that order), matched tolerantly ("Mary-Jules" = "Mary Jules",
        // extra middle names / titles are fine); otherwise everyone whose
        // role says instructor / tutor / engineer / coach / mentor.
        $all = collect(TeamDirectory::members());
        $wantedNames = array_values(array_filter(array_map('strval', $content['instructors']['names'] ?? [])));
        if ($wantedNames) {
            $picked = [];
            foreach ($wantedNames as $wanted) {
                $hit = $all->first(fn ($m) => self::sameName($wanted, (string) $m['name']) && !in_array($m['name'], array_column($picked, 'name'), true));
                if ($hit) $picked[] = $hit;
            }
            $selected = collect($picked);
        }
        if (!$wantedNames || $selected->isEmpty()) {
            $selected = $all->filter(fn ($m) => (bool) preg_match('/instructor|tutor|engineer|coach|mentor/i', (string) ($m['role'] ?? '')));
        }
        $members = $selected
            ->map(function ($m) {
                $img = (string) ($m['image'] ?? '');
                if ($img !== '' && str_starts_with($img, '/')) {
                    // Website (/images/...) paths live on the main site.
                    $img = rtrim((string) config('app.frontend_url', 'https://learnexity.org'), '/') . $img;
                }
                return [
                    'name'     => $m['name'],
                    'role'     => $m['role'],
                    'image'    => $img ?: null,
                    'linkedin' => $m['linkedin'] ?: null,
                ];
            })
            ->values();

        // Never expose the notification address publicly.
        unset($content['webinar_form']['notify_email']);

        return response()->json([
            'content'       => $content,
            'currency'      => $currency,
            'instructors'   => $members,
            'meta_pixel_id' => $setting->meta_pixel_id,
            'server_time'   => now()->toIso8601String(),
        ]);
    }

    /** Same person? Words compared without case, punctuation or accents. */
    private static function sameName(string $a, string $b): bool
    {
        $words = function (string $n): array {
            $n = mb_strtolower($n);
            $n = preg_replace('/\b(mr|mrs|ms|miss|dr|prof|engr|mba|phd|msc|bsc)\b\.?/u', ' ', $n) ?? $n;
            $n = preg_replace('/[^\p{L}\p{N}]+/u', ' ', $n) ?? $n;
            return array_values(array_unique(array_filter(explode(' ', trim($n)))));
        };
        $wa = $words($a);
        $wb = $words($b);
        if (!$wa || !$wb) return false;
        if ($wa === $wb) return true;
        $common = count(array_intersect($wa, $wb));
        $shorter = min(count($wa), count($wb));
        // Every word of the shorter name appears in the longer one, and at
        // least two words match (so "Mary" alone never matches "Mary Eze").
        return $common === $shorter && $common >= min(2, max(count($wa), count($wb)));
    }
}
