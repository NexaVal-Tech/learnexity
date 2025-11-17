<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReferralCode;
use App\Models\ReferralHistory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ReferralController extends Controller
{
    /**
     * Check if user has a referral code
     */
    public function checkStatus(Request $request)
    {
        $hasReferral = ReferralCode::where('user_id', $request->user()->id)->exists();
        
        return response()->json([
            'has_referral' => $hasReferral
        ]);
    }

    /**
     * Create/Apply for a referral code
     */
    public function createReferralCode(Request $request)
    {
        $user = $request->user();

        // Check if user already has a referral code
        $existingCode = ReferralCode::where('user_id', $user->id)->first();
        if ($existingCode) {
            return response()->json([
                'message' => 'You already have a referral code',
                'referral_code' => $existingCode->referral_code,
                'referral_link' => $this->generateReferralLink($existingCode->referral_code)
            ], 200);
        }

        // Generate unique referral code
        $referralCode = $this->generateUniqueCode();

        // Create referral code record
        $newCode = ReferralCode::create([
            'user_id' => $user->id,
            'referral_code' => $referralCode,
        ]);

        return response()->json([
            'message' => 'Referral code created successfully',
            'referral_code' => $referralCode,
            'referral_link' => $this->generateReferralLink($referralCode)
        ], 201);
    }

    /**
     * Get user's referral data (code, statistics, history)
     */
    public function getReferralData(Request $request)
    {
        $user = $request->user();

        $referralCode = ReferralCode::where('user_id', $user->id)->first();

        if (!$referralCode) {
            return response()->json([
                'message' => 'No referral code found'
            ], 404);
        }

        // Get referral history
        $history = ReferralHistory::where('referrer_id', $user->id)
            ->with('referredUser:id,name')
            ->orderBy('referred_at', 'desc')
            ->get()
            ->map(function ($ref) {
                return [
                    'id' => $ref->id,
                    'referrer_id' => $ref->referrer_id,
                    'referred_user_id' => $ref->referred_user_id,
                    'referred_user_name' => $ref->referredUser->name,
                    'status' => $ref->status,
                    'reward_amount' => $ref->reward_amount,
                    'referred_at' => $ref->referred_at,
                    'completed_at' => $ref->completed_at,
                ];
            });

        // Update streak calculation
        $this->updateStreak($referralCode);

        return response()->json([
            'referral_code' => [
                'id' => $referralCode->id,
                'user_id' => $referralCode->user_id,
                'referral_code' => $referralCode->referral_code,
                'referral_link' => $this->generateReferralLink($referralCode->referral_code),
                'total_referrals' => $referralCode->total_referrals,
                'successful_referrals' => $referralCode->successful_referrals,
                'pending_referrals' => $referralCode->pending_referrals,
                'total_rewards' => $referralCode->total_rewards,
                'current_streak_months' => $referralCode->current_streak_months,
                'created_at' => $referralCode->created_at,
                'updated_at' => $referralCode->updated_at,
            ],
            'statistics' => [
                'total_referrals' => $referralCode->total_referrals,
                'successful_referrals' => $referralCode->successful_referrals,
                'pending_referrals' => $referralCode->pending_referrals,
                'total_rewards' => $referralCode->total_rewards,
                'current_streak_months' => $referralCode->current_streak_months,
            ],
            'history' => $history
        ]);
    }

    /**
     * Validate a referral code
     */
    public function validateReferralCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string'
        ]);

        $referralCode = ReferralCode::where('referral_code', $request->code)->first();

        if (!$referralCode) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid referral code'
            ], 404);
        }

        return response()->json([
            'valid' => true,
            'message' => 'Valid referral code'
        ]);
    }

    /**
     * Process referral (called when referred user completes first sprint)
     */
    public function processReferral(User $referredUser)
    {
        if (!$referredUser->referred_by_code) {
            return;
        }

        $referralCode = ReferralCode::where('referral_code', $referredUser->referred_by_code)->first();

        if (!$referralCode) {
            return;
        }

        // Check if referral already exists
        $existingReferral = ReferralHistory::where('referred_user_id', $referredUser->id)->first();

        if (!$existingReferral) {
            // Create new referral record
            ReferralHistory::create([
                'referrer_id' => $referralCode->user_id,
                'referred_user_id' => $referredUser->id,
                'status' => 'pending',
                'reward_amount' => 30.00,
                'referred_at' => now(),
            ]);

            // Update referral code stats
            $referralCode->increment('total_referrals');
            $referralCode->increment('pending_referrals');
            $referralCode->update(['last_referral_at' => now()]);
        }
    }

    /**
     * Complete referral (called when referred user completes first sprint)
     */
    public function completeReferral(User $referredUser)
    {
        $referral = ReferralHistory::where('referred_user_id', $referredUser->id)
            ->where('status', 'pending')
            ->first();

        if (!$referral) {
            return;
        }

        DB::transaction(function () use ($referral) {
            // Update referral status
            $referral->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            // Update referral code stats
            $referralCode = ReferralCode::where('user_id', $referral->referrer_id)->first();
            $referralCode->decrement('pending_referrals');
            $referralCode->increment('successful_referrals');
            $referralCode->increment('total_rewards', $referral->reward_amount);

            // Here you can add logic to credit the referrer's account
            // For example: add $30 to their wallet, create a coupon, etc.
        });
    }

    /**
     * Generate unique referral code
     */
    private function generateUniqueCode(): string
    {
        do {
            $code = 'REF' . strtoupper(Str::random(6));
        } while (ReferralCode::where('referral_code', $code)->exists());

        return $code;
    }

    /**
     * Generate referral link
     */
    private function generateReferralLink(string $code): string
    {
        $frontendUrl = config('app.frontend_url', 'https://learnexity.org');
        return $frontendUrl . '/ref/' . $code;
    }

    /**
     * Update streak calculation
     */
    private function updateStreak(ReferralCode $referralCode): void
    {
        if (!$referralCode->last_referral_at) {
            $referralCode->update(['current_streak_months' => 0]);
            return;
        }

        $monthsSinceLastReferral = now()->diffInMonths($referralCode->last_referral_at);

        if ($monthsSinceLastReferral > 1) {
            // Streak broken
            $referralCode->update(['current_streak_months' => 0]);
        } else {
            // Calculate streak
            $firstReferral = ReferralHistory::where('referrer_id', $referralCode->user_id)
                ->orderBy('referred_at', 'asc')
                ->first();

            if ($firstReferral) {
                $totalMonths = now()->diffInMonths($firstReferral->referred_at);
                $referralCode->update(['current_streak_months' => $totalMonths]);
            }
        }
    }
}