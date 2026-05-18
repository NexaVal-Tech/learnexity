<?php

namespace App\Http\Controllers\Api\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Instructor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;
use Exception;

class InstructorAuthController extends Controller
{
    /**
     * POST /api/instructor/login
     */
    public function login(Request $request)
    {
        Log::info('INSTRUCTOR LOGIN ATTEMPT', ['email' => $request->email]);

        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            auth()->shouldUse('instructor');
            $credentials = $request->only('email', 'password');

            if (!$token = auth()->attempt($credentials)) {
                return response()->json(['success' => false, 'message' => 'Invalid email or password'], 401);
            }

            $instructor = auth()->user();

            if (!$instructor->is_active) {
                auth()->logout();
                return response()->json(['success' => false, 'message' => 'Your account has been deactivated. Contact the admin.'], 403);
            }

            // Update last login
            $instructor->update(['last_login_at' => now()]);

            Log::info('INSTRUCTOR LOGIN SUCCESS', ['instructor_id' => $instructor->id]);

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data'    => [
                    'instructor' => $instructor,
                    'token'      => $token,
                    'token_type' => 'bearer',
                ],
            ]);
        } catch (Exception $e) {
            Log::error('INSTRUCTOR LOGIN EXCEPTION', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Internal server error'], 500);
        }
    }

    /**
     * GET /api/instructor/me
     */
    public function me()
    {
        try {
            auth()->shouldUse('instructor');
            $instructor = auth()->user();

            if (!$instructor) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
            }

            // Eager-load assigned course IDs
            $courseIds = DB::table('instructor_courses')
                ->where('instructor_id', $instructor->id)
                ->pluck('course_id');

            return response()->json([
                'success' => true,
                'data'    => array_merge($instructor->toArray(), ['assigned_course_ids' => $courseIds]),
            ]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Internal server error'], 500);
        }
    }

    /**
     * POST /api/instructor/logout
     */
    public function logout()
    {
        try {
            auth()->shouldUse('instructor');
            auth()->logout();
            return response()->json(['success' => true, 'message' => 'Logged out successfully']);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Internal server error'], 500);
        }
    }

    /**
     * POST /api/instructor/refresh
     */
    public function refresh()
    {
        try {
            auth()->shouldUse('instructor');
            $newToken = auth()->refresh();
            return response()->json(['success' => true, 'data' => ['token' => $newToken, 'token_type' => 'bearer']]);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'Token refresh failed'], 401);
        }
    }
}