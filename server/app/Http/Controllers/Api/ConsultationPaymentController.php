<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\ConsultationSetting;
use App\Services\ConsultationPaymentService;
use App\Services\LocationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;

class ConsultationPaymentController extends Controller
{
    /**
     * Step 1: validate the booking details, create a pending_payment
     * consultation record, then start a Stripe or Paystack checkout
     * depending on the visitor's country.
     */
    public function initiate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name'         => 'required|string|max:255',
            'email'             => 'required|email|max:255',
            'phone'             => 'nullable|string|max:30',
            'consultation_type' => 'required|in:course_guidance,career_advice,technical_support,renewal,general',
            'course'            => 'nullable|string|max:255',
            'message'           => 'nullable|string|max:2000',
            'preferred_date'    => 'required|date|after_or_equal:today',
            'preferred_time'    => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed.', 'errors' => $validator->errors()], 422);
        }

        $date = Carbon::parse($request->preferred_date);
        if ($date->isWeekend()) {
            return response()->json(['message' => 'Consultations are only available Monday–Friday.'], 422);
        }

        $slotTaken = Consultation::where('preferred_date', $request->preferred_date)
            ->where('preferred_time', $request->preferred_time)
            ->where('payment_status', 'paid')
            ->where('status', 'scheduled')
            ->exists();

        if ($slotTaken) {
            return response()->json(['message' => 'This time slot is no longer available. Please choose another.'], 409);
        }

        $settings   = ConsultationSetting::current();
        $location   = LocationService::getLocationInfo();
        $isNigeria  = ($location['country_code'] ?? null) === 'NG';
        $currency   = $isNigeria ? 'NGN' : 'USD';
        $amount     = $isNigeria ? (float) $settings->price_ngn : (float) $settings->price_usd;

        if ($amount <= 0) {
            return response()->json(['message' => 'Consultation pricing is not configured.'], 422);
        }

        $consultation = Consultation::create([
            'user_id'           => auth('api')->id(),
            'full_name'         => $request->full_name,
            'email'             => $request->email,
            'phone'             => $request->phone,
            'consultation_type' => $request->consultation_type,
            'course'            => $request->course,
            'message'           => $request->message,
            'preferred_date'    => $request->preferred_date,
            'preferred_time'    => $request->preferred_time,
            'status' => 'scheduled',
            'payment_status' => 'pending',
            'currency'          => $currency,
            'amount'            => $amount,
        ]);

        try {
            $checkoutUrl = $currency === 'USD'
                ? $this->createStripeCheckout($consultation, $amount)
                : $this->createPaystackCheckout($consultation, $amount);
        } catch (\Throwable $e) {
            Log::error('Consultation payment initialization failed: ' . $e->getMessage());
            $consultation->delete();
            return response()->json(['message' => 'Could not start payment. Please try again.'], 500);
        }

        return response()->json([
            'checkout_url'    => $checkoutUrl,
            'consultation_id' => $consultation->id,
            'currency'        => $currency,
            'amount'          => $amount,
        ]);
    }

    private function createStripeCheckout(Consultation $consultation, float $amount): string
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        $session = StripeSession::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency'     => 'usd',
                    'product_data' => [
                        'name'        => 'Learnexity Consultation',
                        'description' => 'Paid 1-on-1 consultation session',
                    ],
                    'unit_amount' => (int) round($amount * 100),
                ],
                'quantity' => 1,
            ]],
            'mode'           => 'payment',
            'success_url'    => config('app.frontend_url') . '/consultation/success?session_id={CHECKOUT_SESSION_ID}&provider=stripe',
            'cancel_url'     => config('app.frontend_url') . '/consultation?cancelled=1',
            'customer_email' => $consultation->email,
            'metadata' => [
                'type'            => 'consultation',
                'consultation_id' => (string) $consultation->id,
            ],
        ]);

        $consultation->update(['transaction_id' => $session->id, 'payment_method' => 'stripe']);

        return $session->url;
    }

    private function createPaystackCheckout(Consultation $consultation, float $amount): string
    {
        $reference = 'CONSULT-' . $consultation->id . '-' . time();

        $response = Http::withToken(config('services.paystack.secret'))
            ->post('https://api.paystack.co/transaction/initialize', [
                'email'        => $consultation->email,
                'amount'       => (int) round($amount * 100), // kobo
                'currency'     => 'NGN',
                'reference'    => $reference,
                'callback_url' => config('app.frontend_url') . '/consultation/success?reference=' . $reference . '&provider=paystack',
                'metadata' => [
                    'type'            => 'consultation',
                    'consultation_id' => (string) $consultation->id,
                ],
            ]);

        if (!$response->successful() || !$response->json('status')) {
            throw new \Exception('Paystack initialization failed: ' . $response->body());
        }

        $consultation->update(['transaction_id' => $reference, 'payment_method' => 'paystack']);

        return $response->json('data.authorization_url');
    }

    /**
     * Fallback verification for the success page. Webhooks are the
     * source of truth, but this covers the case where the visitor
     * lands back on /consultation/success before the webhook arrives.
     */
    public function verify(Request $request)
    {
        $provider = $request->query('provider');
        $consultation = null;

        if ($provider === 'stripe') {
            $sessionId = $request->query('session_id');
            $consultation = Consultation::where('transaction_id', $sessionId)->first();

            if ($consultation && $consultation->payment_status !== 'paid') {
                Stripe::setApiKey(config('services.stripe.secret'));
                $session = StripeSession::retrieve($sessionId);
                if ($session->payment_status === 'paid') {
                    ConsultationPaymentService::markPaid(
                        $consultation,
                        $session->amount_total / 100,
                        $session->payment_intent ?? $sessionId,
                        'stripe'
                    );
                }
            }
        } elseif ($provider === 'paystack') {
            $reference = $request->query('reference');
            $consultation = Consultation::where('transaction_id', $reference)->first();

            if ($consultation && $consultation->payment_status !== 'paid') {
                $response = Http::withToken(config('services.paystack.secret'))
                    ->get("https://api.paystack.co/transaction/verify/{$reference}");

                if ($response->successful() && $response->json('data.status') === 'success') {
                    ConsultationPaymentService::markPaid(
                        $consultation,
                        $response->json('data.amount') / 100,
                        $reference,
                        'paystack'
                    );
                }
            }
        }

        if (!$consultation) {
            return response()->json(['message' => 'Consultation not found.'], 404);
        }

        return response()->json(['consultation' => $consultation->fresh()]);
    }
}