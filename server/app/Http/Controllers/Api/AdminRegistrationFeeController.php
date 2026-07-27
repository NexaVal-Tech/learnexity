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
     */
    public function getSettings(): JsonResponse
    {
        $settings = RegistrationFeeSetting::current();

        return response()->json([
            'price_usd' => (float) $settings->price_usd,
            'price_ngn' => (float) $settings->price_ngn,
        ]);
    }

    /**
     * Admin: update the flat fee. This is a single platform-wide value —
     * it is not per-course.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'price_usd' => 'required|numeric|min:0',
            'price_ngn' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $settings = RegistrationFeeSetting::current();
        $settings->update($request->only(['price_usd', 'price_ngn']));

        return response()->json([
            'message'   => 'Registration fee updated successfully',
            'price_usd' => (float) $settings->price_usd,
            'price_ngn' => (float) $settings->price_ngn,
        ]);
    }

    /**
     * Public: the amount a visitor in their detected location would pay,
     * for display on the scholarship result / payment pages.
     */
    public function publicPricing(): JsonResponse
    {
        $currency = LocationService::detectCurrency();
        $settings = RegistrationFeeSetting::current();

        return response()->json([
            'currency' => $currency,
            'amount'   => $settings->priceForCurrency($currency),
        ]);
    }
}