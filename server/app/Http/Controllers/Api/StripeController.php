<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PaymentConfirmation;
use App\Models\CourseEnrollment;
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
        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));
    }

    /**
     * Create Stripe Checkout Session
     */
    public function createCheckoutSession(Request $request)
    {
        $validated = $request->validate([
            'enrollment_id' => 'required|integer',
            'course_id' => 'required',
            'course_name' => 'required|string',
            'learning_track' => 'required|in:one_on_one,group_mentorship,self_paced',
            'payment_type' => 'required|in:onetime,installment',
            'amount' => 'required|numeric|min:0',
            'currency' => 'required|in:usd',
            'user_email' => 'required|email',
            'user_name' => 'required|string',
        ]);

        try {
            $enrollment = CourseEnrollment::findOrFail($validated['enrollment_id']);

            // Verify enrollment belongs to authenticated user
            if ($enrollment->user_id !== auth()->id()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            // Convert amount to cents
            $amountInCents = (int)($validated['amount'] * 100);

            $trackNames = [
                'one_on_one' => 'One-on-One Coaching',
                'group_mentorship' => 'Group Mentorship Program',
                'self_paced' => 'Self-Paced Learning',
            ];

            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => $validated['course_name'],
                            'description' => $trackNames[$validated['learning_track']] . 
                                           ($validated['payment_type'] === 'installment' ? ' (Installment 1 of 4)' : ''),
                            'images' => [config('app.url') . '/images/course-default.png'],
                        ],
                        'unit_amount' => $amountInCents,
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => config('app.frontend_url') . '/user/payment/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => config('app.frontend_url') . '/user/payment/' . $validated['enrollment_id'],
                'customer_email' => $validated['user_email'],
                'metadata' => [
                    'enrollment_id' => $validated['enrollment_id'],
                    'course_id' => $validated['course_id'],
                    'course_name' => $validated['course_name'],
                    'user_id' => auth()->id(),
                    'learning_track' => $validated['learning_track'],
                    'payment_type' => $validated['payment_type'],
                    'currency' => 'USD',
                ],
            ]);

            Log::info('✅ Stripe checkout session created', [
                'session_id' => $session->id,
                'enrollment_id' => $validated['enrollment_id'],
                'amount' => $validated['amount'],
            ]);

            return response()->json([
                'id' => $session->id,
                'url' => $session->url,
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Failed to create Stripe session', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to create payment session: ' . $e->getMessage()
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
        $webhookSecret = env('STRIPE_WEBHOOK_SECRET');

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