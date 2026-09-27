<?php

namespace App\Services;

use App\Models\PublicReferrer;
use App\Models\ReferralCode;
use App\Models\ReferralHistory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Refer & Earn commission logic.
 *
 * A referral is created as 'pending' at signup (see AuthController::processReferral
 * and PublicReferralController::handleNewSignup) with no reward amount yet —
 * there's nothing to calculate a commission from until the referred person
 * actually pays for something. This service is the single place that credits
 * a referrer once that first payment happens: reward = 10% of the amount the
 * referred person paid, one time, on their first successful payment.
 *
 * Call creditReferrerForPayment() from every payment-success path (Paystack
 * webhook, Stripe webhook, …) right after the enrollment is updated. It's a
 * safe no-op if the referred user has no pending referral (not referred, or
 * already credited).
 */
class ReferralCommissionService
{
    private const COMMISSION_RATE = 0.10; // 10%

    public static function creditReferrerForPayment(int $referredUserId, float $amountPaid): void
    {
        if ($amountPaid <= 0) {
            return;
        }

        $referral = ReferralHistory::where('referred_user_id', $referredUserId)
            ->where('status', 'pending')
            ->first();

        if (!$referral) {
            // Not referred, or this referral was already credited on an
            // earlier payment (e.g. a later installment) — nothing to do.
            return;
        }

        $reward = round($amountPaid * self::COMMISSION_RATE, 2);

        try {
            DB::transaction(function () use ($referral, $reward) {
                $referral->update([
                    'status'        => 'completed',
                    'reward_amount' => $reward,
                    'completed_at'  => now(),
                ]);

                if ($referral->referrer_id) {
                    $code = ReferralCode::where('user_id', $referral->referrer_id)->first();
                    if ($code) {
                        $code->decrement('pending_referrals');
                        $code->increment('successful_referrals');
                        $code->increment('total_rewards', $reward);
                    }
                } elseif ($referral->public_referrer_id) {
                    PublicReferrer::where('id', $referral->public_referrer_id)->decrement('pending_referrals');
                    PublicReferrer::where('id', $referral->public_referrer_id)->increment('successful_referrals');
                    PublicReferrer::where('id', $referral->public_referrer_id)->increment('total_earnings', $reward);
                }
            });

            Log::info('✅ [REFERRAL COMMISSION] Credited', [
                'referral_id'       => $referral->id,
                'referred_user_id'  => $referredUserId,
                'amount_paid'       => $amountPaid,
                'reward'            => $reward,
            ]);
        } catch (\Exception $e) {
            Log::error('❌ [REFERRAL COMMISSION] Failed to credit', [
                'referral_id' => $referral->id,
                'error'       => $e->getMessage(),
            ]);
        }
    }
}
