<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PaymentConfirmation;
use App\Models\CourseEnrollment;
use App\Models\Scholarship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PaystackWebhookController extends Controller
{
    public function handleWebhook(Request $request)
    {
        // ─────────────────────────────────────────────────────────────────
        // CRITICAL: Read the raw body directly from php://input.
        //
        // Laravel middleware (JsonParser, etc.) calls $request->all() or
        // $request->json() early in the lifecycle, which consumes the input
        // stream. After that, $request->getContent() returns an empty string,
        // so the HMAC we compute never matches what Paystack signed.
        //
        // php://input is a separate read-once stream that is NOT consumed by
        // Laravel's middleware, so it always contains the original raw bytes.
        // ─────────────────────────────────────────────────────────────────
        $rawBody = file_get_contents('php://input');

        Log::info('🔔 Paystack webhook received', [
            'raw_body_length' => strlen($rawBody),
            'raw_body_preview' => substr($rawBody, 0, 200),
            'all_headers'      => $request->headers->all(),
        ]);

        // ── Step 1: signature presence check ─────────────────────────────
        $signature = $request->header('x-paystack-signature');

        if (!$signature) {
            Log::warning('⚠️ Paystack webhook received without signature');
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // ── Step 2: HMAC verification using the raw body ──────────────────
        $secret           = config('services.paystack.secret');
        $computedSignature = hash_hmac('sha512', $rawBody, $secret);

        if (!hash_equals($computedSignature, $signature)) {
            Log::warning('⚠️ Paystack webhook signature mismatch', [
                'received'       => $signature,
                'computed'       => $computedSignature,
                'secret_prefix'  => substr($secret, 0, 8) . '…',
                'body_length'    => strlen($rawBody),
            ]);
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // ── Step 3: decode the verified body ─────────────────────────────
        // Do NOT use $request->all() — decode from the raw body we already read.
        $event = json_decode($rawBody, true);

        if (!isset($event['event'])) {
            Log::warning('⚠️ Paystack webhook: missing event key', [
                'raw_body' => substr($rawBody, 0, 300),
            ]);
            return response()->json(['status' => 'ignored'], 200);
        }

        Log::info('✅ Webhook signature verified', ['event' => $event['event']]);

        // ── Step 4: handle charge.success ─────────────────────────────────
        if ($event['event'] === 'charge.success') {
            $data        = $event['data'];
            $reference   = $data['reference'];
            $metadata    = $data['metadata'] ?? [];
            $amountInKobo = $data['amount'] ?? null;
            $currency    = $data['currency'] ?? 'NGN';
            $amount      = $amountInKobo / 100;

            Log::info('💳 Processing charge.success', [
                'reference'     => $reference,
                'amount_kobo'   => $amountInKobo,
                'amount'        => $amount,
                'currency'      => $currency,
                'metadata'      => $metadata,
                'metadata_type' => gettype($metadata),
            ]);

            // ── Extract enrollment_id / learning_track / payment_type ──────
            $enrollmentId = null;
            $learningTrack = null;
            $paymentType  = null;

            if (is_array($metadata)) {
                $enrollmentId  = $metadata['enrollment_id']  ?? null;
                $learningTrack = $metadata['learning_track'] ?? null;
                $paymentType   = $metadata['payment_type']   ?? null;

                // Fallback: check custom_fields array
                if (isset($metadata['custom_fields']) && is_array($metadata['custom_fields'])) {
                    foreach ($metadata['custom_fields'] as $field) {
                        if (($field['variable_name'] ?? '') === 'learning_track' && !$learningTrack) {
                            $trackName = $field['value'] ?? '';
                            if (str_contains($trackName, 'One-on-One')) {
                                $learningTrack = 'one_on_one';
                            } elseif (str_contains($trackName, 'Group Mentorship')) {
                                $learningTrack = 'group_mentorship';
                            } elseif (str_contains($trackName, 'Self-Paced')) {
                                $learningTrack = 'self_paced';
                            }
                        }

                        if (($field['variable_name'] ?? '') === 'payment_type' && !$paymentType) {
                            $typeName = $field['value'] ?? '';
                            if (str_contains($typeName, 'One-Time')) {
                                $paymentType = 'onetime';
                            } elseif (str_contains($typeName, 'Installment')) {
                                $paymentType = 'installment';
                            }
                        }
                    }
                }
            }

            // Last resort: parse from reference format ENR-{id}-{track}-{type}-{ts}
            if (!$learningTrack || !$paymentType) {
                if (preg_match(
                    '/ENR-(\d+)-(one_on_one|group_mentorship|self_paced)-(onetime|installment)-/',
                    $reference,
                    $matches
                )) {
                    $learningTrack = $learningTrack ?? $matches[2];
                    $paymentType   = $paymentType   ?? $matches[3];

                    Log::info('🔍 Extracted track/type from reference', [
                        'learning_track' => $learningTrack,
                        'payment_type'   => $paymentType,
                    ]);
                }
            }

            // ── Process the enrollment ─────────────────────────────────────
            if (!$enrollmentId) {
                Log::warning('⚠️ No enrollment_id in metadata', [
                    'reference' => $reference,
                    'metadata'  => $metadata,
                ]);
                return response()->json(['status' => 'success'], 200);
            }

            $enrollment = CourseEnrollment::find($enrollmentId);

            if (!$enrollment) {
                Log::error('❌ Enrollment not found for webhook', [
                    'enrollment_id' => $enrollmentId,
                    'reference'     => $reference,
                ]);
                return response()->json(['status' => 'success'], 200);
            }

            // Skip if already fully paid (but allow installment top-ups)
            if ($enrollment->payment_status === 'completed' && $enrollment->payment_type !== 'installment') {
                Log::info('ℹ️ Payment already completed — skipping', [
                    'enrollment_id' => $enrollmentId,
                ]);
                return response()->json(['status' => 'success'], 200);
            }

            $updateData = ['transaction_id' => $reference];

            // Update learning track if resolved
            if ($learningTrack && in_array($learningTrack, ['one_on_one', 'group_mentorship', 'self_paced'], true)) {
                $updateData['learning_track'] = $learningTrack;
                Log::info('📚 Learning track set', ['learning_track' => $learningTrack]);
            }

            $effectiveType = $paymentType ?? $enrollment->payment_type;

            if ($effectiveType === 'onetime') {
                // ── One-time payment ───────────────────────────────────────
                $updateData['payment_status'] = 'completed';
                $updateData['payment_date']   = now();
                $updateData['amount_paid']    = $amount;
                $updateData['has_access']     = true;

                Log::info('💰 Processing one-time payment', [
                    'amount'   => $amount,
                    'currency' => $currency,
                ]);
            } else {
                // ── Installment payment ────────────────────────────────────
                $installmentsPaid = ($enrollment->installments_paid ?? 0) + 1;

                $updateData['installments_paid']       = $installmentsPaid;
                $updateData['amount_paid']             = ($enrollment->amount_paid ?? 0) + $amount;
                $updateData['has_access']              = true;
                $updateData['last_installment_paid_at'] = now();

                if ($installmentsPaid >= $enrollment->total_installments) {
                    $updateData['payment_status']   = 'completed';
                    $updateData['next_payment_due'] = null;
                } else {
                    $updateData['next_payment_due'] = now()->addWeeks(4);
                }

                Log::info('📅 Processing installment payment', [
                    'installment_number' => $installmentsPaid,
                    'total_installments' => $enrollment->total_installments,
                    'amount'             => $amount,
                    'currency'           => $currency,
                ]);

                \DB::table('installment_payments')->insert([
                    'enrollment_id'      => $enrollment->id,
                    'installment_number' => $installmentsPaid,
                    'amount'             => $amount,
                    'currency'           => $currency,
                    'status'             => 'completed',
                    'transaction_id'     => $reference,
                    'paid_at'            => now(),
                    'created_at'         => now(),
                    'updated_at'         => now(),
                ]);
            }

            $enrollment->update($updateData);

            // ── Mark scholarship as used ───────────────────────────────────
            $scholarshipId = $metadata['scholarship_id'] ?? null;
            if ($scholarshipId) {
                Scholarship::find($scholarshipId)?->markAsUsed($enrollment->id);
            }

            Log::info('✅ Payment completed via webhook', [
                'enrollment_id' => $enrollmentId,
                'reference'     => $reference,
                'course_name'   => $enrollment->course_name,
                'user_id'       => $enrollment->user_id,
                'learning_track' => $enrollment->fresh()->learning_track,
                'payment_type'  => $enrollment->payment_type,
                'amount'        => $amount,
                'currency'      => $currency,
            ]);

            // ── Send confirmation email ────────────────────────────────────
            try {
                $user = $enrollment->user;
                if ($user && $user->email) {
                    Log::info('📧 Sending confirmation email', [
                        'user_email'  => $user->email,
                        'course_name' => $enrollment->course_name,
                    ]);
                    Mail::to($user->email)->send(new PaymentConfirmation($enrollment, $amount));
                    Log::info('✅ Confirmation email sent', ['user_email' => $user->email]);
                }
            } catch (\Exception $e) {
                Log::error('❌ Failed to send confirmation email', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }

        return response()->json(['status' => 'success'], 200);
    }
}