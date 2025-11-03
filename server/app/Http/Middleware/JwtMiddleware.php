<?php
// app/Http/Middleware/JwtMiddleware.php

namespace App\Http\Middleware;

use Closure;
use Tymon\JWTAuth\Facades\JWTAuth;
use Exception;

class JwtMiddleware
{
    public function handle($request, Closure $next)
    {
        try {
            // Try to get token from cookie first
            $token = $request->cookie('token');
            
            if (!$token) {
                // Fallback to Authorization header
                $token = $request->bearerToken();
            }

            if (!$token) {
                return response()->json(['error' => 'Token not provided'], 401);
            }

            // Set the token for JWTAuth
            JWTAuth::setToken($token);
            $user = JWTAuth::authenticate();

            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }
        } catch (Exception $e) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}