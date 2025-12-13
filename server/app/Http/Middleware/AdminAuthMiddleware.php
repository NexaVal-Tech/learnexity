<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

class AdminAuthMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            // IMPORTANT: Set the guard FIRST, before parsing
            JWTAuth::setRequest($request);
            
            // Parse and authenticate the token
            $admin = JWTAuth::parseToken()->authenticate();
            
            if (!$admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Admin not found'
                ], 401);
            }

            // Set the authenticated admin on the request
            $request->merge(['admin' => $admin]);

        } catch (TokenExpiredException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Admin token has expired'
            ], 401);
        } catch (TokenInvalidException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Admin token is invalid'
            ], 401);
        } catch (JWTException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Admin authorization token not found',
                'error' => $e->getMessage() // Add this for debugging
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred during authentication',
                'error' => $e->getMessage() // Add this for debugging
            ], 500);
        }

        return $next($request);
    }
}