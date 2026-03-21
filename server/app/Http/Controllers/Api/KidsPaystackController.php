<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\KidsEnrollmentConfirmation;
use App\Models\KidsEnrollment;
use App\Models\KidsInstallmentPayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class KidsPaystackController extends Controller
{
    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/kids/paystack/initialize
    // Initialises a Paystack transaction and returns the authorisation URL.
    // ──────────────────────────────────────────────────────────────────────────
    public function initialize(Request $request): JsonResponse
    {
        $data = $request->validate([
            'enrollment_id' => 'required|integer|exists:kids_enrollments,id',
        ]);

        $enrollment = KidsEnrollment::with('course')->findOrFail($data['enrollment_id']);

        if ($enrollment->isFullyPaid()) {
            return response()->json(['error' => 'This enrollment is already fully paid.'], 422);
        }

        if ($enrollment->currency !== 'NGN') {
            return response()->json(['error' => 'This enrollment uses USD. Use Stripe.'], 422);
        }

        $amountNgn    = $enrollment->nextInstallmentAmount();
        $amountKobo   = (int) round($amountNgn * 100);
        $installmentNo = $enrollment->installments_paid + 1;

        // Unique reference per payment attempt
        $reference = 'KIDS-' . $enrollment->id . '-' . $installmentNo . '-' . Str::random(8);

        $sessionTypeLabel = $enrollment->session_type === 'one_on_one' ? 'One-on-One' : 'Group Mentorship';
        $installmentLabel = $enrollment->payment_type === 'installment'
            ? ' (Payment ' . $installmentNo . ' of ' . $enrollment->total_installments . ')'
            : '';

        $response = Http::withToken(config('services.paystack.secret'))
            ->post('https://api.paystack.co/transaction/initialize', [
                'email'     => $enrollment->parent_email,
                'amount'    => $amountKobo,
                'currency'  => 'NGN',
                'reference' => $reference,
                'callback_url' => config('app.frontend_url') . '/kids/payment/success?reference=' . $reference . '&enrollment_id=' . $enrollment->id,
                'metadata'  => [
                    'kids_enrollment_id' => $enrollment->id,
                    'payment_type'       => $enrollment->payment_type,
                    'installment_number' => $installmentNo,
                    'currency'           => 'NGN',
                    'cancel_action'      => config('app.frontend_url') . '/kids/payment/' . $enrollment->id,
                    'custom_fields'      => [
                        ['display_name' => 'Course',       'variable_name' => 'course',       'value' => $enrollment->course->name],
                        ['display_name' => 'Student',      'variable_name' => 'student',      'value' => $enrollment->student_name],
                        ['display_name' => 'Session Type', 'variable_name' => 'session_type', 'value' => $sessionTypeLabel . $installmentLabel],
                        ['display_name' => 'Track',        'variable_name' => 'chosen_track', 'value' => ucwords(str_replace('_', ' ', $enrollment->chosen_track))],
                    ],
                ],
            ]);

        if (!$response->successful() || !$response->json('status')) {
            Log::error('Kids Paystack initialize failed', ['response' => $response->json()]);
            return response()->json(['error' => 'Payment initialisation failed. Please try again.'], 500);
        }

        // Save the reference so the webhook can look up the enrollment
        $enrollment->update(['paystack_reference' => $reference]);

        Log::info('Kids Paystack initialized', [
            'enrollment_id' => $enrollment->id,
            'reference'     => $reference,
            'amount_ngn'    => $amountNgn,
        ]);

        return response()->json([
            'authorization_url' => $response->json('data.authorization_url'),
            'reference'         => $reference,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/kids/paystack/webhook  (PUBLIC — no auth)
    // ──────────────────────────────────────────────────────────────────────────
    public function webhook(Request $request): JsonResponse
    {
        $signature = $request->header('x-paystack-signature');
        $body      = $request->getContent();

        if (!$signature || $signature !== hash_hmac('sha512', $body, config('services.paystack.secret'))) {
            Log::warning('Kids Paystack webhook signature mismatch');
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $event = $request->all();

        if ($event['event'] !== 'charge.success') {
            return response()->json(['status' => 'ignored']);
        }

        $data      = $event['data'];
        $reference = $data['reference'];
        $meta      = $data['metadata'] ?? [];
        $amountNgn = ($data['amount'] ?? 0) / 100;

        // Only handle kids payments
        $enrollmentId = $meta['kids_enrollment_id'] ?? null;
        if (!$enrollmentId) {
            return response()->json(['status' => 'not_kids'], 200);
        }

        $enrollment = KidsEnrollment::with('course')->find($enrollmentId);
        if (!$enrollment) {
            Log::error('Kids enrollment not found in Paystack webhook', ['id' => $enrollmentId]);
            return response()->json(['status' => 'not_found'], 200);
        }

        $this->recordPayment(
            $enrollment,
            $amountNgn,
            'NGN',
            $reference,
            'paystack',
            (int) ($meta['installment_number'] ?? ($enrollment->installments_paid + 1))
        );

        return response()->json(['status' => 'ok']);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/kids/paystack/verify?reference=…&enrollment_id=…
    // Called on the success page to confirm via Paystack API.
    // ──────────────────────────────────────────────────────────────────────────
    public function verify(Request $request): JsonResponse
    {
        $data = $request->validate([
            'reference'     => 'required|string',
            'enrollment_id' => 'required|integer|exists:kids_enrollments,id',
        ]);

        $enrollment = KidsEnrollment::with('course', 'installmentPayments')->findOrFail($data['enrollment_id']);

        // Check if already recorded (webhook may have fired first)
        if (!$enrollment->isFullyPaid()) {
            $response = Http::withToken(config('services.paystack.secret'))
                ->get('https://api.paystack.co/transaction/verify/' . $data['reference']);

            if ($response->successful() && $response->json('data.status') === 'success') {
                $txnData      = $response->json('data');
                $meta         = $txnData['metadata'] ?? [];
                $amountNgn    = ($txnData['amount'] ?? 0) / 100;
                $installmentNo = (int) ($meta['installment_number'] ?? ($enrollment->installments_paid + 1));

                $this->recordPayment(
                    $enrollment,
                    $amountNgn,
                    'NGN',
                    $data['reference'],
                    'paystack',
                    $installmentNo
                );
                $enrollment->refresh();
            }
        }

        return response()->json([
            'enrollment' => app(KidsController::class)->getEnrollment($enrollment->id)->getData(true)['enrollment'],
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    private function recordPayment(
        KidsEnrollment $enrollment,
        float          $amount,
        string         $currency,
        string         $transactionId,
        string         $gateway,
        int            $installmentNumber
    ): void {
        if (KidsInstallmentPayment::where('transaction_id', $transactionId)->exists()) {
            Log::info('Kids Paystack payment already recorded', ['reference' => $transactionId]);
            return;
        }

        $installmentsPaid = $enrollment->installments_paid + 1;
        $amountPaid       = $enrollment->amount_paid + $amount;
        $isComplete       = $enrollment->payment_type === 'onetime' || $installmentsPaid >= $enrollment->total_installments;

        KidsInstallmentPayment::create([
            'kids_enrollment_id' => $enrollment->id,
            'installment_number' => $installmentNumber,
            'amount'             => $amount,
            'currency'           => $currency,
            'status'             => 'completed',
            'transaction_id'     => $transactionId,
            'gateway'            => $gateway,
            'paid_at'            => now(),
        ]);

        $enrollment->update([
            'amount_paid'       => $amountPaid,
            'installments_paid' => $installmentsPaid,
            'transaction_id'    => $transactionId,
            'last_payment_at'   => now(),
            'has_access'        => true,
            'payment_status'    => $isComplete ? 'completed' : 'partial',
            'enrolled_at'       => $enrollment->enrolled_at ?? now(),
            'next_payment_due'  => $isComplete ? null : now()->addMonth(),
        ]);

        Log::info('Kids Paystack payment recorded', [
            'enrollment_id'     => $enrollment->id,
            'amount'            => $amount,
            'installments_paid' => $installmentsPaid,
            'is_complete'       => $isComplete,
        ]);

        try {
            Mail::to($enrollment->parent_email)
                ->send(new KidsEnrollmentConfirmation($enrollment->fresh('course'), $amount, $isComplete));
        } catch (\Exception $e) {
            Log::error('Kids confirmation email failed', ['error' => $e->getMessage()]);
        }
    }
}