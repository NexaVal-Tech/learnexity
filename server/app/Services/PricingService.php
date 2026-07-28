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
 * Business rule (full-tuition scholarship model):
 *  - An approved, unused scholarship for THIS exact course means the person
 *    pays only the flat, admin-configured registration fee. No one-time
 *    discount, no installments — one payment, in full, always.
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

        $isRegistrationFee = (bool) $scholarship;

        if ($isRegistrationFee) {
            $regFeeSetting = RegistrationFeeSetting::current();
            $category      = RegistrationFeeSetting::categoryForTrack($learningTrack);
            $amount        = $regFeeSetting->priceForCategory($category, $currency);

            return [
                'amount'               => $amount,
                'is_registration_fee'  => true,
                'scholarship'          => $scholarship,
                'payment_type'         => 'onetime', // registration fee is always paid in full
                'installment_amount'   => $amount,
                'total_installments'   => 1,
                'fee_category'         => $category,
            ];
        }

        $amount = $course->getTrackPriceByCurrency($learningTrack, $currency);

        if ($paymentType === 'onetime') {
            $discountPercent = $course->getOneTimeDiscountByCurrency($currency);
            if ($discountPercent > 0) {
                $amount = max(0, round($amount * (1 - ($discountPercent / 100)), 2));
            }
        }

        $installmentAmount = $paymentType === 'installment' ? round($amount / 4, 2) : $amount;

        return [
            'amount'              => $amount,
            'is_registration_fee' => false,
            'scholarship'         => null,
            'payment_type'        => $paymentType,
            'installment_amount'  => $installmentAmount,
            'total_installments'  => $paymentType === 'installment' ? 4 : 1,
            'fee_category'        => null,
        ];
    }
}
