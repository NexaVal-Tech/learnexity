<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Scholarship;
use App\Services\LocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ScholarshipController extends Controller
{
    // ─── Scholarship rules (CHANGE 5) ────────────────────────────────────────
    //
    // Eligibility: ONE scholarship per user ever (across all courses).
    //
    // Outcome rules:
    //  • Student + Unemployed + Nigeria                  → 75%
    //  • Student + any location (incl. above)            → 50%
    //  • Employed + income < ₦100k / $100               → 50%
    //  • Employed + income ₦100k–₦200k / $100–$200      → 25%  (borderline)
    //  • Employed + income > ₦200k / $200               → rejected
    //  • Not student + unemployed                        → 50%  (needs support)
    //  • Everything else                                 → rejected

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

        // ── Auto-decision (CHANGE 5 rules) ───────────────────────────────────
        [$status, $discountPct, $reviewNote] = $this->autoDecide(
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
            'discount_percentage' => $discountPct,
            'answers'             => $answers,
            'review_notes'        => $reviewNote,
            'applicant_country'   => $country,
            'applicant_ip'        => $request->ip(),
        ]);

        Log::info('🎓 Scholarship auto-processed (new rules)', [
            'user_id'     => $user->id,
            'course_id'   => $courseId,
            'is_student'  => $isStudent,
            'is_employed' => $isEmployed,
            'salary'      => $salaryRange,
            'is_nigeria'  => $isNigeria,
            'status'      => $status,
            'discount'    => $discountPct,
        ]);

        return response()->json([
            'message'     => $status === 'approved'
                ? "Congratulations! You've been awarded a {$discountPct}% scholarship."
                : 'Thank you for applying. Unfortunately your application was not successful this time.',
            'scholarship' => $scholarship,
        ], 201);
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
     * Rule-based scholarship decision (CHANGE 5).
     *
     * Rules in priority order:
     *  1. Student + Unemployed + Nigeria                  → 75%
     *  2. Student (any location / employment status)      → 50%
     *  3. Not student + unemployed                        → 50%
     *  4. Employed + income < ₦100k/$100 (under_100)     → 50%
     *  5. Employed + income ₦100k–₦200k / $100–$200      → rejected (can afford partial — no scholarship)
     *  6. Employed + income > ₦200k / $200               → rejected
     *  7. Everything else                                 → rejected
     *
     * @return array{0: string, 1: int, 2: string}  [status, discount_pct, review_note]
     */
    private function autoDecide(
        bool   $isStudent,
        bool   $isEmployed,
        string $salaryRange,
        bool   $isNigeria
    ): array {
        // Rule 1: Student + Unemployed + Nigeria → 75%
        if ($isStudent && ! $isEmployed && $isNigeria) {
            return [
                'approved',
                75,
                '75% scholarship awarded — student, unemployed, and based in Nigeria.',
            ];
        }

        // Rule 2: Student (any other combination) → 50%
        if ($isStudent) {
            return [
                'approved',
                50,
                '50% scholarship awarded based on student status.',
            ];
        }

        // Rule 3: Not a student + unemployed → 50%
        if (! $isStudent && ! $isEmployed) {
            return [
                'approved',
                50,
                '50% scholarship awarded — unemployed and seeking to upskill.',
            ];
        }

        // Rule 4: Employed but income under ₦100k / $100 → 50%
        if ($isEmployed && $salaryRange === 'under_100') {
            return [
                'approved',
                50,
                '50% scholarship awarded — employed but income below the ₦100,000 / $100 threshold.',
            ];
        }

        // Rules 5 & 6: Employed with higher income → rejected
        // (₦100k–₦200k and above ₦200k both do not qualify)
        return [
            'rejected',
            0,
            'Application not approved — your current employment and income level does not meet the scholarship criteria.',
        ];
    }
}