<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Jobs\SendDailyCheckinEmailsJob;
use App\Jobs\SendPendingPaymentNudgeJob;
use App\Jobs\SendInactiveUserEmailsJob;
use App\Jobs\SendUnenrolledUserNudgeJob;

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
        // Moved from 7 AM → 8 AM so it fires after the access status update
        // has already run. Change back to 07:00 if you prefer.
        $schedule->job(new SendDailyCheckinEmailsJob)
                 ->dailyAt('08:00')
                 ->withoutOverlapping()
                 ->onFailure(function () {
                     \Illuminate\Support\Facades\Log::error('❌ SendDailyCheckinEmailsJob failed');
                 });

        // ── Email sequence: pending payment nudge ─────────────────────────────
        // Runs just after the existing payments:send-reminders command so the
        // two never collide. Targets enrollments with payment_status = pending.
        $schedule->job(new SendPendingPaymentNudgeJob)
                 ->dailyAt('09:30')
                 ->withoutOverlapping()
                 ->onFailure(function () {
                     \Illuminate\Support\Facades\Log::error('❌ SendPendingPaymentNudgeJob failed');
                 });

        // ── Email sequence: inactive user re-engagement ───────────────────────
        // Fires at 10 AM; the job filters internally to days 2, 7, 14 only.
        $schedule->job(new SendInactiveUserEmailsJob)
                 ->dailyAt('10:00')
                 ->withoutOverlapping()
                 ->onFailure(function () {
                     \Illuminate\Support\Facades\Log::error('❌ SendInactiveUserEmailsJob failed');
                 });

        // ── Email sequence: registered-but-never-enrolled nudge ───────────────
        // Fires at 10:30 AM; job filters to day-1, day-3, day-7 post-registration.
        $schedule->job(new SendUnenrolledUserNudgeJob)
                 ->dailyAt('10:30')
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