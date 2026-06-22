<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserPerformanceScore;
use App\Models\EmailSequenceLog;
use App\Models\CourseEnrollment;
use App\Models\SprintProgress;
use App\Mail\PerformanceMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

/**
 * Rule-based performance tracker.
 *
 * Scores 4 dimensions (0–100 each) for a user in a course:
 *  - Speed        : how fast they progress through sprints vs expected pace
 *  - Quality      : leaderboard position + overall progress
 *  - Reliability  : login streak + consistency
 *  - ProblemSolving: submission approval rate + project completion
 *
 * After scoring, fires performance emails based on rules.
 */
class UserPerformanceTracker
{
    /**
     * Called every time a sprint is completed.
     * Updates scores and potentially sends a performance email.
     */
    public function onSprintCompleted(int $userId, string $courseId, int $sprintNumber): void
    {
        $score = $this->updateScores($userId, $courseId);
        $this->evaluateAndNotify($userId, $courseId, $score);
    }

    /**
     * Called every time a user logs in.
     * Updates reliability / streak score.
     */
    public function onLogin(int $userId): void
    {
        $enrollments = CourseEnrollment::where('user_id', $userId)
            ->where('payment_status', 'completed')
            ->pluck('course_id');

        foreach ($enrollments as $courseId) {
            $score = UserPerformanceScore::firstOrCreate(
                ['user_id' => $userId, 'course_id' => $courseId],
                $this->defaultScores()
            );

            // Update login streak
            $lastLogin = $score->last_login_at;
            $streakDays = $score->login_streak_days ?? 0;

            if ($lastLogin) {
                $diffDays = now()->diffInDays($lastLogin);
                if ($diffDays === 0) {
                    // Already logged in today, no change
                } elseif ($diffDays === 1) {
                    $streakDays++;
                } else {
                    // Streak broken
                    $streakDays = 1;
                }
            } else {
                $streakDays = 1;
            }

            $score->update([
                'login_streak_days' => $streakDays,
                'total_logins'      => $score->total_logins + 1,
                'last_login_at'     => now(),
                'reliability_score' => $this->computeReliabilityScore($streakDays, $score->total_logins + 1),
            ]);

            // Fire streak milestone emails
            $this->checkStreakMilestone($userId, $courseId, $streakDays, $score);
        }
    }

    /**
     * Run a full score update for a user in a course.
     * Returns the updated score model.
     */
    public function updateScores(int $userId, string $courseId): UserPerformanceScore
    {
        $score = UserPerformanceScore::firstOrCreate(
            ['user_id' => $userId, 'course_id' => $courseId],
            $this->defaultScores()
        );

        // ── Count sprints ──────────────────────────────────────────────────────
        $totalSprints = DB::table('course_materials')
            ->where('course_id', $courseId)
            ->count();

        $completedSprints = SprintProgress::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->where('progress_percentage', 100)
            ->count();

        // ── Enrollment age (days since enrollment) ─────────────────────────────
        $enrollment = CourseEnrollment::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->first();

        $enrollmentDays = $enrollment
            ? now()->diffInDays($enrollment->enrollment_date)
            : 1;

        // ── Speed score ────────────────────────────────────────────────────────
        // Expected: finish 1 sprint per 2 weeks (14 days each)
        $expectedSprints = max(1, floor($enrollmentDays / 14));
        $speedRatio      = $totalSprints > 0 ? ($completedSprints / min($expectedSprints, $totalSprints)) : 0;
        $speedScore      = min(100, round($speedRatio * 100));

        // ── Quality score ──────────────────────────────────────────────────────
        // Use leaderboard overall_score if available, else fall back to progress %
        $leaderboardScore = DB::table('cohort_participants')
            ->join('cohort_leaderboards', 'cohort_participants.cohort_leaderboard_id', '=', 'cohort_leaderboards.id')
            ->where('cohort_leaderboards.course_id', $courseId)
            ->where('cohort_participants.user_id', $userId)
            ->value('overall_score');

        $progressPercent = $totalSprints > 0
            ? round(($completedSprints / $totalSprints) * 100)
            : 0;

        $qualityScore = $leaderboardScore !== null
            ? (int) $leaderboardScore
            : $progressPercent;

        // ── Reliability score ─────────────────────────────────────────────────
        $reliabilityScore = $this->computeReliabilityScore(
            $score->login_streak_days ?? 0,
            $score->total_logins ?? 1
        );

        // ── Problem-solving score ─────────────────────────────────────────────
        // Based on submission approval rate
        $totalSubmissions    = DB::table('project_submissions')->where('user_id', $userId)->count();
        $approvedSubmissions = DB::table('project_submissions')
            ->where('user_id', $userId)
            ->where('status', 'approved')
            ->count();

        $problemSolvingScore = $totalSubmissions > 0
            ? round(($approvedSubmissions / $totalSubmissions) * 100)
            : 50;   // neutral default if no submissions yet

        // ── Overall score ─────────────────────────────────────────────────────
        $overallScore = round(
            ($speedScore * 0.25) +
            ($qualityScore * 0.30) +
            ($reliabilityScore * 0.25) +
            ($problemSolvingScore * 0.20)
        );

        $score->update([
            'speed_score'           => $speedScore,
            'quality_score'         => $qualityScore,
            'reliability_score'     => $reliabilityScore,
            'problem_solving_score' => $problemSolvingScore,
            'overall_score'         => $overallScore,
            'sprints_completed'     => $completedSprints,
            'total_sprints'         => $totalSprints,
            'last_sprint_completed_at' => now(),
        ]);

        return $score->fresh();
    }

    /**
     * Apply performance rules and send emails where triggered.
     */
    public function evaluateAndNotify(int $userId, string $courseId, UserPerformanceScore $score): void
    {
        $user = User::find($userId);
        if (!$user) return;

        $courseName = DB::table('courses')->where('course_id', $courseId)->value('title') ?? $courseId;

        $scores = [
            'speed'           => $score->speed_score,
            'quality'         => $score->quality_score,
            'reliability'     => $score->reliability_score,
            'problem_solving' => $score->problem_solving_score,
        ];

        // ── Rule 1: High performer (overall > 80, not emailed in last 7 days) ──
        if ($score->overall_score >= 80 && !EmailSequenceLog::sentWithinHours($userId, 'high_performer', 168, $courseId)) {
            $this->sendPerformanceEmail($user, 'high_performer', $courseName, $scores,
                "You're in the top tier of your cohort! Your overall performance score is {$score->overall_score}%. Keep this pace up.",
                $userId, $courseId
            );
        }

        // ── Rule 2: Slow progress (speed < 30, not emailed in last 3 days) ─────
        elseif ($score->speed_score < 30 && !EmailSequenceLog::sentWithinHours($userId, 'slow_progress', 72, $courseId)) {
            $this->sendPerformanceEmail($user, 'slow_progress', $courseName, $scores,
                "We've noticed you haven't progressed through the sprints as quickly as expected. Life gets busy — we get it! But even 30 minutes a day makes a real difference. We're rooting for you.",
                $userId, $courseId
            );
        }

        // ── Rule 3: Near completion (> 80% through sprints, not yet notified) ──
        elseif ($score->total_sprints > 0 && ($score->sprints_completed / $score->total_sprints) >= 0.8
            && !EmailSequenceLog::sentWithinHours($userId, 'completion_near', 168, $courseId)) {
            $this->sendPerformanceEmail($user, 'completion_near', $courseName, $scores,
                "You're over 80% through {$courseName}! You're so close to the finish line. Push through and claim your certificate.",
                $userId, $courseId
            );
        }

        // ── Rule 4: Quality drop (quality drops below 40) ─────────────────────
        elseif ($score->quality_score < 40 && !EmailSequenceLog::sentWithinHours($userId, 'quality_drop', 72, $courseId)) {
            $this->sendPerformanceEmail($user, 'quality_drop', $courseName, $scores,
                "Your quality score has dipped — that's okay, it happens! Focus on completing each topic thoroughly before moving on. Quality compounds over time.",
                $userId, $courseId
            );
        }
    }

    /**
     * Check if a streak milestone was hit and send email.
     */
    private function checkStreakMilestone(int $userId, string $courseId, int $streakDays, UserPerformanceScore $score): void
    {
        $milestones = [7, 14, 30, 60, 100];

        if (!in_array($streakDays, $milestones)) return;
        if (EmailSequenceLog::sentWithinHours($userId, 'streak_milestone', 1, $courseId)) return;

        $user       = User::find($userId);
        $courseName = DB::table('courses')->where('course_id', $courseId)->value('title') ?? $courseId;

        $scores = [
            'speed'           => $score->speed_score,
            'quality'         => $score->quality_score,
            'reliability'     => $score->reliability_score,
            'problem_solving' => $score->problem_solving_score,
            'streak'          => $streakDays,
        ];

        $this->sendPerformanceEmail($user, 'streak_milestone', $courseName, $scores,
            "You've logged in for {$streakDays} days straight — that's serious dedication! Consistency like this is what separates successful learners from the rest.",
            $userId, $courseId
        );
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function sendPerformanceEmail(
        User $user,
        string $emailType,
        string $courseName,
        array $scores,
        string $message,
        int $userId,
        string $courseId
    ): void {
        try {
            Mail::to($user->email)->queue(
                new PerformanceMail($user, $emailType, $courseName, $scores, $message)
            );

            EmailSequenceLog::record($userId, $emailType, $courseId, [
                'scores'  => $scores,
                'message' => $message,
            ]);

            Log::info("📧 Performance email queued: {$emailType}", [
                'user_id'   => $userId,
                'course_id' => $courseId,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to queue performance email: {$emailType}", ['error' => $e->getMessage()]);
        }
    }

    private function computeReliabilityScore(int $streakDays, int $totalLogins): int
    {
        // Streak contributes 60%, total logins 40%
        $streakScore = min(100, $streakDays * 5);       // 20 days = 100%
        $loginScore  = min(100, $totalLogins * 2);       // 50 logins = 100%
        return round(($streakScore * 0.6) + ($loginScore * 0.4));
    }

    private function defaultScores(): array
    {
        return [
            'speed_score'           => 0,
            'quality_score'         => 50,
            'reliability_score'     => 0,
            'problem_solving_score' => 50,
            'overall_score'         => 0,
            'sprints_completed'     => 0,
            'total_sprints'         => 0,
            'login_streak_days'     => 0,
            'total_logins'          => 0,
        ];
    }
}