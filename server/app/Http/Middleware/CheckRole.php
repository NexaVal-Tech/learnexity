<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, string $role)
    {
        if (!$request->user() || $request->user()->role !== $role) {
            return response()->json([
                'error' => 'Unauthorized. Admin access required.'
            ], 403);
        }
        
        return $next($request);
    }
}