<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PayoutApprovedMail;
use App\Mail\PayoutDeclinedMail;
use App\Models\PayoutRequest;
use App\Models\PublicReferrer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AdminPayoutController extends Controller
{
    // GET /api/admin/payouts
    public function index(Request $request)
    {
        $query = PayoutRequest::with('admin:id,name,email')->orderByDesc('created_at');

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $perPage = $request->per_page ?? 20;
        $paginated = $query->paginate($perPage);

        // Attach the payee (User or PublicReferrer) to each row — two small
        // batched lookups instead of N+1 queries.
        $userIds = $paginated->getCollection()->where('payee_type', 'user')->pluck('payee_id')->unique();
        $refIds  = $paginated->getCollection()->where('payee_type', 'public_referrer')->pluck('payee_id')->unique();

        $users = User::whereIn('id', $userIds)->get(['id', 'name', 'email'])->keyBy('id');
        $refs  = PublicReferrer::whereIn('id', $refIds)->get(['id', 'email'])->keyBy('id');

        $paginated->getCollection()->transform(function ($p) use ($users, $refs) {
            $p->payee = $p->payee_type === 'user'
                ? ($users[$p->payee_id] ?? null)
                : ($refs[$p->payee_id] ?? null);
            return $p;
        });

        return response()->json($paginated);
    }

    // GET /api/admin/payouts/stats
    public function stats()
    {
        return response()->json([
            'pending'  => PayoutRequest::where('status', 'pending')->count(),
            'approved' => PayoutRequest::where('status', 'approved')->count(),
            'declined' => PayoutRequest::where('status', 'declined')->count(),
            'pending_amount' => PayoutRequest::where('status', 'pending')->sum('amount'),
            'paid_amount'    => PayoutRequest::where('status', 'approved')->sum('amount'),
        ]);
    }

    // POST /api/admin/payouts/{id}/approve
    // Admin has already sent the money manually via bank transfer — this
    // just records that the transaction happened.
    public function approve(Request $request, $id)
    {
        $payout = PayoutRequest::findOrFail($id);

        if ($payout->status !== 'pending') {
            return response()->json(['message' => 'This request has already been processed.'], 422);
        }

        $payout->update([
            'status'       => 'approved',
            'admin_note'   => $request->admin_note,
            'processed_by' => $request->user()->id,
            'processed_at' => now(),
        ]);

        $this->notifyPayee($payout, new PayoutApprovedMail($payout));

        return response()->json(['message' => 'Payout marked as paid.', 'payout' => $payout]);
    }

    // POST /api/admin/payouts/{id}/decline
    public function decline(Request $request, $id)
    {
        $request->validate(['admin_note' => 'nullable|string|max:500']);

        $payout = PayoutRequest::findOrFail($id);

        if ($payout->status !== 'pending') {
            return response()->json(['message' => 'This request has already been processed.'], 422);
        }

        $payout->update([
            'status'       => 'declined',
            'admin_note'   => $request->admin_note,
            'processed_by' => $request->user()->id,
            'processed_at' => now(),
        ]);

        $this->notifyPayee($payout, new PayoutDeclinedMail($payout));

        return response()->json(['message' => 'Payout request declined.', 'payout' => $payout]);
    }

    private function notifyPayee(PayoutRequest $payout, $mailable): void
    {
        try {
            $payee = $payout->payee();
            if ($payee && $payee->email) {
                Mail::to($payee->email)->queue($mailable);
            }
        } catch (\Exception $e) {
            Log::error('❌ Failed to send payout status notification', [
                'payout_id' => $payout->id,
                'error'     => $e->getMessage(),
            ]);
        }
    }
}
