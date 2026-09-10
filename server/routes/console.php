<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\CourseEnrollment;
use Illuminate\Support\Facades\Log;
use App\Jobs\SendDailyCheckinEmailsJob;
use App\Jobs\SendInactiveUserEmailsJob;
use App\Jobs\SendUnenrolledUserNudgeJob;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule the overdue payment check to run daily at 2 AM
/*
|--------------------------------------------------------------------------
| Scheduled Commands (Laravel 11+)
|--------------------------------------------------------------------------
*/

Schedule::command('payments:send-reminders')
    ->dailyAt('09:00')
    ->name('payments-send-reminders')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/payment-reminders.log'));

Schedule::command('payments:check-overdue')
    ->dailyAt('02:00')
    ->name('payments-check-overdue')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/overdue-checks.log'));

Schedule::call(function () {
    Log::info('Running scheduled access status update');

    $enrollments = CourseEnrollment::where('payment_type', 'installment')
        ->where('payment_status', '!=', 'completed')
        ->get();

    foreach ($enrollments as $enrollment) {
        $enrollment->updateAccessStatus();
    }

    Log::info('Updated access status for '.$enrollments->count().' enrollments');
})
->name('update-access-status')
->everySixHours()
->withoutOverlapping();

// ── Engagement emails ────────────────────────────────────────────────────
//
// Every 2 days instead of daily (per admin request). Cron has no native
// "every 48 hours" primitive, so this uses the standard `*/2` day-of-month
// pattern (fires on odd calendar days: the 1st, 3rd, 5th, ...) — the
// conventional way to express "every other day" in cron. Welcome email
// (event-triggered on signup verification — see SendWelcomeEmail listener)
// and the installment payment reminder below (day-threshold based: 7/3/1/0
// days before due, so it must stay daily to hit those exact marks) are
// deliberately left out of this change.
//
// The "payment notification" (pending-payment nudge) has been cancelled
// entirely per admin request — see SendPendingPaymentNudgeJob, no longer
// scheduled anywhere.

Schedule::call(fn () => (new SendDailyCheckinEmailsJob())->handle())
    ->name('daily-checkin-emails')
    ->cron('0 8 */2 * *')
    ->withoutOverlapping();

Schedule::call(fn () => (new SendInactiveUserEmailsJob())->handle())
    ->name('inactive-user-emails')
    ->cron('15 8 */2 * *')
    ->withoutOverlapping();

Schedule::call(fn () => (new SendUnenrolledUserNudgeJob())->handle())
    ->name('unenrolled-user-nudge')
    ->cron('30 8 */2 * *')
    ->withoutOverlapping();

// Scholarship countdown reminders — was only ever registered in the dead
// app/Console/kernel.php (never actually loaded by Laravel's bootstrap, see
// that file's docblock), so these emails have never fired. Fixed by
// registering here. Safe on any cadence — dedup is explicit via the
// reminders_sent column, not "runs once a day" (see command docblock).
Schedule::command('scholarships:send-countdown-reminders')
    ->cron('45 8 */2 * *')
    ->name('scholarship-countdown-reminders')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/scholarship-countdown-reminders.log'));

