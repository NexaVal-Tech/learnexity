<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * The application's route middleware groups.
     *
     * @var array
     */
    protected $middlewareGroups = [
        'api' => [
            \Illuminate\Http\Middleware\HandleCors::class,
            'throttle:api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];

    /**
     * The application's route middleware aliases.
     *
     * @var array
     */
    protected $middlewareAliases = [
        'role' => \App\Http\Middleware\CheckRole::class,
        'jwt.auth' => \App\Http\Middleware\JwtMiddleware::class,
        'admin.auth' => \App\Http\Middleware\AdminAuthMiddleware::class,
    ];
}