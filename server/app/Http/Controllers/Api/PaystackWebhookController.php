<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

            Log::info('💳 Processing charge.success', [
                'reference' => $reference,
                'metadata' => $metadata,
                'metadata_type' => gettype($metadata)
            ]);

            // Extract enrollment_id from metadata
            $enrollmentId = null;
            $learningTrack = null;

            if (is_array($metadata)) {
                $enrollmentId = $metadata['enrollment_id'] ?? null;
                $learningTrack = $metadata['learning_track'] ?? null;

                // Also check custom_fields array
                if (!$learningTrack && isset($metadata['custom_fields'])) {
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
                    }
                }
            }

            // Also try to extract from reference (format: ENR-{id}-{track}-{timestamp})
            if (!$learningTrack && preg_match('/ENR-(\d+)-(one_on_one|group_mentorship|self_paced)-/', $reference, $matches)) {
                $learningTrack = $matches[2];
                Log::info('🔍 Extracted learning track from reference', [
                    'learning_track' => $learningTrack
                ]);
            }

            if ($enrollmentId) {
                $enrollment = CourseEnrollment::find($enrollmentId);

                if ($enrollment) {
                    if ($enrollment->payment_status !== 'completed') {
                        $updateData = [
                            'payment_status' => 'completed',
                            'transaction_id' => $reference,
                            'payment_date' => now(),
                        ];

                        // Update learning track if we found it
                        if ($learningTrack && in_array($learningTrack, ['one_on_one', 'group_mentorship', 'self_paced'])) {
                            $updateData['learning_track'] = $learningTrack;
                            Log::info('📚 Learning track found and validated', [
                                'learning_track' => $learningTrack
                            ]);
                        } else {
                            Log::warning('⚠️ Learning track not found or invalid', [
                                'learning_track' => $learningTrack,
                                'metadata' => $metadata
                            ]);
                        }

                        $enrollment->update($updateData);

                        Log::info('✅ Payment completed via webhook', [
                            'enrollment_id' => $enrollmentId,
                            'reference' => $reference,
                            'course_name' => $enrollment->course_name,
                            'user_id' => $enrollment->user_id,
                            'learning_track' => $enrollment->learning_track,
                            'amount' => $data['amount'] ?? 'N/A'
                        ]);

                        // Optional: Send confirmation email
                        try {
                            $user = $enrollment->user;
                            if ($user && $user->email) {
                                // You can send email here
                                Log::info('📧 Sending confirmation email', [
                                    'user_email' => $user->email,
                                    'course_name' => $enrollment->course_name
                                ]);
                                
                                // TODO: Implement email sending
                                // Mail::to($user->email)->send(new PaymentConfirmation($enrollment));
                            }
                        } catch (\Exception $e) {
                            Log::error('❌ Failed to send confirmation email', [
                                'error' => $e->getMessage()
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