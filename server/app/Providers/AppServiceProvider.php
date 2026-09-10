<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Verified;
use App\Listeners\SendWelcomeEmail;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;

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
        // All scheduled commands/jobs live in routes/console.php (Laravel 12
        // convention) — they used to ALSO be registered here, which meant
        // payments:send-reminders, payments:check-overdue, and
        // update-access-status were each running (and emailing/blocking
        // access) twice per scheduled tick. Consolidated to routes/console.php
        // only; see that file for the current schedule.
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