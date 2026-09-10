<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Route-group/route-level gate for sub-admin permissions — runs after
 * admin.auth (which already confirmed the caller is a valid Admin).
 * Usage: ->middleware('admin.permission:students')
 *
 * Super admins (Admin::hasPermission() always returns true for them) pass
 * every check regardless of their `permissions` list.
 */
class EnsureAdminPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $admin = $request->user('admin') ?? auth('admin')->user();

        if (! $admin || ! $admin->hasPermission($permission)) {
            return response()->json([
                'message' => 'You do not have permission to access this.',
            ], 403);
        }

        return $next($request);
    }
}
