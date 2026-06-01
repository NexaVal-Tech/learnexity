<?php
// FILE: app/Jobs/SendInactiveUserEmailsJob.php

namespace App\Jobs;

use App\Models\User;
use App\Models\CourseEnrollment;
use App\Models\CourseMaterial;
use App\Models\SprintProgress;
use App\Models\UserPerformanceScore;
use App\Models\EmailSequenceLog;
use App\Mail\InactiveUserMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

/**
 * Runs daily (via scheduler).
 *
 * Targets enrolled (paid) users who have not logged in for 2+ days.
 * Uses the last_login_at on UserPerformanceScore as the activity marker.
 *
 * Cooldown: don't send the same type to the same user more than once every
 * 2 days — so they won't get this AND the daily check-in on the same day
 * when they return.
 *
 * Send thresholds:  2 days  → gentle nudge
 *                   7 days  → stronger nudge
 *                  14 days  → final "are you okay?" message
 * (after 14 days we stop — no point spamming truly gone users)
 */
class SendInactiveUserEmailsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // Only fire at these exact day-thresholds (checked daily)
    private const TRIGGER_DAYS = [2, 7, 14];

    public function handle(): void
    {
        Log::info('😴 [InactiveUser] Starting inactive user email dispatch');

        $sent    = 0;
        $skipped = 0;

        // Get all users with at least one paid enrollment
        $userIds = CourseEnrollment::where('payment_status', 'completed')
            ->distinct()
            ->pluck('user_id');

        foreach ($userIds as $userId) {
            $score = UserPerformanceScore::where('user_id', $userId)->first();

            // No login record at all → treat last login as account creation date
            $lastLogin = $score?->last_login_at
                ?? User::find($userId)?->created_at;

            if (!$lastLogin) continue;

            $daysInactive = (int) now()->diffInDays($lastLogin);

            // Only fire at the defined thresholds
            if (!in_array($daysInactive, self::TRIGGER_DAYS, true)) {
                continue;
            }

            $emailKey = "inactive_user_{$daysInactive}d";

            // Don't resend the same threshold email
            if (EmailSequenceLog::sentWithinDays($userId, $emailKey, 2)) {
                $skipped++;
                continue;
            }

            $user = User::find($userId);
            if (!$user) continue;

            // Build course progress data
            $enrollments = CourseEnrollment::where('user_id', $userId)
                ->where('payment_status', 'completed')
                ->get();

            $courseProgress = [];
            foreach ($enrollments as $enrollment) {
                $totalSprints     = CourseMaterial::where('course_id', $enrollment->course_id)->count();
                $completedSprints = SprintProgress::where('user_id', $userId)
                    ->where('course_id', $enrollment->course_id)
                    ->where('progress_percentage', 100)
                    ->count();

                $progress = $totalSprints > 0 ? round(($completedSprints / $totalSprints) * 100) : 0;

                $nextSprint = CourseMaterial::where('course_id', $enrollment->course_id)
                    ->orderBy('sprint_number')
                    ->get()
                    ->first(fn($s) => SprintProgress::where('user_id', $userId)
                        ->where('course_material_id', $s->id)
                        ->where('progress_percentage', 100)
                        ->doesntExist()
                    );

                $courseProgress[] = [
                    'name'        => $enrollment->course_name ?? "Course #{$enrollment->course_id}",
                    'progress'    => $progress,
                    'next_sprint' => $nextSprint?->sprint_name,
                ];
            }

            try {
                Mail::to($user->email)->queue(
                    new InactiveUserMail($user, $daysInactive, $courseProgress)
                );

                EmailSequenceLog::record($userId, $emailKey, null, [
                    'days_inactive' => $daysInactive,
                    'courses'       => count($courseProgress),
                ]);

                $sent++;

                Log::info('✅ [InactiveUser] Email queued', [
                    'user_id'       => $userId,
                    'days_inactive' => $daysInactive,
                ]);
            } catch (\Exception $e) {
                Log::error('❌ [InactiveUser] Failed', [
                    'user_id' => $userId,
                    'error'   => $e->getMessage(),
                ]);
            }
        }

        Log::info("✅ [InactiveUser] Done. Sent: {$sent}, Skipped: {$skipped}");
    }
}