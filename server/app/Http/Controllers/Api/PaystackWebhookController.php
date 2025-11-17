<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CourseEnrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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

            // ⚡ Fix: decode metadata if it's a string
            if (is_string($metadata)) {
                $metadata = json_decode($metadata, true);
            }

            Log::info('💳 Processing charge.success', [
                'reference' => $reference,
                'metadata' => $metadata
            ]);

            if (isset($metadata['enrollment_id'])) {
                $enrollmentId = $metadata['enrollment_id'];
                $enrollment = CourseEnrollment::find($enrollmentId);

                if ($enrollment) {
                    if ($enrollment->payment_status !== 'completed') {
                        $enrollment->update([
                            'payment_status' => 'completed',
                            'transaction_id' => $reference,
                            'payment_date' => now(),
                        ]);

                        Log::info('✅ Payment completed via webhook', [
                            'enrollment_id' => $enrollmentId,
                            'reference' => $reference,
                            'course_name' => $enrollment->course_name,
                            'user_id' => $enrollment->user_id
                        ]);
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
