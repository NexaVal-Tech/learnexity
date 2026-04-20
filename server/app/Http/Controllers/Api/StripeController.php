<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PaymentConfirmation;
use App\Models\CourseEnrollment;
use App\Models\Scholarship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Webhook;

class StripeController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create Stripe Checkout Session
     */
    public function createCheckoutSession(Request $request)
    {
        $validated = $request->validate([
            'enrollment_id' => 'required|integer',
            'learning_track' => 'required|in:one_on_one,group_mentorship,self_paced',
            'payment_type'   => 'required|in:onetime,installment',
            'currency'       => 'required|in:usd',
            // ✅ amount removed — we calculate it server-side
        ]);

        try {
            $enrollment = CourseEnrollment::findOrFail($validated['enrollment_id']);

            if ($enrollment->user_id !== auth()->id()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $course = $enrollment->course;
            $track  = $validated['learning_track'];
            $type   = $validated['payment_type'];

            // ✅ Server-side price calculation
            $priceMap = [
                'one_on_one'       => $course->one_on_one_price_usd,
                'group_mentorship' => $course->group_mentorship_price_usd,
                'self_paced'       => $course->self_paced_price_usd,
            ];

            $basePrice = (float) ($priceMap[$track] ?? $course->price_usd ?? 0);

            if ($basePrice <= 0) {
                return response()->json(['error' => 'Invalid course price configuration.'], 422);
            }

            // Apply one-time discount if applicable
            if ($type === 'onetime') {
                $discountPercent = (float) ($course->onetime_discount_usd ?? 0);
                if ($discountPercent > 0) {
                    $basePrice = round($basePrice * (1 - $discountPercent / 100));
                }
            }

            // Installment = 1/4 of price
            if ($type === 'installment') {
                $basePrice = round($basePrice / 4);
            }

            $amountInCents = (int) ($basePrice * 100);

            if ($amountInCents <= 0) {
                return response()->json(['error' => 'Calculated amount is invalid.'], 422);
            }

            $trackNames = [
                'one_on_one'       => 'One-on-One Coaching',
                'group_mentorship' => 'Group Mentorship Program',
                'self_paced'       => 'Self-Paced Learning',
            ];

            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency'     => 'usd',
                        'product_data' => [
                            'name'        => $course->title,
                            'description' => $trackNames[$track] .
                                ($type === 'installment' ? ' (Installment 1 of 4)' : ''),
                        ],
                        'unit_amount' => $amountInCents,
                    ],
                    'quantity' => 1,
                ]],
                'mode'          => 'payment',
                'success_url'   => config('app.frontend_url') . '/user/payment/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url'    => config('app.frontend_url') . '/user/payment/' . $enrollment->id,
                'customer_email' => auth()->user()->email,
                'metadata'      => [
                    'enrollment_id' => $enrollment->id,
                    'course_id'     => $course->id,
                    'course_name'   => $course->title,
                    'user_id'       => auth()->id(),
                    'learning_track' => $track,
                    'payment_type'  => $type,
                    'currency'      => 'USD',
                ],
            ]);

            Log::info('Stripe checkout session created', [
                'session_id'    => $session->id,
                'enrollment_id' => $enrollment->id,
            ]);

            return response()->json([
                'id'  => $session->id,
                'url' => $session->url,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to create Stripe session', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Payment initialization failed. Please try again.'
            ], 500);
        }
    }

    /**
     * Handle Stripe Webhook
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);

            Log::info('🔔 Stripe webhook received', [
                'event_type' => $event->type,
                'event_id' => $event->id,
            ]);

            // Handle checkout.session.completed
            if ($event->type === 'checkout.session.completed') {
                $session = $event->data->object;
                $metadata = $session->metadata;

                $enrollmentId = $metadata->enrollment_id ?? null;
                $learningTrack = $metadata->learning_track ?? null;
                $paymentType = $metadata->payment_type ?? 'onetime';

                if (!$enrollmentId) {
                    Log::warning('⚠️ No enrollment_id in Stripe webhook metadata');
                    return response()->json(['status' => 'no_enrollment_id'], 200);
                }

                $enrollment = CourseEnrollment::find($enrollmentId);

                if (!$enrollment) {
                    Log::error('❌ Enrollment not found', ['enrollment_id' => $enrollmentId]);
                    return response()->json(['status' => 'enrollment_not_found'], 404);
                }

                // Prevent duplicate processing
                if ($enrollment->payment_status === 'completed' && $paymentType === 'onetime') {
                    Log::info('ℹ️ Payment already completed', ['enrollment_id' => $enrollmentId]);
                    return response()->json(['status' => 'already_completed'], 200);
                }

                $amountPaid = $session->amount_total / 100; // Convert from cents

                $updateData = [
                    'transaction_id' => $session->payment_intent,
                ];

                if ($learningTrack && in_array($learningTrack, ['one_on_one', 'group_mentorship', 'self_paced'])) {
                    $updateData['learning_track'] = $learningTrack;
                }

                // Handle payment based on type
                if ($paymentType === 'onetime') {
                    $updateData['payment_status'] = 'completed';
                    $updateData['payment_date'] = now();
                    $updateData['amount_paid'] = $amountPaid;
                    $updateData['has_access'] = true;

                    Log::info('💰 Processing one-time payment (Stripe)', [
                        'amount' => $amountPaid,
                        'currency' => 'USD'
                    ]);
                } else {
                    // Installment payment
                    $updateData['installments_paid'] = ($enrollment->installments_paid ?? 0) + 1;
                    $updateData['amount_paid'] = ($enrollment->amount_paid ?? 0) + $amountPaid;
                    $updateData['has_access'] = true;
                    $updateData['last_installment_paid_at'] = now();

                    if ($updateData['installments_paid'] >= $enrollment->total_installments) {
                        $updateData['payment_status'] = 'completed';
                        $updateData['next_payment_due'] = null;
                    } else {
                        $updateData['next_payment_due'] = now()->addWeeks(4);
                    }

                    Log::info('📅 Processing installment payment (Stripe)', [
                        'installment_number' => $updateData['installments_paid'],
                        'total_installments' => $enrollment->total_installments,
                        'amount' => $amountPaid,
                    ]);

                    // Record installment payment
                    \DB::table('installment_payments')->insert([
                        'enrollment_id' => $enrollment->id,
                        'installment_number' => $updateData['installments_paid'],
                        'amount' => $amountPaid,
                        'currency' => 'USD',
                        'status' => 'completed',
                        'transaction_id' => $session->payment_intent,
                        'paid_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                $enrollment->update($updateData);

                $scholarshipId = $metadata->scholarship_id ?? null;
                if ($scholarshipId) {
                    Scholarship::find($scholarshipId)?->markAsUsed($enrollment->id);
                }

                Log::info('✅ Payment completed via Stripe webhook', [
                    'enrollment_id' => $enrollmentId,
                    'course_name' => $enrollment->course_name,
                    'learning_track' => $enrollment->learning_track,
                    'amount' => $amountPaid,
                ]);

                // Send confirmation email
                try {
                    $user = $enrollment->user;
                    if ($user && $user->email) {
                        Mail::to($user->email)->send(new PaymentConfirmation($enrollment, $amountPaid));
                        Log::info('✅ Confirmation email sent', ['user_email' => $user->email]);
                    }
                } catch (\Exception $e) {
                    Log::error('❌ Failed to send confirmation email', [
                        'error' => $e->getMessage()
                    ]);
                }
            }

            return response()->json(['status' => 'success'], 200);

        } catch (\UnexpectedValueException $e) {
            Log::error('❌ Invalid Stripe webhook signature', [
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Invalid signature'], 400);
        } catch (\Exception $e) {
            Log::error('❌ Stripe webhook processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    /**
     * Verify Stripe payment session
     */
    public function verifySession(Request $request)
    {
        $validated = $request->validate([
            'session_id' => 'required|string',
        ]);

        try {
            $session = Session::retrieve($validated['session_id']);
            
            if ($session->payment_status === 'paid') {
                $metadata = $session->metadata;
                $enrollmentId = $metadata->enrollment_id ?? null;

                if ($enrollmentId) {
                    $enrollment = CourseEnrollment::find($enrollmentId);

                    if (!$enrollment || $enrollment->user_id !== auth()->id()) {
                        return response()->json(['error' => 'Unauthorized'], 403);
                    }
                    
                    return response()->json([
                        'status' => 'success',
                        'payment_status' => $session->payment_status,
                        'enrollment' => $enrollment,
                    ]);
                }
            }

            return response()->json([
                'status' => 'pending',
                'payment_status' => $session->payment_status,
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Failed to verify Stripe session', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to verify payment'
            ], 500);
        }
    }
}