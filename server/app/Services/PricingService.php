<?php

namespace App\Services;

use App\Models\Course;
use App\Models\RegistrationFeeSetting;
use App\Models\Scholarship;
use App\Models\User;

/**
 * Single source of truth for "what does this person actually pay". Used by
 * both the enrollment endpoint (which persists the price on the enrollment
 * row) and the Stripe checkout endpoint (which must charge the exact same
 * number) — previously these two had separate, drifted implementations,
 * which meant a scholarship recipient could be charged a different amount
 * than what the enrollment record said they owed.
 *
 * Business rule (two-tier scholarship model — no more 0%/rejected outcome):
 *  - An approved, unused scholarship with discount_percentage >= 100 for
 *    THIS exact course means the person pays only the flat, admin-configured
 *    registration fee. No one-time discount, no installments — one payment,
 *    in full, always.
 *  - An approved, unused scholarship with a lower discount_percentage (the
 *    admin-configured "partial scholarship" tier, default 50%) means the
 *    person pays that percentage off the course's normal track price,
 *    through the completely normal payment flow — track selection,
 *    installments still available. The course's own one-time-payment
 *    discount does NOT stack on top of this; the scholarship percentage is
 *    the only discount applied.
 *  - Everyone else pays the course's track price, with the one-time
 *    discount applied only when paying in full, and optionally split into
 *    4 installments.
 */
class PricingService
{
    public static function calculate(
        User $user,
        Course $course,
        string $currency,
        string $learningTrack,
        string $paymentType
    ): array {
        $scholarship = Scholarship::where('user_id', $user->id)
            ->where('course_id', $course->course_id)
            ->where('status', 'approved')
            ->where('is_used', false)
            ->first();

        $scholarshipPercent = $scholarship ? (float) $scholarship->discount_percentage : 0;
        $isRegistrationFee  = $scholarship && $scholarshipPercent >= 100;
        $isPartialAward     = $scholarship && $scholarshipPercent > 0 && $scholarshipPercent < 100;

        if ($isRegistrationFee) {
            $regFeeSetting = RegistrationFeeSetting::current();
            $category      = RegistrationFeeSetting::categoryForCourseAndTrack($course, $learningTrack);
            $amount        = $regFeeSetting->priceForCategory($category, $currency);

            return [
                'amount'                       => $amount,
                'is_registration_fee'          => true,
                'scholarship'                  => $scholarship,
                'scholarship_discount_percent' => 100,
                'payment_type'                 => 'onetime', // registration fee is always paid in full
                'installment_amount'           => $amount,
                'total_installments'           => 1,
                'fee_category'                 => $category,
            ];
        }

        $amount = $course->getTrackPriceByCurrency($learningTrack, $currency);

        if ($isPartialAward) {
            // Scholarship discount is the only discount applied — it
            // doesn't stack with the course's own one-time-payment discount.
            $amount = max(0, round($amount * (1 - ($scholarshipPercent / 100)), 2));
        } elseif ($paymentType === 'onetime') {
            $discountPercent = $course->getOneTimeDiscountByCurrency($currency);
            if ($discountPercent > 0) {
                $amount = max(0, round($amount * (1 - ($discountPercent / 100)), 2));
            }
        }

        $installmentAmount = $paymentType === 'installment' ? round($amount / 4, 2) : $amount;

        return [
            'amount'                       => $amount,
            'is_registration_fee'          => false,
            'scholarship'                  => $isPartialAward ? $scholarship : null,
            'scholarship_discount_percent' => $isPartialAward ? $scholarshipPercent : null,
            'payment_type'                 => $paymentType,
            'installment_amount'           => $installmentAmount,
            'total_installments'           => $paymentType === 'installment' ? 4 : 1,
            'fee_category'                 => null,
        ];
    }
}
