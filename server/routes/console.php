<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\CourseEnrollment;

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

