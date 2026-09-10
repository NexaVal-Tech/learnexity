<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ScholarshipResultMail;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\Scholarship;
use App\Services\LocationService;
use App\Services\PricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AdminScholarshipController extends Controller
{
    // ─────────────────────────────────────────────
    // GET /api/admin/scholarships/stats
    // ─────────────────────────────────────────────
    public function stats()
    {
        return response()->json([
            'total' => Scholarship::count(),
            'pending' => Scholarship::where('status', 'pending')->count(),
            'approved' => Scholarship::where('status', 'approved')->count(),
            'rejected' => Scholarship::where('status', 'rejected')->count(),
            'revoked' => Scholarship::where('status', 'revoked')->count(),
            // Was already referenced by the admin UI (statsDisplay) but never
            // actually returned here, so it always rendered as "undefined".
            'used' => Scholarship::where('is_used', true)->count(),
        ]);
    }

    // ─────────────────────────────────────────────
    // GET /api/admin/scholarships
    // ─────────────────────────────────────────────
    public function index(Request $request)
    {
        $query = Scholarship::with('user')
            ->orderBy('created_at', 'desc');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $query->where('course_name', 'like', "%{$request->search}%");
        }

        $perPage = $request->per_page ?? 20;

        return response()->json(
            $query->paginate($perPage)
        );
    }

    // ─────────────────────────────────────────────
    // PATCH /api/admin/scholarships/{id}/review
    // ─────────────────────────────────────────────
    //
    // Two-tier model: every scholarship is approved — there's no reject
    // outcome anymore. Admins can manually set the award to 100% (full
    // tuition) or any other percentage (e.g. the partial tier) if they need
    // to override the auto-decision.
    public function review(Request $request, $id)
    {
        $scholarship = Scholarship::findOrFail($id);

        $validated = $request->validate([
            'discount_percentage' => 'required|numeric|min:0|max:100',
            'review_notes'        => 'nullable|string',
        ]);

        $scholarship->update([
            'status'              => 'approved',
            'discount_percentage' => $validated['discount_percentage'],
            'review_notes'        => $validated['review_notes'] ?? $scholarship->review_notes,
            // Only start the 30-day countdown the first time this row
            // becomes approved — an admin overriding the discount tier on
            // an already-approved scholarship shouldn't reset the clock.
            'approved_at'         => $scholarship->approved_at ?? now(),
        ]);

        // Notify the applicant either way, with a "Proceed to Payment" CTA —
        // same email the auto-decision path sends.
        $course = Course::where('course_id', $scholarship->course_id)->first();
        $user   = $scholarship->user;
        if ($course && $user) {
            $this->sendResultEmail($user, $scholarship, $course);
        }

        return response()->json([
            'message' => 'Scholarship reviewed successfully',
            'scholarship' => $scholarship
        ]);
    }

    // ─────────────────────────────────────────────
    // PATCH /api/admin/scholarships/{id}/revoke
    // ─────────────────────────────────────────────
    //
    // Revokes an approved-but-unused scholarship, for any reason (any
    // enrollment, any reason — mirrors the course-access-grant override
    // model). Once status flips away from 'approved', PricingService stops
    // finding it (see its query: ->where('status', 'approved')), so every
    // future price calculation for this user+course reverts to the real
    // course price automatically — this includes the pending-payment
    // nudge email, which re-syncs pricing on every send. We also resync
    // any currently-pending enrollment immediately below, so the student
    // doesn't have to wait for the next nudge cycle to see the corrected
    // price if they open their payment page right away.
    //
    // No notification email is sent (admin's call) — the student simply
    // sees the real price next time they're emailed or visit checkout.
    //
    // A scholarship that's already been used (is_used = true) can't be
    // revoked here — the payment already completed at the discounted
    // price, so revoking status wouldn't claw anything back and would
    // just leave the record in a confusing state.
    public function revoke(Request $request, $id)
    {
        $scholarship = Scholarship::findOrFail($id);

        if ($scholarship->is_used) {
            return response()->json([
                'message' => 'This scholarship has already been used to complete a payment — it can\'t be revoked.',
            ], 422);
        }

        if ($scholarship->status === 'revoked') {
            return response()->json(['message' => 'Already revoked', 'scholarship' => $scholarship]);
        }

        $scholarship->update([
            'status' => 'revoked',
            'review_notes' => trim(($scholarship->review_notes ? $scholarship->review_notes . ' ' : '')
                . '[Revoked by admin on ' . now()->toDateString() . ' — student may reapply.]'),
        ]);

        // Immediately resync any pending enrollment for this course to the
        // real price, rather than waiting for the next scheduled nudge run.
        $enrollment = CourseEnrollment::where('user_id', $scholarship->user_id)
            ->where('course_id', $scholarship->course_id)
            ->where('payment_status', '!=', 'completed')
            ->latest()
            ->first();

        if ($enrollment) {
            $course = Course::where('course_id', $scholarship->course_id)->first();
            $user = $scholarship->user;

            if ($course && $user) {
                $pricing = PricingService::calculate(
                    $user,
                    $course,
                    $enrollment->currency ?? 'USD',
                    $enrollment->learning_track ?? 'self_paced',
                    $enrollment->payment_type ?? 'onetime'
                );

                $enrollment->update([
                    'total_amount'        => $pricing['amount'],
                    'installment_amount'  => $pricing['installment_amount'],
                    'total_installments'  => $pricing['total_installments'],
                    'payment_type'        => $pricing['payment_type'],
                    'is_registration_fee' => $pricing['is_registration_fee'],
                    'scholarship_id'      => null,
                ]);

                Log::info('🎓 [ScholarshipRevoke] Resynced enrollment to real price', [
                    'scholarship_id' => $scholarship->id,
                    'enrollment_id'  => $enrollment->id,
                    'new_amount'     => $pricing['amount'],
                ]);
            }
        }

        return response()->json([
            'message' => 'Scholarship revoked. The student can reapply if they want to.',
            'scholarship' => $scholarship->fresh(),
        ]);
    }

    /**
     * Send the scholarship result email (mirrors
     * ScholarshipController::sendResultEmail — kept as a small private copy
     * here since admin review is a distinct entry point and the two
     * controllers don't share a base class for this). For an APPROVED
     * outcome this also creates the enrollment now (pending, registration
     * fee) so it shows up in the student's dashboard immediately, rather
     * than only after they click through an email/modal. Every scholarship
     * is approved now (100% or partial) — there's no reject outcome.
     */
    private function sendResultEmail(\App\Models\User $user, Scholarship $scholarship, Course $course): void
    {
        $isApproved = $scholarship->status === 'approved';
        // Use the applicant's own captured IP (not the admin's, since this
        // runs inside an admin request) so the currency shown matches what
        // the student will actually see when they open the payment page.
        $currency   = LocationService::detectCurrency($scholarship->applicant_ip);
        $paymentUrl = rtrim(config('app.frontend_url'), '/') . '/courses/' . $course->course_id;
        $amountDue  = null;

        if ($isApproved) {
            try {
                $controller  = new \App\Http\Controllers\Api\User\CourseEnrollmentController();
                $fakeRequest = new Request([], [
                    'learning_track' => 'self_paced',
                    'payment_type'   => 'onetime',
                ]);
                $fakeRequest->setUserResolver(fn () => $user);
                auth()->setUser($user);

                $response = $controller->enroll($fakeRequest, $course->course_id);
                $data     = $response->getData(true);

                if (!empty($data['enrollment_id'])) {
                    $paymentUrl = rtrim(config('app.frontend_url'), '/') . '/user/payment/' . $data['enrollment_id'];
                    $amountDue  = $data['total_amount'] ?? null;
                    $currency   = $data['currency'] ?? $currency;
                }
            } catch (\Exception $e) {
                Log::error('❌ [AdminScholarshipReview] Failed to prepare enrollment for email link', [
                    'user_id'   => $user->id,
                    'course_id' => $course->course_id,
                    'error'     => $e->getMessage(),
                ]);
            }
        }

        try {
            Mail::to($user->email)->queue(
                new ScholarshipResultMail($user, $scholarship, $isApproved, $paymentUrl, $amountDue, $currency)
            );
        } catch (\Exception $e) {
            Log::error('❌ [AdminScholarshipReview] Failed to send result email', [
                'user_id' => $user->id,
                'error'   => $e->getMessage(),
            ]);
        }
    }
}