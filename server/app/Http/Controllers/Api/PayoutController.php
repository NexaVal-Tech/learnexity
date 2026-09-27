<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\AdminPayoutRequestedMail;
use App\Models\PayoutRequest;
use App\Models\PublicReferrer;
use App\Models\ReferralCode;
use App\Models\ReferralHistory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

/**
 * Refer & Earn payouts — shared by both referrer types.
 *
 * Students hit these routes under the 'jwt.auth' guard (their own account,
 * via $request->user() as a User); public referrers hit the same methods
 * under 'jwt.auth.re' (via $request->user() as a PublicReferrer). Which one
 * it is is resolved once, in resolvePayee(), and every method below works
 * off that generic pair instead of duplicating the logic per guard.
 */
class PayoutController extends Controller
{
    /** Current bank details + available balance, for the payout request form. */
    public function balance(Request $request)
    {
        [$type, $payee] = $this->resolvePayee($request);

        return response()->json([
            'available_balance' => $this->availableBalance($type, $payee),
            'bank_name'          => $payee->payout_bank_name,
            'account_number'     => $payee->payout_account_number,
            'account_name'       => $payee->payout_account_name,
        ]);
    }

    /** The referrer's own payout request history. */
    public function history(Request $request)
    {
        [$type, $payee] = $this->resolvePayee($request);

        $history = PayoutRequest::where('payee_type', $type)
            ->where('payee_id', $payee->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['history' => $history]);
    }

    /** Save/update bank details and (optionally) submit a payout request in one step. */
    public function requestPayout(Request $request)
    {
        [$type, $payee] = $this->resolvePayee($request);

        $validated = $request->validate([
            'bank_name'      => 'required|string|max:100',
            'account_number' => 'required|string|max:20',
            'account_name'   => 'required|string|max:150',
        ]);

        $available = $this->availableBalance($type, $payee);

        if ($available <= 0) {
            return response()->json([
                'message' => 'You have no available balance to request a payout for yet.',
            ], 422);
        }

        // Save the details on the referrer's own record so future requests
        // can prefill from them — the payout_requests row below still keeps
        // its own snapshot regardless of what happens to these later.
        $payee->update([
            'payout_bank_name'      => $validated['bank_name'],
            'payout_account_number' => $validated['account_number'],
            'payout_account_name'   => $validated['account_name'],
        ]);

        $payout = PayoutRequest::create([
            'payee_type'      => $type,
            'payee_id'        => $payee->id,
            'amount'          => $available,
            'bank_name'       => $validated['bank_name'],
            'account_number'  => $validated['account_number'],
            'account_name'    => $validated['account_name'],
            'status'          => 'pending',
        ]);

        $this->notifyAdmin($payout, $type, $payee);

        return response()->json([
            'message' => 'Payout request submitted. We\'ll notify you once it\'s processed.',
            'payout'  => $payout,
        ], 201);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    /**
     * @return array{0: 'user'|'public_referrer', 1: User|PublicReferrer}
     */
    private function resolvePayee(Request $request): array
    {
        $user = $request->user();
        return $user instanceof PublicReferrer ? ['public_referrer', $user] : ['user', $user];
    }

    /**
     * Total completed referral rewards, minus whatever's already been paid
     * out or is sitting in a pending/approved request (so the same balance
     * can't be requested twice while a request is still in flight).
     */
    private function availableBalance(string $type, $payee): float
    {
        $earned = $type === 'user'
            ? ReferralHistory::where('referrer_id', $payee->id)->where('status', 'completed')->sum('reward_amount')
            : ReferralHistory::where('public_referrer_id', $payee->id)->where('status', 'completed')->sum('reward_amount');

        $reserved = PayoutRequest::where('payee_type', $type)
            ->where('payee_id', $payee->id)
            ->whereIn('status', ['pending', 'approved'])
            ->sum('amount');

        return max(0, round((float) $earned - (float) $reserved, 2));
    }

    private function notifyAdmin(PayoutRequest $payout, string $type, $payee): void
    {
        try {
            $adminEmail = env('ADMIN_NOTIFICATION_EMAIL');
            if ($adminEmail) {
                Mail::to($adminEmail)->queue(new AdminPayoutRequestedMail($payout, $type, $payee));
            } else {
                Log::warning('⚠️ ADMIN_NOTIFICATION_EMAIL not set — payout request admin notification skipped');
            }
        } catch (\Exception $e) {
            Log::error('❌ Failed to send admin payout-request notification', [
                'payout_id' => $payout->id,
                'error'     => $e->getMessage(),
            ]);
        }
    }
}
