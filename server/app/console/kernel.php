<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        dd('SCHEDULE METHOD HIT');
        // Send payment reminders daily at 9 AM
        $schedule->command('payments:send-reminders')
                 ->dailyAt('09:00')
                 ->withoutOverlapping()
                 ->appendOutputTo(storage_path('logs/payment-reminders.log'));

        // Check and block overdue payments daily at 2 AM
        $schedule->command('payments:check-overdue')
                 ->dailyAt('02:00')
                 ->withoutOverlapping()
                 ->appendOutputTo(storage_path('logs/overdue-checks.log'));

        // Update access status for all installment enrollments every 6 hours
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