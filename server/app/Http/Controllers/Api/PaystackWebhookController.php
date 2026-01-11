<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PaymentConfirmation;
use App\Models\CourseEnrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PaystackWebhookController extends Controller
{
    public function handleWebhook(Request $request)
    {
        Log::info('🔔 Paystack webhook received', [
            'headers' => $request->headers->all(),
            'body' => $request->all()
        ]);

        // Verify webhook signature
        $signature = $request->header('x-paystack-signature');
        if (!$signature) {
            Log::warning('⚠️ Paystack webhook received without signature');
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $body = $request->getContent();
        $computedSignature = hash_hmac('sha512', $body, env('PAYSTACK_SECRET_KEY'));
        if ($signature !== $computedSignature) {
            Log::warning('⚠️ Paystack webhook signature mismatch', [
                'received' => $signature,
                'computed' => $computedSignature
            ]);
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $event = $request->all();
        Log::info('✅ Webhook signature verified', ['event' => $event['event']]);

        // Handle charge.success
        if ($event['event'] === 'charge.success') {
            $data = $event['data'];
            $reference = $data['reference'];
            $metadata = $data['metadata'] ?? [];
            $amountInKobo = $data['amount'] ?? null;
            $currency = $data['currency'] ?? 'NGN';

            // Convert amount from kobo/cents to main currency unit
            $amount = $amountInKobo / 100;

            Log::info('💳 Processing charge.success', [
                'reference' => $reference,
                'amount_kobo' => $amountInKobo,
                'amount' => $amount,
                'currency' => $currency,
                'metadata' => $metadata,
                'metadata_type' => gettype($metadata),
            ]);

            // Extract enrollment_id, learning_track, and payment_type from metadata
            $enrollmentId = null;
            $learningTrack = null;
            $paymentType = null;

            if (is_array($metadata)) {
                $enrollmentId = $metadata['enrollment_id'] ?? null;
                $learningTrack = $metadata['learning_track'] ?? null;
                $paymentType = $metadata['payment_type'] ?? null;

                // Also check custom_fields array
                if (isset($metadata['custom_fields'])) {
                    foreach ($metadata['custom_fields'] as $field) {
                        if ($field['variable_name'] === 'learning_track') {
                            // Extract the track ID from the display name
                            $trackName = $field['value'];
                            if (strpos($trackName, 'One-on-One') !== false) {
                                $learningTrack = 'one_on_one';
                            } elseif (strpos($trackName, 'Group Mentorship') !== false) {
                                $learningTrack = 'group_mentorship';
                            } elseif (strpos($trackName, 'Self-Paced') !== false) {
                                $learningTrack = 'self_paced';
                            }
                        }
                        if ($field['variable_name'] === 'payment_type') {
                            $paymentTypeName = $field['value'];
                            if (strpos($paymentTypeName, 'One-Time') !== false) {
                                $paymentType = 'onetime';
                            } elseif (strpos($paymentTypeName, 'Installment') !== false) {
                                $paymentType = 'installment';
                            }
                        }
                    }
                }
            }

            // Also try to extract from reference (format: ENR-{id}-{track}-{payment_type}-{timestamp})
            if (!$learningTrack || !$paymentType) {
                if (preg_match('/ENR-(\d+)-(one_on_one|group_mentorship|self_paced)-(onetime|installment)-/', $reference, $matches)) {
                    if (!$learningTrack) {
                        $learningTrack = $matches[2];
                    }
                    if (!$paymentType) {
                        $paymentType = $matches[3];
                    }
                    Log::info('🔍 Extracted from reference', [
                        'learning_track' => $learningTrack,
                        'payment_type' => $paymentType
                    ]);
                }
            }

            if ($enrollmentId) {
                $enrollment = CourseEnrollment::find($enrollmentId);

                if ($enrollment) {
                    if ($enrollment->payment_status !== 'completed' || $enrollment->payment_type === 'installment') {
                        $updateData = [
                            'transaction_id' => $reference,
                        ];

                        // Update learning track if we found it
                        if ($learningTrack && in_array($learningTrack, ['one_on_one', 'group_mentorship', 'self_paced'])) {
                            $updateData['learning_track'] = $learningTrack;
                            Log::info('📚 Learning track found and validated', [
                                'learning_track' => $learningTrack
                            ]);
                        }

                        // Handle payment based on type
                        if ($paymentType === 'onetime' || $enrollment->payment_type === 'onetime') {
                            // One-time payment
                            $updateData['payment_status'] = 'completed';
                            $updateData['payment_date'] = now();
                            $updateData['amount_paid'] = $amount;
                            $updateData['has_access'] = true;
                            
                            Log::info('💰 Processing one-time payment', [
                                'amount' => $amount,
                                'currency' => $currency
                            ]);
                        } else {
                            // Installment payment
                            $updateData['installments_paid'] = ($enrollment->installments_paid ?? 0) + 1;
                            $updateData['amount_paid'] = ($enrollment->amount_paid ?? 0) + $amount;
                            $updateData['has_access'] = true;
                            $updateData['last_installment_paid_at'] = now();

                            // Check if all installments are paid
                            if ($updateData['installments_paid'] >= $enrollment->total_installments) {
                                $updateData['payment_status'] = 'completed';
                                $updateData['next_payment_due'] = null;
                            } else {
                                $updateData['next_payment_due'] = now()->addWeeks(4);
                            }

                            Log::info('📅 Processing installment payment', [
                                'installment_number' => $updateData['installments_paid'],
                                'total_installments' => $enrollment->total_installments,
                                'amount' => $amount,
                                'currency' => $currency
                            ]);

                            // Record installment payment
                            \DB::table('installment_payments')->insert([
                                'enrollment_id' => $enrollment->id,
                                'installment_number' => $updateData['installments_paid'],
                                'amount' => $amount,
                                'currency' => $currency,
                                'status' => 'completed',
                                'transaction_id' => $reference,
                                'paid_at' => now(),
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                        }

                        $enrollment->update($updateData);

                        Log::info('✅ Payment completed via webhook', [
                            'enrollment_id' => $enrollmentId,
                            'reference' => $reference,
                            'course_name' => $enrollment->course_name,
                            'user_id' => $enrollment->user_id,
                            'learning_track' => $enrollment->learning_track,
                            'payment_type' => $enrollment->payment_type,
                            'amount' => $amount,
                            'currency' => $currency
                        ]);

                        // Send confirmation email
                        try {
                            $user = $enrollment->user;
                            if ($user && $user->email) {
                                Log::info('📧 Sending confirmation email', [
                                    'user_email' => $user->email,
                                    'course_name' => $enrollment->course_name
                                ]);
                                
                                Mail::to($user->email)->send(new PaymentConfirmation($enrollment, $amount));
                                
                                Log::info('✅ Confirmation email sent successfully', [
                                    'user_email' => $user->email
                                ]);
                            }
                        } catch (\Exception $e) {
                            Log::error('❌ Failed to send confirmation email', [
                                'error' => $e->getMessage(),
                                'trace' => $e->getTraceAsString()
                            ]);
                        }
                    } else {
                        Log::info('ℹ️ Payment already completed', [
                            'enrollment_id' => $enrollmentId
                        ]);
                    }
                } else {
                    Log::error('❌ Enrollment not found for webhook', [
                        'enrollment_id' => $enrollmentId,
                        'reference' => $reference
                    ]);
                }
            } else {
                Log::warning('⚠️ No enrollment_id in metadata', [
                    'reference' => $reference,
                    'metadata' => $metadata
                ]);
            }
        }

        return response()->json(['status' => 'success'], 200);
    }
}