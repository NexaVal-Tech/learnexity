<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restricts a route to super admins only — used for admin-account
 * management (creating/editing/deleting other admins) so a limited admin
 * can never reach those endpoints even if they somehow guessed the URL.
 */
class EnsureSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $admin = $request->user('admin') ?? auth('admin')->user();

        if (! $admin || ! $admin->is_super_admin) {
            return response()->json(['message' => 'Super admin access required.'], 403);
        }

        return $next($request);
    }
}
