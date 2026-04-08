<?php
// app/Http/Middleware/JwtMiddlewareRe.php

namespace App\Http\Middleware;

use Closure;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use App\Models\PublicReferrer;
use Exception;

class JwtMiddlewareRe
{
    public function handle($request, Closure $next)
    {
        // ── 1. Extract token (cookie first, then Authorization header) ──────────
        $token = $request->cookie('token') ?: $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Token not provided'], 401);
        }

        // ── 2. Decode and validate ────────────────────────────────────────────
        try {
            JWTAuth::setToken($token);
            $payload = JWTAuth::getPayload();
        } catch (TokenExpiredException $e) {
            return response()->json(['error' => 'Token expired'], 401);
        } catch (TokenInvalidException $e) {
            return response()->json(['error' => 'Token invalid'], 401);
        } catch (JWTException $e) {
            return response()->json(['error' => 'Token error: ' . $e->getMessage()], 401);
        } catch (Exception $e) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // ── 3. Confirm this is a public-referrer token ────────────────────────
        //    (guard claim was set in PublicReferrer::getJWTCustomClaims)
        if ($payload->get('guard') !== 'public_referrer') {
            return response()->json(['error' => 'Unauthorized — wrong token type'], 401);
        }

        // ── 4. Resolve the referrer from the sub claim ────────────────────────
        //    sub is "re:<id>" as set in PublicReferrer::getJWTIdentifier()
        $sub = (string) $payload->get('sub'); // e.g. "re:12"
        $id  = ltrim(str_replace('re:', '', $sub), ' ');

        if (!$id || !is_numeric($id)) {
            return response()->json(['error' => 'Invalid token subject'], 401);
        }

        $referrer = PublicReferrer::find((int) $id);

        if (!$referrer) {
            return response()->json(['error' => 'Referrer not found'], 404);
        }

        // ── 5. Bind to request so controllers get it via $request->user() ─────
        $request->setUserResolver(fn() => $referrer);

        return $next($request);
    }
}