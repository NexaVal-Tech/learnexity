<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PublicReferrer;
use App\Models\ReferralHistory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

/**
 * Public Refer & Earn program.
 *
 * Non-student referrers sign up with email + password only.
 * JWT is issued from the 'public_referrer' guard.
 * ₦5,000 reward per successful referral signup.
 */
class PublicReferralController extends Controller
{
    // ─── Register ─────────────────────────────────────────────────────────────
    public function register(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|min:6',
        ]);

        $email = strtolower(trim($request->email));

        // ① Block if email already belongs to a student
        if (User::where('email', $email)->exists()) {
            return response()->json([
                'message'    => 'This email is registered as a student account.',
                'is_student' => true,
            ], 409);
        }

        // ② If referrer already exists, treat as login
        $existing = PublicReferrer::where('email', $email)->first();
        if ($existing) {
            if (!Hash::check($request->password, $existing->password)) {
                return response()->json([
                    'message' => 'An account with this email already exists. Please log in.',
                ], 409);
            }
            return $this->issueToken($existing);
        }

        // ③ Create new referrer
        DB::beginTransaction();
        try {
            $referrer = PublicReferrer::create([
                'email'         => $email,
                'password'      => Hash::make($request->password),
                'referral_code' => $this->generateCode(),
            ]);

            DB::commit();
            return $this->issueToken($referrer, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Registration failed. Please try again.'], 500);
        }
    }

    // ─── Login ────────────────────────────────────────────────────────────────
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $email = strtolower(trim($request->email));

        // Block students
        if (User::where('email', $email)->exists()) {
            return response()->json([
                'message'    => 'This email is registered as a student account.',
                'is_student' => true,
            ], 409);
        }

        $referrer = PublicReferrer::where('email', $email)->first();

        if (!$referrer || !Hash::check($request->password, $referrer->password)) {
            return response()->json(['message' => 'Invalid email or password.'], 401);
        }

        return $this->issueToken($referrer);
    }

    // ─── Stats (JWT protected via public_referrer guard) ──────────────────────
    public function stats(Request $request)
    {
        try {
            $referrer = JWTAuth::parseToken()->authenticate();
        } catch (JWTException $e) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$referrer instanceof PublicReferrer) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $history = ReferralHistory::where('public_referrer_id', $referrer->id)
            ->with('referredUser:id,name')
            ->orderByDesc('referred_at')
            ->get()
            ->map(fn($r) => [
                'id'                 => $r->id,
                'referred_user_name' => $r->referredUser?->name ?? 'Anonymous',
                'status'             => $r->status,
                'reward_amount'      => $r->reward_amount,
                'referred_at'        => $r->referred_at,
            ]);

        return response()->json([
            'statistics' => [
                'total_referrals'      => $referrer->total_referrals,
                'successful_referrals' => $referrer->successful_referrals,
                'pending_referrals'    => $referrer->pending_referrals,
                'total_earnings'       => $referrer->total_earnings,
            ],
            'history' => $history,
        ]);
    }

    // ─── Called from AuthController@register when a new User registers ────────
    public static function handleNewSignup(User $newUser, string $referralCode): void
    {
        $referrer = PublicReferrer::where('referral_code', $referralCode)->first();
        if (!$referrer) return;

        // Avoid duplicates
        if (ReferralHistory::where('referred_user_id', $newUser->id)
            ->where('public_referrer_id', $referrer->id)->exists()) {
            return;
        }

        DB::transaction(function () use ($referrer, $newUser) {
            ReferralHistory::create([
                'public_referrer_id' => $referrer->id,
                'referred_user_id'   => $newUser->id,
                'status'             => 'pending',
                'reward_amount'      => 5000.00, // ₦5,000
                'referred_at'        => now(),
            ]);

            $referrer->increment('total_referrals');
            $referrer->increment('pending_referrals');
        });
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private function issueToken(PublicReferrer $referrer, int $status = 200)
    {
        try {
            // Use the public_referrer guard to generate a JWT for this model
            $token = JWTAuth::fromUser($referrer);
        } catch (JWTException $e) {
            return response()->json(['message' => 'Could not generate token.'], 500);
        }

        return response()->json([
            'token'         => $token,
            'email'         => $referrer->email,
            'referral_code' => $referrer->referral_code,
            'referral_link' => $this->referralLink($referrer->referral_code),
        ], $status);
    }

    private function referralLink(string $code): string
    {
        $base = config('app.frontend_url', env('FRONTEND_URL', 'https://learnexity.org'));
        return $base . '/ref/' . $code;
    }

    private function generateCode(): string
    {
        do {
            $code = 'RE' . strtoupper(Str::random(7));
        } while (PublicReferrer::where('referral_code', $code)->exists());
        return $code;
    }
}