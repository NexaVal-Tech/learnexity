<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Jobs\SendDailyCheckinEmailsJob;
use App\Jobs\SendInactiveUserEmailsJob;
use App\Jobs\SendUnenrolledUserNudgeJob;

/**
 * DEAD CODE — like app/Http/Kernel.php, this file is never loaded. Laravel
 * 12's bootstrap/app.php uses Application::configure()->withRouting(commands:
 * routes/console.php) and never binds Illuminate\Contracts\Console\Kernel to
 * this class, so schedule() below never actually runs — routes/console.php
 * is the real, live schedule. Kept in sync here only so this file doesn't
 * mislead anyone who finds it later; do not rely on it.
 */
class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * All times are server time — set APP_TIMEZONE=Africa/Lagos in .env
     * so they fire at the correct local time on both dev and VPS.
     */
    protected function schedule(Schedule $schedule): void
    {
        // ── Existing: payment reminders command ───────────────────────────────
        $schedule->command('payments:send-reminders')
                 ->dailyAt('09:00')
                 ->withoutOverlapping()
                 ->appendOutputTo(storage_path('logs/payment-reminders.log'));

        // ── Existing: overdue payment check ───────────────────────────────────
        $schedule->command('payments:check-overdue')
                 ->dailyAt('02:00')
                 ->withoutOverlapping()
                 ->appendOutputTo(storage_path('logs/overdue-checks.log'));

        // ── Scholarship cosmetic 30-day countdown reminders ───────────────────
        // Fires at 08:30, ahead of the other email-sequence jobs below, so
        // recipients aren't emailed twice in the same minute window.
        $schedule->command('scholarships:send-countdown-reminders')
                 ->dailyAt('08:30')
                 ->withoutOverlapping()
                 ->appendOutputTo(storage_path('logs/scholarship-countdown-reminders.log'));

        // ── Existing: installment access status update every 6 hours ─────────
        $schedule->call(function () {
            \Illuminate\Support\Facades\Log::info('Running scheduled access status update');

            $enrollments = \App\Models\CourseEnrollment::where('payment_type', 'installment')
                ->where('payment_status', '!=', 'completed')
                ->get();

            foreach ($enrollments as $enrollment) {
                $enrollment->updateAccessStatus();
            }

            \Illuminate\Support\Facades\Log::info("Updated access status for {$enrollments->count()} enrollments");
        })
        ->name('update-access-status')
        ->everySixHours()
        ->withoutOverlapping();

        // ── Email sequence: daily check-in (paid enrolled users) ─────────────
        // Every 2 days per admin request (was daily).
        $schedule->job(new SendDailyCheckinEmailsJob)
                 ->cron('0 8 */2 * *')
                 ->withoutOverlapping()
                 ->onFailure(function () {
                     \Illuminate\Support\Facades\Log::error('❌ SendDailyCheckinEmailsJob failed');
                 });

        // ── Email sequence: pending payment nudge ─────────────────────────────
        // Cancelled per admin request — this was the "payment notification".
        // No longer scheduled (see App\Jobs\SendPendingPaymentNudgeJob).

        // ── Email sequence: inactive user re-engagement ───────────────────────
        // Every 2 days per admin request (was daily). The job filters
        // internally to days 2, 7, 14 only.
        $schedule->job(new SendInactiveUserEmailsJob)
                 ->cron('15 8 */2 * *')
                 ->withoutOverlapping()
                 ->onFailure(function () {
                     \Illuminate\Support\Facades\Log::error('❌ SendInactiveUserEmailsJob failed');
                 });

        // ── Email sequence: registered-but-never-enrolled nudge ───────────────
        // Every 2 days per admin request (was daily). Job filters to day-1,
        // day-3, day-7 post-registration.
        $schedule->job(new SendUnenrolledUserNudgeJob)
                 ->cron('30 8 */2 * *')
                 ->withoutOverlapping()
                 ->onFailure(function () {
                     \Illuminate\Support\Facades\Log::error('❌ SendUnenrolledUserNudgeJob failed');
                 });
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}