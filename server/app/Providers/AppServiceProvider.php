<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Verified;
use App\Listeners\SendWelcomeEmail;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;
use App\Models\CourseEnrollment;
use App\Jobs\SendDailyCheckinEmailsJob;
use App\Jobs\SendInactiveUserEmailsJob;
use App\Jobs\SendUnenrolledUserNudgeJob;
use App\Jobs\SendPendingPaymentNudgeJob;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // ── Email verification listener ──────────────────────────────────
        Event::listen(
            Verified::class,
            SendWelcomeEmail::class,
        );

        // ── Rate Limiting ────────────────────────────────────────────────
        $this->configureRateLimiting();

        // ── Scheduled Tasks ──────────────────────────────────────────────
         if ($this->app->runningInConsole()) {
            $this->app->booted(function () {
                $schedule = $this->app->make(Schedule::class);

                $schedule->command('payments:send-reminders')
                        ->dailyAt('09:00')
                        ->withoutOverlapping();

                $schedule->command('payments:check-overdue')
                        ->dailyAt('02:00')
                        ->withoutOverlapping();

                $schedule->call(function () {
                    CourseEnrollment::where('payment_type', 'installment')
                        ->where('payment_status', '!=', 'completed')
                        ->each(fn ($enrollment) => $enrollment->updateAccessStatus());
                })
                ->name('update-access-status')
                ->everySixHours()
                ->withoutOverlapping();

                // ── Newly registered email jobs ─────────────────────────────────
                $schedule->call(fn () => (new SendDailyCheckinEmailsJob())->handle())
                        ->name('daily-checkin-emails')
                        ->dailyAt('08:00')
                        ->withoutOverlapping();

                $schedule->call(fn () => (new SendInactiveUserEmailsJob())->handle())
                        ->name('inactive-user-emails')
                        ->dailyAt('08:15')
                        ->withoutOverlapping();

                $schedule->call(fn () => (new SendUnenrolledUserNudgeJob())->handle())
                        ->name('unenrolled-user-nudge')
                        ->dailyAt('08:30')
                        ->withoutOverlapping();

                $schedule->call(fn () => (new SendPendingPaymentNudgeJob())->handle())
                        ->name('pending-payment-nudge')
                        ->dailyAt('08:45')
                        ->withoutOverlapping();
            });
        }
    }

    protected function configureRateLimiting(): void
    {
        // Auth — strict, prevents brute force on student accounts
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)
                ->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Too many attempts. Please wait a minute before trying again.',
                    ], 429);
                });
        });

        // General API — authenticated users get more headroom than guests
        RateLimiter::for('api', function (Request $request) {
            return $request->user()
                ? Limit::perMinute(120)->by($request->user()->id)
                : Limit::perMinute(30)->by($request->ip());
        });

        // Payments & enrollment — prevents duplicate payment spam
        RateLimiter::for('payments', function (Request $request) {
            return Limit::perMinute(10)
                ->by(optional($request->user())->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Too many payment requests. Please wait before trying again.',
                    ], 429);
                });
        });

        // Webhooks — Paystack/Stripe; don't throttle by user IP
        RateLimiter::for('webhooks', function (Request $request) {
            return Limit::perMinute(60)->by('webhook');
        });
    }
}