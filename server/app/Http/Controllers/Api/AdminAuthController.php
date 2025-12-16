<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Log;
use Exception;

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        Log::info('ADMIN LOGIN ATTEMPT', [
            'ip' => $request->ip(),
            'payload' => $request->except('password'),
        ]);

        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            Log::warning('ADMIN LOGIN VALIDATION FAILED', [
                'errors' => $validator->errors(),
            ]);

            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            auth()->shouldUse('admin');
            Log::info('ADMIN GUARD SET');

            $credentials = $request->only('email', 'password');

            if (!$token = auth()->attempt($credentials)) {
                Log::warning('ADMIN LOGIN FAILED - INVALID CREDENTIALS', [
                    'email' => $request->email,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email or password'
                ], 401);
            }

            $admin = auth()->user();

            Log::info('ADMIN LOGIN SUCCESS', [
                'admin_id' => $admin->id,
                'email' => $admin->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Admin logged in successfully',
                'data' => [
                    'admin' => $admin,
                    'token' => $token,
                    'token_type' => 'bearer',
                ]
            ]);
        } catch (Exception $e) {
            Log::error('ADMIN LOGIN EXCEPTION', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    public function me()
    {
        Log::info('ADMIN ME REQUEST');

        try {
            auth()->shouldUse('admin');
            $admin = auth()->user();

            if (!$admin) {
                Log::warning('ADMIN ME FAILED - NOT AUTHENTICATED');
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }

            Log::info('ADMIN ME SUCCESS', [
                'admin_id' => $admin->id,
                'email' => $admin->email,
            ]);

            return response()->json([
                'success' => true,
                'data' => $admin
            ]);
        } catch (Exception $e) {
            Log::error('ADMIN ME EXCEPTION', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    public function logout()
    {
        Log::info('ADMIN LOGOUT REQUEST');

        try {
            auth()->shouldUse('admin');
            $admin = auth()->user();

            auth()->logout();

            Log::info('ADMIN LOGOUT SUCCESS', [
                'admin_id' => optional($admin)->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Admin logged out successfully'
            ]);
        } catch (Exception $e) {
            Log::error('ADMIN LOGOUT EXCEPTION', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    public function refresh()
    {
        Log::info('ADMIN TOKEN REFRESH REQUEST');

        try {
            auth()->shouldUse('admin');
            $newToken = auth()->refresh();

            Log::info('ADMIN TOKEN REFRESH SUCCESS');

            return response()->json([
                'success' => true,
                'data' => [
                    'token' => $newToken,
                    'token_type' => 'bearer',
                ]
            ]);
        } catch (Exception $e) {
            Log::error('ADMIN TOKEN REFRESH FAILED', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Token refresh failed'
            ], 401);
        }
    }

    /**
     * Send password reset link to admin
     */
    public function forgotPassword(Request $request)
    {
        Log::info('ADMIN FORGOT PASSWORD REQUEST', [
            'email' => $request->email,
        ]);

        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            Log::warning('ADMIN FORGOT PASSWORD VALIDATION FAILED', [
                'errors' => $validator->errors(),
            ]);

            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $admin = Admin::where('email', $request->email)->first();

        if (!$admin) {
            Log::warning('ADMIN FORGOT PASSWORD EMAIL NOT FOUND', [
                'email' => $request->email,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'We could not find an admin with that email address.'
            ], 404);
        }

        $status = Password::broker('admins')->sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            Log::info('ADMIN RESET LINK SENT', [
                'email' => $request->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password reset link sent to your email.'
            ]);
        }

        Log::error('ADMIN RESET LINK FAILED', [
            'status' => $status,
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Unable to send reset link. Please try again.'
        ], 500);
    }

    /**
     * Reset admin password
     */
    public function resetPassword(Request $request)
    {
        Log::info('ADMIN RESET PASSWORD REQUEST', [
            'email' => $request->email,
        ]);

        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            Log::warning('ADMIN RESET PASSWORD VALIDATION FAILED', [
                'errors' => $validator->errors(),
            ]);

            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $status = Password::broker('admins')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($admin, $password) {
                Log::info('ADMIN PASSWORD RESETTING', [
                    'admin_id' => $admin->id,
                ]);

                $admin->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $admin->save();

                event(new PasswordReset($admin));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            Log::info('ADMIN PASSWORD RESET SUCCESS', [
                'email' => $request->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Your password has been reset successfully!'
            ]);
        }

        Log::error('ADMIN PASSWORD RESET FAILED', [
            'status' => $status,
        ]);

        return response()->json([
            'success' => false,
            'message' => __($status)
        ], 400);
    }
}
