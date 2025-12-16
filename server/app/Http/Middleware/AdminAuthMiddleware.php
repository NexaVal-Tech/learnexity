<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Illuminate\Support\Facades\Log;

class AdminAuthMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        Log::info('🔐 ADMIN AUTH MIDDLEWARE START', [
            'path' => $request->path(),
            'method' => $request->method(),
            'has_auth_header' => $request->hasHeader('Authorization'),
            'auth_header_preview' => $request->header('Authorization') ? substr($request->header('Authorization'), 0, 30) . '...' : 'NO HEADER',
        ]);

        try {
            // Set the guard to admin BEFORE parsing token
            auth()->shouldUse('admin');
            
            // Parse and authenticate the token
            $admin = JWTAuth::parseToken()->authenticate();
            
            if (!$admin) {
                Log::error('🚫 ADMIN AUTH FAILED - Token parsed but no admin found');
                return response()->json([
                    'success' => false,
                    'message' => 'Admin not found'
                ], 401);
            }

            // Check if the authenticated user is actually an Admin model
            if (!($admin instanceof \App\Models\Admin)) {
                Log::error('🚫 ADMIN AUTH FAILED - Not an admin model', [
                    'class' => get_class($admin)
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid admin token'
                ], 401);
            }
            
            Log::info('✅ ADMIN AUTH SUCCESS', [
                'admin_id' => $admin->id,
                'email' => $admin->email,
            ]);
            
            return $next($request);
            
        } catch (TokenExpiredException $e) {
            Log::error('🚫 ADMIN AUTH FAILED - Token expired');
            return response()->json([
                'success' => false,
                'message' => 'Token has expired'
            ], 401);
        } catch (TokenInvalidException $e) {
            Log::error('🚫 ADMIN AUTH FAILED - Token invalid');
            return response()->json([
                'success' => false,
                'message' => 'Token is invalid'
            ], 401);
        } catch (JWTException $e) {
            Log::error('🚫 ADMIN AUTH FAILED - JWT Exception', [
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Token is missing or malformed'
            ], 401);
        } catch (\Exception $e) {
            Log::error('🚫 ADMIN AUTH FAILED - General Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Authentication failed'
            ], 500);
        }
    }
}