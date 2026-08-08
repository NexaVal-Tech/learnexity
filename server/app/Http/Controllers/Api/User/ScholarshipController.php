<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Mail\ScholarshipResultMail;
use App\Models\Course;
use App\Models\RegistrationFeeSetting;
use App\Models\Scholarship;
use App\Services\LocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ScholarshipController extends Controller
{
    // ─── Scholarship rules (two-tier model — no more 0%/rejected outcome) ────
    //
    // Eligibility: ONE scholarship per user ever (across all courses).
    // The award is tied to exactly one course — the one applied for.
    //
    // Outcome now has two tiers, decided in priority order:
    //  • Student (employed or not)                        → 100% (full tuition)
    //  • Not a student but unemployed                      → 100% (full tuition)
    //  • Employed with income under ₦100k / $100           → 100% (full tuition)
    //  • Everyone else                                     → partial award (admin-configured
    //                                                          percentage, default 50% — see
    //                                                          RegistrationFeeSetting::
    //                                                          partial_scholarship_percentage)
    //
    // Every applicant is approved now — there is no reject outcome. A 100%
    // award means the student pays only the flat platform registration fee
    // (set by the admin, see RegistrationFeeSetting) instead of the course
    // price. A partial award means the student pays that percentage off the
    // normal course price through the regular payment flow (track
    // selection, installments still available). See PricingService, the
    // single source of truth for what anyone actually gets charged.

    /**
     * Check application eligibility.
     * CHANGE 5: Now rejects if user has ANY prior application (not just this course).
     */
    public function checkEligibility(Request $request, string $courseId): JsonResponse
    {
        $user = auth()->user();

        // CHANGE 5: one scholarship per user across ALL courses
        $anyExisting = Scholarship::where('user_id', $user->id)->first();

        if ($anyExisting) {
            // If it's for this exact course, return the existing application so the UI can show it
            if ($anyExisting->course_id === $courseId) {
                return response()->json([
                    'eligible'             => false,
                    'reason'               => 'already_applied',
                    'existing_application' => $anyExisting,
                ]);
            }

            // Applied on a different course
            return response()->json([
                'eligible' => false,
                'reason'   => 'already_applied',
            ]);
        }

        // Check if user already used a scholarship
        $hasUsed = Scholarship::where('user_id', $user->id)->where('is_used', true)->exists();
        if ($hasUsed) {
            return response()->json([
                'eligible' => false,
                'reason'   => 'scholarship_already_used',
            ]);
        }

        $course = Course::where('course_id', $courseId)->first();
        if (! $course) {
            return response()->json(['eligible' => false, 'reason' => 'course_not_found'], 404);
        }

        return response()->json([
            'eligible'                        => true,
            'course_name'                     => $course->title,
            'partial_scholarship_percentage'  => RegistrationFeeSetting::current()->getPartialScholarshipPercentageValue(),
        ]);
    }

    /**
     * Submit a scholarship application (CHANGE 5: simplified 4-question form).
     */
    public function apply(Request $request, string $courseId): JsonResponse
    {
        $user = auth()->user();

        // CHANGE 5: one scholarship per user ever
        $anyExisting = Scholarship::where('user_id', $user->id)->first();
        if ($anyExisting) {
            return response()->json([
                'message'     => 'You have already submitted a scholarship application. Each user may only apply once across all courses.',
                'scholarship' => $anyExisting->course_id === $courseId ? $anyExisting : null,
            ], 409);
        }

        $hasUsed = Scholarship::where('user_id', $user->id)->where('is_used', true)->exists();
        if ($hasUsed) {
            return response()->json([
                'message' => 'You have already used your scholarship on another course.',
            ], 409);
        }

        // ── Validate the new 4-question form ────────────────────────────────
        $validator = Validator::make($request->all(), [
            'weekly_hours' => 'required|in:1_3,4_6,7_10,10_plus',
            'is_student'   => 'required|in:yes,no',
            'is_employed'  => 'required|in:yes,no',
            'salary_range' => 'required|in:under_100,100_200,above_200,not_employed',
            'country'      => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Please complete all fields.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $course = Course::where('course_id', $courseId)->firstOrFail();

        $isStudent   = $request->input('is_student') === 'yes';
        $isEmployed  = $request->input('is_employed') === 'yes';
        $salaryRange = $request->input('salary_range'); // under_100 | 100_200 | above_200 | not_employed
        $country     = trim($request->input('country'));

        // Normalise country to check for Nigeria
        $isNigeria = in_array(strtolower($country), [
            'nigeria', 'ng', 'nga', 'nigerian',
        ], true);

        // ── Auto-decision (two-tier model — no more reject outcome) ──────────
        [$status, $discountPercentage, $reviewNote] = $this->autoDecide(
            $isStudent,
            $isEmployed,
            $salaryRange,
            $isNigeria
        );

        $answers = $request->only(['weekly_hours', 'is_student', 'is_employed', 'salary_range', 'country']);

        $scholarship = Scholarship::create([
            'user_id'             => $user->id,
            'course_id'           => $courseId,
            'course_name'         => $course->title,
            'status'              => $status,
            'score'               => 0,          // not used with new rule-based system
            'location_bonus'      => $isNigeria ? 1 : 0,
            'total_score'         => 0,
            'discount_percentage' => $discountPercentage,
            'answers'             => $answers,
            'review_notes'        => $reviewNote,
            'applicant_country'   => $country,
            'applicant_ip'        => $request->ip(),
        ]);

        // Keep the onboarding state in sync — screening is now tied to this
        // course, so make sure it's also the user's "intended" one.
        if ($user->intended_course_id !== $courseId) {
            $user->update(['intended_course_id' => $courseId]);
        }

        Log::info('🎓 Scholarship auto-processed (two-tier model)', [
            'user_id'             => $user->id,
            'course_id'           => $courseId,
            'is_student'          => $isStudent,
            'is_employed'         => $isEmployed,
            'salary'              => $salaryRange,
            'is_nigeria'          => $isNigeria,
            'status'              => $status,
            'discount_percentage' => $discountPercentage,
        ]);

        $this->sendResultEmail($user, $scholarship, $course);

        return response()->json([
            'message'     => $discountPercentage >= 100
                ? "Congratulations! You've been awarded a full-tuition scholarship. You'll only pay the registration fee to secure your spot."
                : "Congratulations! You've been awarded a {$discountPercentage}% scholarship — it'll be applied automatically when you check out.",
            'scholarship' => $scholarship,
        ], 201);
    }

    /**
     * Send the "Proceed to Payment" result email — fired for BOTH approved
     * and rejected outcomes (user gets a CTA either way). For an APPROVED
     * outcome this also creates the enrollment now (pending, registration
     * fee) rather than waiting for the person to click through the modal or
     * payment page — being awarded a scholarship should immediately show up
     * as "enrolled, payment pending" in their dashboard, the same way
     * starting checkout on a normal course does. Every applicant is
     * approved now (100% or the partial tier) — there's no reject outcome,
     * so this always runs.
     *
     * Reuses CourseEnrollmentController::enroll() — the single source of
     * truth for enrollment creation/pricing — rather than duplicating it.
     */
    private function sendResultEmail(\App\Models\User $user, Scholarship $scholarship, Course $course): void
    {
        $isApproved = $scholarship->status === 'approved';
        $currency   = LocationService::detectCurrency();
        $paymentUrl = rtrim(config('app.frontend_url'), '/') . '/courses/' . $course->course_id;
        $amountDue  = null;

        if ($isApproved) {
            try {
                $controller  = new \App\Http\Controllers\Api\User\CourseEnrollmentController();
                // self_paced is just a starting point — if the person picks
                // a different track (one_on_one/group_mentorship) on the
                // payment page, that page's own syncPricing() re-calls
                // enroll() and corrects the amount/tier, so this default
                // never under/over-charges anyone.
                $fakeRequest = new Request([], [
                    'learning_track' => 'self_paced',
                    'payment_type'   => 'onetime',
                ]);
                $response = $controller->enroll($fakeRequest, $course->course_id);
                $data     = $response->getData(true);

                if (!empty($data['enrollment_id'])) {
                    $paymentUrl = rtrim(config('app.frontend_url'), '/') . '/user/payment/' . $data['enrollment_id'];
                    $amountDue  = $data['total_amount'] ?? null;
                    $currency   = $data['currency'] ?? $currency;
                }
            } catch (\Exception $e) {
                Log::error('❌ [ScholarshipResult] Failed to prepare enrollment for email link', [
                    'user_id'       => $user->id,
                    'course_id'     => $course->course_id,
                    'error'         => $e->getMessage(),
                ]);
                // Fall back to the course page URL set above — the frontend
                // scholarship/payment flow can still take it from there.
            }
        }

        try {
            Mail::to($user->email)->queue(
                new ScholarshipResultMail($user, $scholarship, $isApproved, $paymentUrl, $amountDue, $currency)
            );
        } catch (\Exception $e) {
            Log::error('❌ [ScholarshipResult] Failed to send result email', [
                'user_id' => $user->id,
                'error'   => $e->getMessage(),
            ]);
        }
    }

    /**
     * Get scholarship status for a specific course (payment page).
     */
    public function getForCourse(string $courseId): JsonResponse
    {
        $user = auth()->user();

        $scholarship = Scholarship::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->first();

        if (! $scholarship) {
            return response()->json(['scholarship' => null]);
        }

        return response()->json(['scholarship' => $scholarship]);
    }

    /**
     * Get all of the authenticated user's scholarship applications.
     */
    public function myApplications(): JsonResponse
    {
        $scholarships = Scholarship::where('user_id', auth()->id())
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['scholarships' => $scholarships]);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    /**
     * Rule-based scholarship decision — two-tier model, no reject outcome.
     *
     * Every applicant is approved. Rules in priority order:
     *  1. Student (any employment status)                 → 100% (full tuition)
     *  2. Not a student but unemployed                     → 100% (full tuition)
     *  3. Employed + income < ₦100k/$100 (under_100)      → 100% (full tuition)
     *  4. Everyone else                                    → partial award (admin-configured
     *                                                          percentage, default 50%)
     *
     * @return array{0: string, 1: float, 2: string}  [status, discount_percentage, review_note]
     */
    private function autoDecide(bool $isStudent, bool $isEmployed, string $salaryRange, bool $isNigeria): array
    {
        // Student (employed or unemployed)
        if ($isStudent) {
            return ['approved', 100.0, 'Full-tuition scholarship awarded — student applicant.'];
        }

        // Not a student but unemployed
        if (! $isStudent && ! $isEmployed) {
            return ['approved', 100.0, 'Full-tuition scholarship awarded — unemployed applicant.'];
        }

        // Employed with income under ₦100k / $100
        if ($isEmployed && $salaryRange === 'under_100') {
            return ['approved', 100.0, 'Full-tuition scholarship awarded — low-income employed applicant.'];
        }

        // Everyone else still gets the partial (admin-configured) award —
        // there's no more reject outcome.
        $partialPercent = RegistrationFeeSetting::current()->getPartialScholarshipPercentageValue();

        return [
            'approved',
            $partialPercent,
            "{$partialPercent}% scholarship awarded — does not meet full-tuition criteria based on current employment and income level.",
        ];
    }
}