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

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $credentials = $request->only('email', 'password');

        // Set guard to admin
        auth()->shouldUse('admin');

        if (!$token = auth()->attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password'
            ], 401);
        }

        $admin = auth()->user();

        return response()->json([
            'success' => true,
            'message' => 'Admin logged in successfully',
            'data' => [
                'admin' => $admin,
                'token' => $token,
                'token_type' => 'bearer',
            ]
        ]);
    }

    public function me()
    {
        auth()->shouldUse('admin');
        
        return response()->json([
            'success' => true,
            'data' => auth()->user()
        ]);
    }

    public function logout()
    {
        auth()->shouldUse('admin');
        auth()->logout();

        return response()->json([
            'success' => true,
            'message' => 'Admin logged out successfully'
        ]);
    }

    public function refresh()
    {
        auth()->shouldUse('admin');
        
        return response()->json([
            'success' => true,
            'data' => [
                'token' => auth()->refresh(),
                'token_type' => 'bearer',
            ]
        ]);
    }

    /**
     * Send password reset link to admin
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if admin exists
        $admin = Admin::where('email', $request->email)->first();
        
        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'We could not find an admin with that email address.'
            ], 404);
        }

        // Send password reset link using admin broker
        $status = Password::broker('admins')->sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'success' => true,
                'message' => 'Password reset link sent to your email.'
            ]);
        }

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
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Reset password using admin broker
        $status = Password::broker('admins')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($admin, $password) {
                $admin->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $admin->save();

                event(new PasswordReset($admin));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Your password has been reset successfully!'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => __($status)
        ], 400);
    }
}