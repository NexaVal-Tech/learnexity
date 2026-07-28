<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ScholarshipResultMail;
use App\Models\Course;
use App\Models\Scholarship;
use App\Services\LocationService;
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
    // Full-tuition model: there's no discount_percentage input anymore —
    // approving a scholarship always means "full tuition, pay the flat
    // registration fee only". The percentage tiers (25%/50%/75%) are gone.
    public function review(Request $request, $id)
    {
        $scholarship = Scholarship::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'review_notes' => 'nullable|string',
        ]);

        // discount_percentage is legacy-only now; force to 0 regardless of
        // what it held before so nothing downstream can read a stale %.
        $scholarship->update(array_merge($validated, [
            'discount_percentage' => 0,
        ]));

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

    /**
     * Send the scholarship result email (mirrors
     * ScholarshipController::sendResultEmail — kept as a small private copy
     * here since admin review is a distinct entry point and the two
     * controllers don't share a base class for this). For an APPROVED
     * outcome this also creates the enrollment now (pending, registration
     * fee) so it shows up in the student's dashboard immediately, rather
     * than only after they click through an email/modal. Rejected
     * applicants are not auto-enrolled.
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