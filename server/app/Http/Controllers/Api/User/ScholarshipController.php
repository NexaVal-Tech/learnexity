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

        // CHANGE 5: one scholarship per user across ALL courses.
        // A revoked scholarship doesn't count — an admin revoking it is
        // meant to free the student up to reapply, so it's excluded here.
        $anyExisting = Scholarship::where('user_id', $user->id)
            ->where('status', '!=', 'revoked')
            ->first();

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

        // CHANGE 5: one scholarship per user ever (revoked ones excluded —
        // see checkEligibility for the same rule).
        $anyExisting = Scholarship::where('user_id', $user->id)
            ->where('status', '!=', 'revoked')
            ->first();
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
            // Every applicant is auto-approved (two-tier model, no reject
            // outcome) — this is the moment the 30-day countdown starts.
            'approved_at'         => $status === 'approved' ? now() : null,
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
            'message'     => \App\Services\ScholarshipAwardService::awardMessage($course),
            'scholarship' => $scholarship,
        ], 201);
    }

    /**
     * Prepare the pending (registration-fee) enrollment and send the award
     * email — see ScholarshipAwardService.
     */
    private function sendResultEmail(\App\Models\User $user, Scholarship $scholarship, Course $course): void
    {
        \App\Services\ScholarshipAwardService::prepareAndNotify($user, $scholarship, $course);
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
        // Single-award model: every applicant is awarded a scholarship and
        // pays only the registration fee. The answers are still recorded
        // (for the admin), they just no longer change the outcome.
        return ['approved', 100.0, 'Scholarship awarded — pays the registration fee only.'];
    }
}