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

    $middleware->validateCsrfTokens(except: [
        'api/auth/exchange-token',
        'api/paystack/webhook',
        'api/stripe/webhook',
    ]);

    $middleware->alias([
        'role' => \App\Http\Middleware\CheckRole::class,
        'jwt.auth' => \App\Http\Middleware\JwtMiddleware::class,
        'admin.auth' => \App\Http\Middleware\AdminAuthMiddleware::class,
        'oauth.csrf.disable' => \App\Http\Middleware\DisableCsrfForOAuth::class,
    ]);
})
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();