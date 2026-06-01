<?php
// FILE: app/Jobs/SendPendingPaymentNudgeJob.php

namespace App\Jobs;

use App\Models\User;
use App\Models\CourseEnrollment;
use App\Models\EmailSequenceLog;
use App\Mail\PendingPaymentNudgeMail;
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
 * Finds every enrollment that is:
 *  - payment_status = 'pending'
 *  - created at least 1 day ago (so the user has had a chance to pay)
 *  - not older than 14 days (after that we stop nudging — they're gone)
 *
 * Sends one email per day per enrollment, cycling through copy variants
 * for days 1, 2, 3 and repeating variant 3 thereafter.
 */
class SendPendingPaymentNudgeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        Log::info('💳 [PendingNudge] Starting pending payment nudge dispatch');

        $enrollments = CourseEnrollment::where('payment_status', 'pending')
            ->where('enrollment_date', '<=', now()->subDay())       // at least 1 day old
            ->where('enrollment_date', '>=', now()->subDays(14))    // stop after 14 days
            ->get();

        $sent    = 0;
        $skipped = 0;

        foreach ($enrollments as $enrollment) {
            $userId = $enrollment->user_id;
            $emailKey = "pending_payment_nudge_{$enrollment->id}";

            // One nudge per enrollment per day
            if (EmailSequenceLog::sentTodayFor($userId, $emailKey)) {
                $skipped++;
                continue;
            }

            $user = User::find($userId);
            if (!$user) continue;

            // How many nudge emails have we sent for this enrollment so far?
            $nudgesSent = EmailSequenceLog::countSent($userId, $emailKey);
            $nudgeDay   = $nudgesSent + 1;   // 1-based day counter

            $paymentUrl = rtrim(env('FRONTEND_URL', 'https://learnexity.org'), '/')
                . '/user/courses/payment/' . $enrollment->id;

            try {
                Mail::to($user->email)->queue(
                    new PendingPaymentNudgeMail($user, $enrollment, $nudgeDay, $paymentUrl)
                );

                EmailSequenceLog::record($userId, $emailKey, $enrollment->course_id, [
                    'enrollment_id' => $enrollment->id,
                    'nudge_day'     => $nudgeDay,
                ]);

                $sent++;

                Log::info('✅ [PendingNudge] Email queued', [
                    'user_id'       => $userId,
                    'enrollment_id' => $enrollment->id,
                    'nudge_day'     => $nudgeDay,
                ]);
            } catch (\Exception $e) {
                Log::error('❌ [PendingNudge] Failed', [
                    'user_id'       => $userId,
                    'enrollment_id' => $enrollment->id,
                    'error'         => $e->getMessage(),
                ]);
            }
        }

        Log::info("✅ [PendingNudge] Done. Sent: {$sent}, Skipped: {$skipped}");
    }
}