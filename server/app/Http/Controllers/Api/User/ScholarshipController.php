<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Mail\ScholarshipResultMail;
use App\Models\Course;
use App\Models\Scholarship;
use App\Services\LocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ScholarshipController extends Controller
{
    // ─── Scholarship rules (CHANGE 5 / full-tuition model) ───────────────────
    //
    // Eligibility: ONE scholarship per user ever (across all courses).
    // Full tuition is tied to exactly one course — the one applied for.
    //
    // Outcome is now BINARY — there are no more 25%/50%/75% tiers:
    //  • Student (employed or not)                        → approved (full tuition)
    //  • Not a student but unemployed                      → approved (full tuition)
    //  • Employed with income under ₦100k / $100           → approved (full tuition)
    //  • Everyone else                                     → rejected
    //
    // An 'approved' outcome means the student pays only the flat platform
    // registration fee (set by the admin, see RegistrationFeeSetting) instead
    // of the course price — see PricingService, the single source of truth
    // for what anyone actually gets charged. discount_percentage is legacy
    // and no longer shown to users or read anywhere for pricing.

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
            'eligible'    => true,
            'course_name' => $course->title,
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

        // ── Auto-decision (binary full-tuition model) ────────────────────────
        [$status, $reviewNote] = $this->autoDecide(
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
            'discount_percentage' => 0, // legacy column — full-tuition model no longer uses percentages
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

        Log::info('🎓 Scholarship auto-processed (full-tuition model)', [
            'user_id'     => $user->id,
            'course_id'   => $courseId,
            'is_student'  => $isStudent,
            'is_employed' => $isEmployed,
            'salary'      => $salaryRange,
            'is_nigeria'  => $isNigeria,
            'status'      => $status,
        ]);

        $this->sendResultEmail($user, $scholarship, $course);

        return response()->json([
            'message'     => $status === 'approved'
                ? "Congratulations! You've been awarded a full-tuition scholarship. You'll only pay the registration fee to secure your spot."
                : 'Thank you for applying. Unfortunately your application was not successful this time — you can still enroll and pay the standard course price.',
            'scholarship' => $scholarship,
        ], 201);
    }

    /**
     * Send the "Proceed to Payment" result email — fired for BOTH approved
     * and rejected outcomes (Task: user gets a CTA either way). Also makes
     * sure a real enrollment row exists so the email's button can deep-link
     * straight to /user/payment/{enrollmentId} instead of a generic course
     * page. Reuses CourseEnrollmentController::enroll() — the single source
     * of truth for enrollment creation/pricing — rather than duplicating it.
     */
    private function sendResultEmail(\App\Models\User $user, Scholarship $scholarship, Course $course): void
    {
        $isApproved = $scholarship->status === 'approved';
        $currency   = LocationService::detectCurrency();
        $paymentUrl = rtrim(config('app.frontend_url'), '/') . '/courses/' . $course->course_id;
        $amountDue  = null;

        try {
            $controller  = new \App\Http\Controllers\Api\User\CourseEnrollmentController();
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
     * Rule-based scholarship decision — binary full-tuition model.
     *
     * There are no more 25%/50%/75% tiers. Every approval is the same
     * outcome: full tuition, pay only the flat registration fee. Rules in
     * priority order:
     *  1. Student (any employment status)                 → approved (full tuition)
     *  2. Not a student but unemployed                     → approved (full tuition)
     *  3. Employed + income < ₦100k/$100 (under_100)      → approved (full tuition)
     *  4. Employed + income ₦100k–₦200k / $100–$200       → rejected (can afford partial)
     *  5. Employed + income > ₦200k / $200                → rejected
     *  6. Everything else                                  → rejected
     *
     * @return array{0: string, 1: string}  [status, review_note]
     */
    private function autoDecide(bool $isStudent, bool $isEmployed, string $salaryRange, bool $isNigeria): array
    {
        // Student (employed or unemployed)
        if ($isStudent) {
            return ['approved', 'Full-tuition scholarship awarded — student applicant.'];
        }

        // Not a student but unemployed
        if (! $isStudent && ! $isEmployed) {
            return ['approved', 'Full-tuition scholarship awarded — unemployed applicant.'];
        }

        // Employed with income under ₦100k / $100
        if ($isEmployed && $salaryRange === 'under_100') {
            return ['approved', 'Full-tuition scholarship awarded — low-income employed applicant.'];
        }

        // Everyone else is rejected
        return [
            'rejected',
            'Application not approved — your current employment and income level does not meet the scholarship criteria.',
        ];
    }
}