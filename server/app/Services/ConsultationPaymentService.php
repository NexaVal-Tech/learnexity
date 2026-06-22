<?php

namespace App\Services;

use App\Mail\ConsultationBookedAdmin;
use App\Mail\ConsultationConfirmation;
use App\Models\Consultation;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ConsultationPaymentService
{
    /**
     * Marks a consultation as paid + scheduled, and fires the
     * confirmation emails. Idempotent — safe to call from both
     * the webhook AND the frontend "verify" fallback without
     * double-sending emails.
     */
    public static function markPaid(Consultation $consultation, float $amountPaid, string $reference, string $method): void
    {
        if ($consultation->payment_status === 'paid') {
            return;
        }

        $consultation->update([
            'status'         => 'scheduled',
            'payment_status' => 'paid',
            'amount'         => $amountPaid,
            'transaction_id' => $reference,
            'payment_method' => $method,
        ]);

        $consultation = $consultation->fresh();

        try {
            Mail::to($consultation->email)->send(new ConsultationConfirmation($consultation));
        } catch (\Throwable $e) {
            Log::error('Consultation confirmation email failed: ' . $e->getMessage());
        }

        $adminEmail = config('mail.admin_email', env('ADMIN_EMAIL', env('MAIL_FROM_ADDRESS')));
        try {
            Mail::to($adminEmail)->send(new ConsultationBookedAdmin($consultation));
        } catch (\Throwable $e) {
            Log::error('Consultation admin notification email failed: ' . $e->getMessage());
        }
    }
}