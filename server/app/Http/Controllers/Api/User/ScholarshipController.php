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
    // ─── Scoring weights (must sum to 85; Nigeria bonus adds up to 15) ──────
    // Q1 experience_level        → max 10
    // Q2 learning_attempts       → max 15
    // Q3 weekly_hours            → max 15
    // Q4 completion_obstacle     → max 10
    // Q5 financial_context       → max 20
    // Q6 outcome_plan            → max 15
    //                              ────
    //                              85  + up to 15 location bonus = 100

    /**
     * Check application eligibility for a course before showing the form.
     * Returns: { eligible, reason, existing_application }
     */
    public function checkEligibility(Request $request, string $courseId): JsonResponse
    {
        $user = auth()->user();

        $existing = Scholarship::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->first();

        if ($existing) {
            return response()->json([
                'eligible'             => false,
                'reason'               => 'already_applied',
                'existing_application' => $existing,
            ]);
        }

        // Check if user already has ANY approved scholarship (one ever, across all courses)
        $hasUsed = Scholarship::where('user_id', $user->id)
            ->where('is_used', true)
            ->exists();

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
     * Submit a scholarship application.
     * Auto-scores and auto-decides immediately.
     */
    public function apply(Request $request, string $courseId): JsonResponse
    {
        $user = auth()->user();

        // ── Guard: one application per user per course ──────────────────────
        $existing = Scholarship::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->first();

        if ($existing) {
            return response()->json([
                'message'     => 'You have already applied for a scholarship on this course.',
                'scholarship' => $existing,
            ], 409);
        }

        // ── Guard: already used a scholarship ───────────────────────────────
        $hasUsed = Scholarship::where('user_id', $user->id)->where('is_used', true)->exists();
        if ($hasUsed) {
            return response()->json([
                'message' => 'You have already used your scholarship on another course.',
            ], 409);
        }

        // ── Validate answers ─────────────────────────────────────────────────
        $validator = Validator::make($request->all(), [
            'experience_level'    => 'required|in:complete_beginner,some_exposure,intermediate,advanced',
            'learning_attempts'   => 'required|string|min:30|max:1000',
            'weekly_hours'        => 'required|in:1_3,4_6,7_10,10_plus',
            'completion_obstacle' => 'required|string|min:20|max:800',
            'financial_context'   => 'required|string|min:30|max:1000',
            'outcome_plan'        => 'required|string|min:30|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Please complete all fields.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $course = Course::where('course_id', $courseId)->firstOrFail();

        // ── Detect location ──────────────────────────────────────────────────
        $locationData   = LocationService::detectCurrencyFull($request->ip());
        $country        = $locationData['country'] ?? 'Unknown';
        $isNigeria      = in_array(strtoupper($country), ['NG', 'NIGERIA', 'NGA'], true);
        $locationBonus  = $isNigeria ? 15 : 0;

        // ── Score each answer ─────────────────────────────────────────────────
        $answers = $request->only([
            'experience_level',
            'learning_attempts',
            'weekly_hours',
            'completion_obstacle',
            'financial_context',
            'outcome_plan',
        ]);

        $score = 0;

        // Q1 — Experience level (10 pts max)
        // Beginners and those with some exposure are most in need of support
        $score += match($answers['experience_level']) {
            'complete_beginner' => 10,
            'some_exposure'     => 8,
            'intermediate'      => 5,
            'advanced'          => 2,
            default             => 0,
        };

        // Q2 — Learning attempts (15 pts max)
        // Length & specificity of answer is a proxy for seriousness
        $score += $this->scoreTextAnswer($answers['learning_attempts'], 15);

        // Q3 — Weekly hours commitment (15 pts max)
        $score += match($answers['weekly_hours']) {
            '10_plus' => 15,
            '7_10'    => 12,
            '4_6'     => 8,
            '1_3'     => 3,
            default   => 0,
        };

        // Q4 — Completion obstacle awareness (10 pts max)
        // Self-awareness = commitment likelihood
        $score += $this->scoreTextAnswer($answers['completion_obstacle'], 10);

        // Q5 — Financial context (20 pts max — highest weight)
        $score += $this->scoreTextAnswer($answers['financial_context'], 20);

        // Q6 — Outcome plan specificity (15 pts max)
        $score += $this->scoreTextAnswer($answers['outcome_plan'], 15);

        $totalScore = min(100, $score + $locationBonus);

        // ── Auto-decision ─────────────────────────────────────────────────────
        [$status, $discountPct, $reviewNote] = $this->autoDecide($totalScore, $isNigeria);

        $scholarship = Scholarship::create([
            'user_id'            => $user->id,
            'course_id'          => $courseId,
            'course_name'        => $course->title,
            'status'             => $status,
            'score'              => $score,
            'location_bonus'     => $locationBonus,
            'total_score'        => $totalScore,
            'discount_percentage'=> $discountPct,
            'answers'            => $answers,
            'review_notes'       => $reviewNote,
            'applicant_country'  => $country,
            'applicant_ip'       => $request->ip(),
        ]);

        Log::info('🎓 Scholarship auto-processed', [
            'user_id'      => $user->id,
            'course_id'    => $courseId,
            'score'        => $score,
            'location_bonus'=> $locationBonus,
            'total_score'  => $totalScore,
            'status'       => $status,
            'discount'     => $discountPct,
            'is_nigeria'   => $isNigeria,
        ]);

        return response()->json([
            'message'     => $status === 'approved'
                ? "Congratulations! You've been awarded a {$discountPct}% scholarship."
                : 'Thank you for applying. Unfortunately your application was not successful this time.',
            'scholarship' => $scholarship,
        ], 201);
    }

    /**
     * Get scholarship status for a specific course (for payment page).
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
     * Score a free-text answer by length and basic quality heuristics.
     * Rewards genuine, specific writing over one-liners.
     */
    private function scoreTextAnswer(string $text, int $max): int
    {
        $wordCount = str_word_count(strip_tags($text));

        // Tiers:  <15 words → minimal | 15–40 → fair | 41–80 → good | 81+ → excellent
        $lengthScore = match(true) {
            $wordCount >= 81 => $max,
            $wordCount >= 41 => (int) round($max * 0.75),
            $wordCount >= 15 => (int) round($max * 0.45),
            default          => (int) round($max * 0.15),
        };

        return $lengthScore;
    }

    /**
     * Map a total score to a decision.
     *
     * Score tiers (after location bonus):
     *  75–100 → approved  100%
     *  55–74  → approved   50%
     *  35–54  → approved   25%
     *   0–34  → rejected
     *
     * Nigerian applicants start with +15, so the effective floor is lower —
     * deliberately, as cost-of-living context is factored in.
     */
    private function autoDecide(int $totalScore, bool $isNigeria): array
    {
        if ($totalScore >= 75) {
            return ['approved', 100, 'Excellent application. Full scholarship awarded.'];
        }

        if ($totalScore >= 55) {
            return ['approved', 50, '50% scholarship awarded based on strong application.'];
        }

        if ($totalScore >= 35) {
            $note = $isNigeria
                ? '25% scholarship awarded. Location support factor applied.'
                : '25% scholarship awarded based on application merit.';
            return ['approved', 25, $note];
        }

        return ['rejected', 0, 'Application did not meet minimum scholarship criteria.'];
    }
}