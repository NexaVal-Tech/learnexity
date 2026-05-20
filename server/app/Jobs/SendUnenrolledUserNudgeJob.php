<?php
// FILE: app/Jobs/SendUnenrolledUserNudgeJob.php

namespace App\Jobs;

use App\Models\User;
use App\Models\CourseEnrollment;
use App\Models\EmailSequenceLog;
use App\Mail\UnenrolledUserNudgeMail;
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
 * Targets users who:
 *  - Have a verified email
 *  - Have NEVER enrolled in any course (no CourseEnrollment row at all)
 *  - Registered more than 1 day ago (give them breathing room after the welcome email)
 *  - Registered fewer than 10 days ago (stop nudging after that)
 *
 * Sends 3 nudges max (days 1, 3, 7 after registration).
 * After 3 nudges we stop entirely — the user has clearly decided not to enroll yet.
 */
class SendUnenrolledUserNudgeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // Send nudges on these days after registration
    private const NUDGE_DAYS = [1, 3, 7];

    public function handle(): void
    {
        Log::info('🎓 [UnenrolledNudge] Starting unenrolled user nudge dispatch');

        $sent    = 0;
        $skipped = 0;

        // IDs of users who have at least one enrollment (any status)
        $enrolledUserIds = CourseEnrollment::distinct()->pluck('user_id')->toArray();

        // Users who have no enrollment, verified email, registered 1–10 days ago
        $users = User::whereNotIn('id', $enrolledUserIds)
            ->whereNotNull('email_verified_at')
            ->where('created_at', '<=', now()->subDay())
            ->where('created_at', '>=', now()->subDays(10))
            ->get();

        foreach ($users as $user) {
            $daysSinceRegistration = (int) now()->diffInDays($user->created_at);

            // Find which nudge day this is closest to
            $targetDay = null;
            foreach (self::NUDGE_DAYS as $nd) {
                if ($daysSinceRegistration >= $nd) {
                    $targetDay = $nd;
                }
            }

            if (!$targetDay) {
                continue;
            }

            $emailKey = "unenrolled_nudge_day{$targetDay}";

            // Don't re-send the same day-nudge
            if (EmailSequenceLog::sentWithinDays($user->id, $emailKey, 2)) {
                $skipped++;
                continue;
            }

            // How many unenrolled nudges have been sent total to this user?
            $totalNudgesSent = 0;
            foreach (self::NUDGE_DAYS as $nd) {
                if (EmailSequenceLog::countSent($user->id, "unenrolled_nudge_day{$nd}") > 0) {
                    $totalNudgesSent++;
                }
            }

            // Map to copy variant (1 → day1 copy, 2 → day2 copy, 3 → day3 copy)
            $nudgeDay = $totalNudgesSent + 1;
            if ($nudgeDay > 3) {
                $skipped++;
                continue;   // Already sent all 3 variants
            }

            $coursesUrl = rtrim(env('FRONTEND_URL', 'https://learnexity.org'), '/') . '/courses/courses';

            try {
                Mail::to($user->email)->queue(
                    new UnenrolledUserNudgeMail($user, $nudgeDay, $coursesUrl)
                );

                EmailSequenceLog::record($user->id, $emailKey, null, [
                    'nudge_day'              => $nudgeDay,
                    'days_since_registration'=> $daysSinceRegistration,
                ]);

                $sent++;

                Log::info('✅ [UnenrolledNudge] Email queued', [
                    'user_id'   => $user->id,
                    'nudge_day' => $nudgeDay,
                    'days_reg'  => $daysSinceRegistration,
                ]);
            } catch (\Exception $e) {
                Log::error('❌ [UnenrolledNudge] Failed', [
                    'user_id' => $user->id,
                    'error'   => $e->getMessage(),
                ]);
            }
        }

        Log::info("✅ [UnenrolledNudge] Done. Sent: {$sent}, Skipped: {$skipped}");
    }
}