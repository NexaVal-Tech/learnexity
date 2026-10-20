<?php

namespace App\Services;

use App\Mail\TvAdminPremiumMail;
use App\Mail\TvWebinarMail;
use App\Models\TvRegistration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class TvWebinarService
{
    /**
     * Mark a premium registration as paid and send the emails.
     * Idempotent — safe to call from the webhook AND the verify fallback.
     */
    public static function markPaid(TvRegistration $registration, float $amount, string $reference, string $method, ?string $currency = null): void
    {
        $updated = DB::transaction(function () use ($registration, $amount, $reference, $method, $currency) {
            $fresh = TvRegistration::whereKey($registration->id)->lockForUpdate()->first();
            if (!$fresh || $fresh->payment_status === 'paid') {
                return null;
            }
            $fresh->update([
                'tier'                => 'premium',
                'payment_status'      => 'paid',
                'amount'              => $amount,
                'currency'            => $currency ?: $fresh->currency,
                'payment_method'      => $method,
                'transaction_id'      => $reference,
                'paid_at'             => now(),
                'consultation_status' => $fresh->consultation_status === 'not_applicable' ? 'to_schedule' : $fresh->consultation_status,
            ]);
            return $fresh->fresh();
        });

        if (!$updated) return;

        self::send($updated, 'registered_premium');

        $adminEmail = env('ADMIN_NOTIFICATION_EMAIL', env('MAIL_FROM_ADDRESS'));
        if ($adminEmail) {
            try {
                Mail::to($adminEmail)->queue(new TvAdminPremiumMail($updated));
            } catch (\Throwable $e) {
                Log::error('TV admin premium email failed: ' . $e->getMessage());
            }
        }
    }

    /** Queue one email to a registrant; never throws. */
    public static function send(TvRegistration $registration, string $kind): bool
    {
        try {
            Mail::to($registration->email)->queue(new TvWebinarMail($registration, $kind));
            return true;
        } catch (\Throwable $e) {
            Log::error("TV webinar email ({$kind}) failed: " . $e->getMessage(), ['registration' => $registration->id]);
            return false;
        }
    }
}
