<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseEnrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaystackWebhookController extends Controller
{
    public function handleWebhook(Request $request)
    {
        Log::info('Paystack webhook received');

        $signature = $request->header('x-paystack-signature');
        if (!$signature) {
            Log::warning('Paystack webhook received without signature');
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $body = $request->getContent();
        $computedSignature = hash_hmac('sha512', $body, env('PAYSTACK_SECRET_KEY'));

        if (!hash_equals($computedSignature, $signature)) {
            Log::warning('Paystack webhook signature mismatch');
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $event = $request->all();
        Log::info('Paystack webhook signature verified', ['event' => $event['event'] ?? null]);

        if (($event['event'] ?? null) !== 'charge.success') {
            return response()->json(['status' => 'success'], 200);
        }

        $data = $event['data'] ?? [];
        $reference = $data['reference'] ?? null;
        $metadata = $data['metadata'] ?? [];

        if (is_string($metadata)) {
            $metadata = json_decode($metadata, true) ?: [];
        }

        if (!$reference || !isset($metadata['enrollment_id'])) {
            Log::warning('Paystack webhook missing payment reference or enrollment metadata', [
                'reference' => $reference,
            ]);

            return response()->json(['status' => 'success'], 200);
        }

        $enrollment = CourseEnrollment::find($metadata['enrollment_id']);
        if (!$enrollment) {
            Log::error('Enrollment not found for Paystack webhook', [
                'enrollment_id' => $metadata['enrollment_id'],
                'reference' => $reference,
            ]);

            return response()->json(['status' => 'success'], 200);
        }

        if (!$this->paystackEventMatchesEnrollment($data, $metadata, $enrollment)) {
            Log::warning('Paystack webhook payment did not match enrollment', [
                'enrollment_id' => $enrollment->id,
                'reference' => $reference,
            ]);

            return response()->json(['error' => 'Invalid payment data'], 400);
        }

        if (CourseEnrollment::where('transaction_id', $reference)
            ->where('id', '!=', $enrollment->id)
            ->exists()) {
            Log::warning('Paystack webhook reference is already attached to another enrollment', [
                'enrollment_id' => $enrollment->id,
                'reference' => $reference,
            ]);

            return response()->json(['error' => 'Invalid payment data'], 400);
        }

        if ($enrollment->payment_status !== 'completed') {
            $enrollment->update([
                'payment_status' => 'completed',
                'transaction_id' => $reference,
                'payment_date' => now(),
            ]);

            Log::info('Payment completed via Paystack webhook', [
                'enrollment_id' => $enrollment->id,
                'reference' => $reference,
                'user_id' => $enrollment->user_id,
            ]);
        }

        return response()->json(['status' => 'success'], 200);
    }

    private function paystackEventMatchesEnrollment(array $data, array $metadata, CourseEnrollment $enrollment): bool
    {
        if (($data['status'] ?? null) !== 'success') {
            return false;
        }

        if ((int) ($metadata['enrollment_id'] ?? 0) !== (int) $enrollment->id) {
            return false;
        }

        if (isset($metadata['course_id']) && (string) $metadata['course_id'] !== (string) $enrollment->course_id) {
            return false;
        }

        $course = Course::where('course_id', $enrollment->course_id)->first();
        $expectedAmount = (int) round(((float) ($course?->price ?? $enrollment->course_price)) * 100);
        $paidAmount = (int) ($data['amount'] ?? 0);

        return $expectedAmount > 0 && $paidAmount >= $expectedAmount;
    }
}
