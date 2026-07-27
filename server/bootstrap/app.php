<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
->withMiddleware(function (Middleware $middleware) {

    // Exclude oauth_token cookie from encryption
    $middleware->encryptCookies(except: [
        'oauth_token',
    ]);

    // Baseline security headers on every response (nosniff, frame-deny, etc.)
    // NOTE: app/Http/Kernel.php is NOT used by this app (Laravel 12 bootstraps
    // middleware here instead) — register new global middleware in this file,
    // not in Kernel.php's $middleware array.
    $middleware->append(\App\Http\Middleware\SecurityHeaders::class);

    $middleware->validateCsrfTokens(except: [
        'api/auth/exchange-token',
        'api/paystack/webhook',
        'api/stripe/webhook',
    ]);

    $middleware->alias([
        'role' => \App\Http\Middleware\CheckRole::class,
        'jwt.auth' => \App\Http\Middleware\JwtMiddleware::class,
        'jwt.auth.re' => \App\Http\Middleware\JwtMiddlewareRe::class,
        'admin.auth' => \App\Http\Middleware\AdminAuthMiddleware::class,
        'oauth.csrf.disable' => \App\Http\Middleware\DisableCsrfForOAuth::class,
    ]);
})
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();