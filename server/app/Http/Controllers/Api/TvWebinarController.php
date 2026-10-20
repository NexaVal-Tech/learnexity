<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TvRegistration;
use App\Models\TvWebinarSetting;
use App\Services\LocationService;
use App\Services\TvWebinarService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;

/**
 * Public endpoints for the standalone Learnexity TV webinar page
 * (tv.learnexity.org):
 *
 *   GET  /api/tv/settings   — title, date, price for this visitor, open/closed
 *   POST /api/tv/register   — free registration
 *   POST /api/tv/checkout   — premium: save details, start Stripe/Paystack checkout
 *   GET  /api/tv/verify     — after returning from checkout (webhook is the source of truth)
 */
class TvWebinarController extends Controller
{
    private const HEARD_FROM = ['linkedin', 'twitter', 'email', 'friend', 'whatsapp', 'instagram', 'facebook', 'other'];

    public function settings(): JsonResponse
    {
        $s = TvWebinarSetting::current();
        $country = $this->countryCode();
        $paystack = $s->usesPaystackFor($country);
        $seatsLeft = $s->premiumSeatsLeft();

        return response()->json([
            'title'             => $s->title,
            'event_at'          => optional($s->event_at)->toIso8601String(),
            'event_time_label'  => $s->event_time_label,
            'whatsapp_number'   => $s->whatsapp_number,
            'registration_open' => (bool) $s->registration_open,
            'premium_open'      => (bool) $s->premium_open && ($seatsLeft === null || $seatsLeft > 0),
            'premium_seats_left'=> $seatsLeft,
            'price'             => $paystack ? (float) $s->price_ngn : (float) $s->price_usd,
            'currency'          => $paystack ? 'NGN' : 'USD',
            'provider'          => $paystack ? 'paystack' : 'stripe',
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        if ($this->isBot($request)) {
            return response()->json(['message' => 'Registered.'], 201); // silently drop bots
        }

        $s = TvWebinarSetting::current();
        if (!$s->registration_open) {
            return response()->json(['message' => 'Registration is closed.'], 422);
        }

        $v = Validator::make($request->all(), [
            'full_name'      => 'required|string|min:2|max:120',
            'email'          => 'required|email:rfc|max:190',
            'phone'          => 'nullable|string|max:30|regex:/^[0-9+()\-\s]{6,30}$/',
            'learn_about'    => 'required|string|max:500',
            'career_concern' => 'required|string|max:500',
            'heard_from'     => 'required|in:' . implode(',', self::HEARD_FROM),
        ]);
        if ($v->fails()) {
            return response()->json(['message' => 'Please check the form.', 'errors' => $v->errors()], 422);
        }

        $email = mb_strtolower(trim($request->email));
        $existing = TvRegistration::where('email', $email)->first();

        $data = [
            'full_name'      => $this->clean($request->full_name, 120),
            'phone'          => $this->clean($request->phone, 30) ?: ($existing->phone ?? null),
            'learn_about'    => $this->clean($request->learn_about, 500),
            'career_concern' => $this->clean($request->career_concern, 500),
            'heard_from'     => $request->heard_from,
        ];

        if ($existing) {
            // Already registered (maybe premium) — just refresh their answers.
            $existing->update($data);
            return response()->json([
                'message'      => 'You are already registered — we have updated your details.',
                'already'      => true,
                'tier'         => $existing->tier,
                'whatsapp_url' => $this->whatsappUrl($s),
            ]);
        }

        $reg = TvRegistration::create($data + [
            'email'          => $email,
            'tier'           => 'free',
            'payment_status' => 'none',
            'ip_address'     => $request->ip(),
        ]);

        TvWebinarService::send($reg, 'registered_free');

        return response()->json([
            'message'      => 'Registration successful.',
            'tier'         => 'free',
            'whatsapp_url' => $this->whatsappUrl($s),
        ], 201);
    }

    public function checkout(Request $request): JsonResponse
    {
        if ($this->isBot($request)) {
            return response()->json(['message' => 'Could not start payment.'], 422);
        }

        $s = TvWebinarSetting::current();
        if (!$s->registration_open || !$s->premium_open) {
            return response()->json(['message' => 'Premium passes are not available right now.'], 422);
        }
        $seatsLeft = $s->premiumSeatsLeft();
        if ($seatsLeft !== null && $seatsLeft <= 0) {
            return response()->json(['message' => 'Premium passes are sold out.'], 422);
        }

        $v = Validator::make($request->all(), [
            'full_name'          => 'required|string|min:2|max:120',
            'email'              => 'required|email:rfc|max:190',
            'phone'              => 'nullable|string|max:30|regex:/^[0-9+()\-\s]{6,30}$/',
            'consultation_focus' => 'required|in:career,monetization',
        ]);
        if ($v->fails()) {
            return response()->json(['message' => 'Please check the form.', 'errors' => $v->errors()], 422);
        }

        $email = mb_strtolower(trim($request->email));
        $reg = TvRegistration::where('email', $email)->first();

        if ($reg && $reg->isPremiumPaid()) {
            return response()->json([
                'message'      => 'You already have a Premium Career Pass with this email.',
                'already_paid' => true,
                'whatsapp_url' => $this->whatsappUrl($s),
            ], 200);
        }

        $paystack = $s->usesPaystackFor($this->countryCode());
        $currency = $paystack ? 'NGN' : 'USD';
        $amount   = $paystack ? (float) $s->price_ngn : (float) $s->price_usd;
        if ($amount <= 0) {
            return response()->json(['message' => 'The Premium price has not been set yet.'], 422);
        }

        $data = [
            'full_name'          => $this->clean($request->full_name, 120),
            'phone'              => $this->clean($request->phone, 30) ?: ($reg->phone ?? null),
            'consultation_focus' => $request->consultation_focus,
            'payment_status'     => 'pending',
            'currency'           => $currency,
            'amount'             => $amount,
        ];

        // Upgrading an existing free registration keeps one row per email;
        // they stay "free" until the payment is confirmed.
        $reg = $reg
            ? tap($reg)->update($data)
            : TvRegistration::create($data + ['email' => $email, 'tier' => 'free', 'ip_address' => $request->ip()]);

        try {
            $url = $paystack ? $this->paystackCheckout($reg, $amount) : $this->stripeCheckout($reg, $amount, $s->title);
        } catch (\Throwable $e) {
            Log::error('TV checkout failed: ' . $e->getMessage(), ['registration' => $reg->id]);
            $reg->update(['payment_status' => 'failed']);
            return response()->json(['message' => 'Could not start payment. Please try again.'], 500);
        }

        return response()->json(['checkout_url' => $url, 'currency' => $currency, 'amount' => $amount]);
    }

    public function verify(Request $request): JsonResponse
    {
        $provider = $request->query('provider');
        $reg = null;

        try {
            if ($provider === 'stripe' && $request->filled('session_id')) {
                $sessionId = (string) $request->query('session_id');
                $reg = TvRegistration::where('transaction_id', $sessionId)->first();
                if ($reg && $reg->payment_status !== 'paid') {
                    Stripe::setApiKey(config('services.stripe.secret'));
                    $session = StripeSession::retrieve($sessionId);
                    if ($session->payment_status === 'paid' && ($session->metadata->type ?? null) === 'tv_webinar') {
                        TvWebinarService::markPaid($reg, $session->amount_total / 100, $session->payment_intent ?? $sessionId, 'stripe', 'USD');
                    }
                }
            } elseif ($provider === 'paystack' && $request->filled('reference')) {
                $reference = (string) $request->query('reference');
                $reg = TvRegistration::where('transaction_id', $reference)->first();
                if ($reg && $reg->payment_status !== 'paid') {
                    $res = Http::withToken(config('services.paystack.secret'))
                        ->get('https://api.paystack.co/transaction/verify/' . rawurlencode($reference));
                    if ($res->successful() && $res->json('data.status') === 'success') {
                        TvWebinarService::markPaid($reg, $res->json('data.amount') / 100, $reference, 'paystack', 'NGN');
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning('TV verify failed: ' . $e->getMessage());
        }

        if (!$reg) {
            return response()->json(['message' => 'Payment not found.'], 404);
        }

        $reg->refresh();
        return response()->json([
            'paid'         => $reg->payment_status === 'paid',
            'status'       => $reg->payment_status,
            'first_name'   => explode(' ', trim($reg->full_name))[0],
            'whatsapp_url' => $this->whatsappUrl(TvWebinarSetting::current()),
        ]);
    }

    // ── Checkout helpers ────────────────────────────────────────────────

    private function stripeCheckout(TvRegistration $reg, float $amount, string $title): string
    {
        Stripe::setApiKey(config('services.stripe.secret'));
        $base = rtrim((string) config('app.tv_url'), '/');

        $session = StripeSession::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency'     => 'usd',
                    'product_data' => [
                        'name'        => 'Premium Career Pass — Learnexity TV',
                        'description' => mb_substr($title, 0, 200),
                    ],
                    'unit_amount' => (int) round($amount * 100),
                ],
                'quantity' => 1,
            ]],
            'mode'           => 'payment',
            'success_url'    => $base . '/?payment=success&provider=stripe&session_id={CHECKOUT_SESSION_ID}#register',
            'cancel_url'     => $base . '/?payment=cancelled#register',
            'customer_email' => $reg->email,
            'metadata'       => ['type' => 'tv_webinar', 'tv_registration_id' => (string) $reg->id],
        ]);

        $reg->update(['transaction_id' => $session->id, 'payment_method' => 'stripe']);
        return $session->url;
    }

    private function paystackCheckout(TvRegistration $reg, float $amount): string
    {
        $reference = 'TV-' . $reg->id . '-' . time();
        $base = rtrim((string) config('app.tv_url'), '/');

        $res = Http::withToken(config('services.paystack.secret'))
            ->post('https://api.paystack.co/transaction/initialize', [
                'email'        => $reg->email,
                'amount'       => (int) round($amount * 100),
                'currency'     => 'NGN',
                'reference'    => $reference,
                'callback_url' => $base . '/?payment=success&provider=paystack&reference=' . $reference . '#register',
                'metadata'     => ['type' => 'tv_webinar', 'tv_registration_id' => (string) $reg->id],
            ]);

        if (!$res->successful() || !$res->json('status')) {
            throw new \RuntimeException('Paystack initialization failed: ' . $res->body());
        }

        $reg->update(['transaction_id' => $reference, 'payment_method' => 'paystack']);
        return (string) $res->json('data.authorization_url');
    }

    // ── Small helpers ───────────────────────────────────────────────────

    private function countryCode(): ?string
    {
        try {
            return LocationService::getLocationInfo()['country_code'] ?? null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function whatsappUrl(TvWebinarSetting $s): ?string
    {
        $n = preg_replace('/\D+/', '', (string) $s->whatsapp_number);
        return $n ? "https://wa.me/{$n}" : null;
    }

    /** Hidden "website" field — real people never fill it. */
    private function isBot(Request $request): bool
    {
        return trim((string) $request->input('website', '')) !== '';
    }

    private function clean(?string $v, int $max): ?string
    {
        if ($v === null) return null;
        $v = strip_tags($v);
        $v = preg_replace('/[\x00-\x1F\x7F]/u', ' ', $v) ?? '';
        $v = trim(preg_replace('/\s+/u', ' ', $v) ?? '');
        return $v === '' ? null : mb_substr($v, 0, $max);
    }
}
