<?php

namespace App\Http\Middleware;

use Closure;

class DisableCsrfForOAuth
{
    public function handle($request, Closure $next)
    {
        // Tell Laravel this request is safe
        $request->attributes->set('_token', true);

        return $next($request);
    }
}