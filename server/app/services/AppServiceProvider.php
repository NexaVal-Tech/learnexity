<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Console\Scheduling\Schedule;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register scheduled tasks here as a fallback
        if ($this->app->runningInConsole()) {
            $this->app->booted(function () {
                $schedule = $this->app->make(Schedule::class);
                
                // Send payment reminders daily at 9 AM
                $schedule->command('payments:send-reminders')
                         ->dailyAt('09:00')
                         ->withoutOverlapping();

                // Check and block overdue payments daily at 2 AM
                $schedule->command('payments:check-overdue')
                         ->dailyAt('02:00')
                         ->withoutOverlapping();

                // Update access status every 6 hours
                $schedule->call(function () {
                    \App\Models\CourseEnrollment::where('payment_type', 'installment')
                        ->where('payment_status', '!=', 'completed')
                        ->each(fn ($enrollment) => $enrollment->updateAccessStatus());
                })
                ->name('update-access-status')
                ->everySixHours()
                ->withoutOverlapping();
            });
        }
    }
}