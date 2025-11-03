<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\CourseEnrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CourseEnrollmentController extends Controller
{
    /**
     * Check if user is enrolled in a course
     */
    public function checkEnrollmentStatus($courseId)
    {
        Log::info('🔹 [checkEnrollmentStatus] Endpoint hit', ['course_id' => $courseId]);

        $user = auth()->user();
        Log::info('Authenticated user', ['user_id' => $user->id]);

        $enrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->first();

        Log::info('Enrollment lookup result', [
            'found' => $enrollment !== null,
            'payment_status' => $enrollment->payment_status ?? null,
        ]);

        return response()->json([
            'isEnrolled' => $enrollment !== null && $enrollment->payment_status === 'completed',
            'enrollment' => $enrollment,
        ]);
    }

    /**
     * Enroll user in a course
     */
    public function enroll(Request $request, $courseId)
    {
        Log::info('🔹 [enroll] Endpoint hit', ['course_id' => $courseId, 'request' => $request->all()]);

        $validator = Validator::make($request->all(), [
            'course_name' => 'required|string|max:255',
            'course_price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            Log::warning('⚠️ Validation failed', ['errors' => $validator->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = auth()->user();
        Log::info('Authenticated user', ['user_id' => $user->id]);

        // Check if already enrolled
        $existingEnrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->first();

        if ($existingEnrollment) {
            Log::info('Existing enrollment found', [
                'enrollment_id' => $existingEnrollment->id,
                'payment_status' => $existingEnrollment->payment_status,
            ]);

            if ($existingEnrollment->payment_status === 'completed') {
                Log::info('User already fully enrolled');
                return response()->json([
                    'message' => 'Already enrolled in this course',
                    'enrollment_id' => $existingEnrollment->id,
                ], 409);
            }

            Log::info('User has pending enrollment');
            return response()->json([
                'message' => 'Enrollment already exists with pending payment',
                'enrollment_id' => $existingEnrollment->id,
                'course_id' => $courseId,
            ], 200);
        }

        // Create new enrollment
        $enrollment = CourseEnrollment::create([
            'user_id' => $user->id,
            'course_id' => $courseId,
            'course_name' => $request->course_name,
            'course_price' => $request->course_price,
            'payment_status' => 'pending',
            'enrollment_date' => now(),
        ]);

        Log::info('✅ Enrollment created successfully', [
            'enrollment_id' => $enrollment->id,
            'course_id' => $courseId,
        ]);

        return response()->json([
            'message' => 'Successfully enrolled in course',
            'enrollment_id' => $enrollment->id,
            'course_id' => $courseId,
        ], 201);
    }

    /**
     * Get user's enrolled courses
     */
    public function getUserEnrollments()
    {
        Log::info('🔹 [getUserEnrollments] Endpoint hit');

        $user = auth()->user();

        // 🛑 Defensive check
        if (!$user) {
            Log::warning('⚠️ Unauthenticated request to getUserEnrollments');
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        Log::info('Authenticated user', ['user_id' => $user->id]);

        $enrollments = CourseEnrollment::where('user_id', $user->id)
            ->orderBy('enrollment_date', 'desc')
            ->get();

        Log::info('Enrollments retrieved', ['count' => $enrollments->count()]);

        return response()->json([
            'enrollments' => $enrollments,
        ]);
    }


    /**
     * Update payment status
     */
    public function updatePaymentStatus(Request $request, $enrollmentId)
    {
        Log::info('🔹 [updatePaymentStatus] Endpoint hit', [
            'enrollment_id' => $enrollmentId,
            'request' => $request->all(),
        ]);

        $validator = Validator::make($request->all(), [
            'payment_status' => 'required|in:pending,completed,failed',
            'transaction_id' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            Log::warning('⚠️ Validation failed', ['errors' => $validator->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = auth()->user();
        Log::info('Authenticated user', ['user_id' => $user->id]);

        $enrollment = CourseEnrollment::where('id', $enrollmentId)
            ->where('user_id', $user->id)
            ->first();

        if (!$enrollment) {
            Log::error('❌ Enrollment not found', ['enrollment_id' => $enrollmentId]);
            return response()->json([
                'message' => 'Enrollment not found',
            ], 404);
        }

        $enrollment->update([
            'payment_status' => $request->payment_status,
            'transaction_id' => $request->transaction_id,
            'payment_date' => $request->payment_status === 'completed' ? now() : null,
        ]);

        Log::info('✅ Payment status updated', [
            'enrollment_id' => $enrollmentId,
            'new_status' => $request->payment_status,
        ]);

        return response()->json([
            'message' => 'Payment status updated successfully',
            'enrollment' => $enrollment,
        ]);
    }
}
