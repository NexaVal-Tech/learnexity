<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RegistrationFeeSetting;
use App\Services\LocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminRegistrationFeeController extends Controller
{
    /**
     * Admin: read current settings.
     *
     * Two tiers now, not one flat fee: "deeptech" (one_on_one /
     * group_mentorship tracks) and "flexible" (self_paced). The old
     * price_usd/price_ngn columns are still returned for any caller that
     * hasn't been updated, but they're no longer read by PricingService.
     */
    public function getSettings(): JsonResponse
    {
        $settings = RegistrationFeeSetting::current();

        return response()->json([
            'price_usd'                       => (float) $settings->price_usd,
            'price_ngn'                       => (float) $settings->price_ngn,
            'deeptech_price_usd'              => (float) $settings->deeptech_price_usd,
            'deeptech_price_ngn'              => (float) $settings->deeptech_price_ngn,
            'flexible_price_usd'              => (float) $settings->flexible_price_usd,
            'flexible_price_ngn'              => (float) $settings->flexible_price_ngn,
            'intermediate_price_usd'          => (float) $settings->intermediate_price_usd,
            'intermediate_price_ngn'          => (float) $settings->intermediate_price_ngn,
            'partial_scholarship_percentage'  => $settings->getPartialScholarshipPercentageValue(),
        ]);
    }

    /**
     * Admin: update the three tiered fees (deep-tech / flexible /
     * intermediate), plus the partial-scholarship percentage. Still
     * platform-wide settings — not configured per individual course.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'deeptech_price_usd'              => 'required|numeric|min:0',
            'deeptech_price_ngn'              => 'required|numeric|min:0',
            'flexible_price_usd'              => 'required|numeric|min:0',
            'flexible_price_ngn'              => 'required|numeric|min:0',
            'intermediate_price_usd'          => 'sometimes|numeric|min:0',
            'intermediate_price_ngn'          => 'sometimes|numeric|min:0',
            'partial_scholarship_percentage'  => 'sometimes|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $settings = RegistrationFeeSetting::current();
        $settings->update($request->only([
            'deeptech_price_usd', 'deeptech_price_ngn',
            'flexible_price_usd', 'flexible_price_ngn',
            'intermediate_price_usd', 'intermediate_price_ngn',
            'partial_scholarship_percentage',
        ]));

        return response()->json([
            'message'                          => 'Registration fee updated successfully',
            'deeptech_price_usd'                => (float) $settings->deeptech_price_usd,
            'deeptech_price_ngn'                => (float) $settings->deeptech_price_ngn,
            'flexible_price_usd'                => (float) $settings->flexible_price_usd,
            'flexible_price_ngn'                => (float) $settings->flexible_price_ngn,
            'intermediate_price_usd'            => (float) $settings->intermediate_price_usd,
            'intermediate_price_ngn'            => (float) $settings->intermediate_price_ngn,
            'partial_scholarship_percentage'    => $settings->getPartialScholarshipPercentageValue(),
        ]);
    }

    /**
     * Public: the amount a visitor in their detected location would pay,
     * for display on the scholarship result / payment pages. Returns both
     * tiers since this endpoint has no course/track context of its own —
     * callers pick whichever applies once they know the course/track.
     */
    public function publicPricing(): JsonResponse
    {
        $currency = LocationService::detectCurrency();
        $settings = RegistrationFeeSetting::current();

        return response()->json([
            'currency'     => $currency,
            'deeptech'     => $settings->priceForCategory(RegistrationFeeSetting::CATEGORY_DEEPTECH, $currency),
            'flexible'     => $settings->priceForCategory(RegistrationFeeSetting::CATEGORY_FLEXIBLE, $currency),
            'intermediate' => $settings->priceForCategory(RegistrationFeeSetting::CATEGORY_INTERMEDIATE, $currency),
        ]);
    }
}