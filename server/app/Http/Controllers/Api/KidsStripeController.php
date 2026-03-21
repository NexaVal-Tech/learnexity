<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\KidsEnrollmentConfirmation;
use App\Models\KidsEnrollment;
use App\Models\KidsInstallmentPayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Stripe\Checkout\Session;
use Stripe\Stripe;
use Stripe\Webhook;

class KidsStripeController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/kids/stripe/checkout
    // Creates a Stripe Checkout session for a kids enrollment.
    // No auth required — parent identified by enrollment ID.
    // ──────────────────────────────────────────────────────────────────────────
    public function createCheckout(Request $request): JsonResponse
    {
        $data = $request->validate([
            'enrollment_id' => 'required|integer|exists:kids_enrollments,id',
        ]);

        $enrollment = KidsEnrollment::with('course')->findOrFail($data['enrollment_id']);

        if ($enrollment->isFullyPaid()) {
            return response()->json(['error' => 'This enrollment is already fully paid.'], 422);
        }

        if ($enrollment->currency !== 'USD') {
            return response()->json(['error' => 'This enrollment uses NGN. Use Paystack.'], 422);
        }

        $amountUsd   = $enrollment->nextInstallmentAmount();
        $amountCents = (int) round($amountUsd * 100);

        if ($amountCents <= 0) {
            return response()->json(['error' => 'Invalid payment amount.'], 422);
        }

        $installmentLabel = $enrollment->payment_type === 'installment'
            ? ' (Payment ' . ($enrollment->installments_paid + 1) . ' of ' . $enrollment->total_installments . ')'
            : '';

        $sessionTypeLabel = $enrollment->session_type === 'one_on_one' ? 'One-on-One Coaching' : 'Group Mentorship';

        try {
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items'           => [[
                    'price_data' => [
                        'currency'     => 'usd',
                        'product_data' => [
                            'name'        => $enrollment->course->name . ' — ' . $sessionTypeLabel . $installmentLabel,
                            'description' => 'Student: ' . $enrollment->student_name . ' | Track: ' . ucwords(str_replace('_', ' ', $enrollment->chosen_track)),
                        ],
                        'unit_amount'  => $amountCents,
                    ],
                    'quantity'   => 1,
                ]],
                'mode'           => 'payment',
                'success_url'    => config('app.frontend_url') . '/kids/payment/success?session_id={CHECKOUT_SESSION_ID}&enrollment_id=' . $enrollment->id,
                'cancel_url'     => config('app.frontend_url') . '/kids/payment/' . $enrollment->id . '?cancelled=1',
                'customer_email' => $enrollment->parent_email,
                'metadata'       => [
                    'kids_enrollment_id' => $enrollment->id,
                    'payment_type'       => $enrollment->payment_type,
                    'installment_number' => $enrollment->installments_paid + 1,
                    'currency'           => 'USD',
                ],
            ]);

            // Save the session id so we can look it up after redirect
            $enrollment->update(['stripe_session_id' => $session->id]);

            Log::info('Kids Stripe session created', [
                'session_id'    => $session->id,
                'enrollment_id' => $enrollment->id,
                'amount_usd'    => $amountUsd,
            ]);

            return response()->json(['url' => $session->url, 'session_id' => $session->id]);

        } catch (\Exception $e) {
            Log::error('Kids Stripe session failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Payment initialisation failed. Please try again.'], 500);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/kids/stripe/webhook  (PUBLIC — no auth)
    // ──────────────────────────────────────────────────────────────────────────
    public function webhook(Request $request): JsonResponse
    {
        $payload   = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, config('services.stripe.webhook_secret'));
        } catch (\Exception $e) {
            Log::error('Kids Stripe webhook signature invalid', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session  = $event->data->object;
            $meta     = $session->metadata;

            // Only handle kids enrollments
            if (empty($meta->kids_enrollment_id)) {
                return response()->json(['status' => 'not_kids'], 200);
            }

            $enrollment = KidsEnrollment::with('course')->find($meta->kids_enrollment_id);
            if (!$enrollment) {
                Log::error('Kids enrollment not found in webhook', ['id' => $meta->kids_enrollment_id]);
                return response()->json(['status' => 'not_found'], 200);
            }

            $this->recordPayment(
                $enrollment,
                $session->amount_total / 100,
                'USD',
                $session->payment_intent,
                'stripe',
                (int) ($meta->installment_number ?? 1)
            );
        }

        return response()->json(['status' => 'ok']);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/kids/stripe/verify?session_id=…&enrollment_id=…
    // Called on the success page to confirm the session is paid.
    // ──────────────────────────────────────────────────────────────────────────
    public function verify(Request $request): JsonResponse
    {
        $data = $request->validate([
            'session_id'    => 'required|string',
            'enrollment_id' => 'required|integer|exists:kids_enrollments,id',
        ]);

        $enrollment = KidsEnrollment::with('course', 'installmentPayments')->findOrFail($data['enrollment_id']);
        $enrollment->refresh();

        try {
            $session = Session::retrieve($data['session_id']);

            // If webhook hasn't fired yet but Stripe confirms paid, update now
            if ($session->payment_status === 'paid' && !$enrollment->isFullyPaid()) {
                $meta = $session->metadata;
                $this->recordPayment(
                    $enrollment,
                    $session->amount_total / 100,
                    'USD',
                    $session->payment_intent,
                    'stripe',
                    (int) ($meta->installment_number ?? ($enrollment->installments_paid + 1))
                );
                $enrollment->refresh();
            }
        } catch (\Exception $e) {
            Log::warning('Kids Stripe verify: could not retrieve session', ['error' => $e->getMessage()]);
        }

        return response()->json([
            'enrollment' => app(KidsController::class)->getEnrollment($enrollment->id)->getData(true)['enrollment'],
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Shared payment recording logic
    // ──────────────────────────────────────────────────────────────────────────
    private function recordPayment(
        KidsEnrollment $enrollment,
        float          $amount,
        string         $currency,
        string         $transactionId,
        string         $gateway,
        int            $installmentNumber
    ): void {
        // Prevent double-processing the same transaction
        if (KidsInstallmentPayment::where('transaction_id', $transactionId)->exists()) {
            Log::info('Kids payment already recorded', ['transaction_id' => $transactionId]);
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

        Log::info('Kids payment recorded', [
            'enrollment_id'     => $enrollment->id,
            'amount'            => $amount,
            'installments_paid' => $installmentsPaid,
            'is_complete'       => $isComplete,
        ]);

        // Send confirmation email
        try {
            Mail::to($enrollment->parent_email)
                ->send(new KidsEnrollmentConfirmation($enrollment->fresh('course'), $amount, $isComplete));
        } catch (\Exception $e) {
            Log::error('Kids confirmation email failed', ['error' => $e->getMessage()]);
        }
    }
}