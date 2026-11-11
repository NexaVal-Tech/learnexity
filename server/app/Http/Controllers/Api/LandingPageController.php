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

        // Instructors from Meet Our Team.
        $wanted = array_map(fn ($n) => TeamDirectory::key((string) $n), $content['instructors']['names'] ?? []);
        $members = collect(TeamDirectory::members())
            ->filter(function ($m) use ($wanted) {
                if ($wanted) return in_array(TeamDirectory::key($m['name']), $wanted, true);
                return (bool) preg_match('/instructor|tutor|engineer|coach|mentor/i', (string) ($m['role'] ?? ''));
            })
            ->when($wanted, fn ($c) => $c->sortBy(fn ($m) => array_search(TeamDirectory::key($m['name']), $wanted, true)))
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

        return response()->json([
            'content'       => $content,
            'currency'      => $currency,
            'instructors'   => $members,
            'meta_pixel_id' => $setting->meta_pixel_id,
            'server_time'   => now()->toIso8601String(),
        ]);
    }
}
