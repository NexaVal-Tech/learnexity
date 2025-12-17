<?php

    namespace App\Http\Controllers\Api\User;

    use App\Http\Controllers\Controller;
    use App\Models\CourseEnrollment;
    use App\Models\Course;
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
                'learning_track' => 'nullable|in:one_on_one,group_mentorship,self_paced',
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

            // Get the learning track, default to self_paced if not provided
            $learningTrack = $request->input('learning_track', 'self_paced');

            // Create new enrollment
            $enrollment = CourseEnrollment::create([
                'user_id' => $user->id,
                'course_id' => $courseId,
                'course_name' => $request->course_name,
                'course_price' => $request->course_price,
                'learning_track' => $learningTrack,
                'payment_status' => 'pending',
                'enrollment_date' => now(),
            ]);

            Log::info('✅ Enrollment created successfully', [
                'enrollment_id' => $enrollment->id,
                'course_id' => $courseId,
                'learning_track' => $learningTrack,
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
         * Update payment status (called by frontend after Paystack success)
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
                'learning_track' => 'nullable|in:one_on_one,group_mentorship,self_paced',
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

            // If already completed, don't update again
            if ($enrollment->payment_status === 'completed') {
                Log::info('ℹ️ Payment already completed', ['enrollment_id' => $enrollmentId]);
                return response()->json([
                    'message' => 'Payment already completed',
                    'enrollment' => $enrollment,
                ], 200);
            }

            $updateData = [
                'payment_status' => $request->payment_status,
                'transaction_id' => $request->transaction_id,
                'payment_date' => $request->payment_status === 'completed' ? now() : null,
            ];

            // Update learning track if provided
            if ($request->has('learning_track')) {
                $updateData['learning_track'] = $request->learning_track;
            }

            $enrollment->update($updateData);

            Log::info('✅ Payment status updated', [
                'enrollment_id' => $enrollmentId,
                'new_status' => $request->payment_status,
                'learning_track' => $enrollment->learning_track,
            ]);

            return response()->json([
                'message' => 'Payment status updated successfully',
                'enrollment' => $enrollment,
            ]);
        }

        /**
         * Verify payment with Paystack API (fallback method)
         */
        public function verifyPaymentStatus(Request $request, $enrollmentId)
        {
            Log::info('🔹 [verifyPaymentStatus] Manual verification requested', [
                'enrollment_id' => $enrollmentId,
            ]);

            $validator = Validator::make($request->all(), [
                'reference' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = auth()->user();
            $enrollment = CourseEnrollment::where('id', $enrollmentId)
                ->where('user_id', $user->id)
                ->first();

            if (!$enrollment) {
                return response()->json(['message' => 'Enrollment not found'], 404);
            }

            try {
                $reference = $request->reference;
                
                $curl = curl_init();
                curl_setopt_array($curl, [
                    CURLOPT_URL => "https://api.paystack.co/transaction/verify/{$reference}",
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_HTTPHEADER => [
                        "Authorization: Bearer " . env('PAYSTACK_SECRET_KEY'),
                        "Cache-Control: no-cache",
                    ],
                ]);

                $response = curl_exec($curl);
                $err = curl_error($curl);
                curl_close($curl);

                if ($err) {
                    Log::error('Paystack verification error', ['error' => $err]);
                    return response()->json(['error' => 'Verification failed'], 500);
                }

                $result = json_decode($response, true);

                if ($result['status'] && $result['data']['status'] === 'success') {
                    // Update enrollment
                    $enrollment->update([
                        'payment_status' => 'completed',
                        'transaction_id' => $reference,
                        'payment_date' => now(),
                    ]);

                    Log::info('✅ Payment verified and updated', [
                        'enrollment_id' => $enrollmentId,
                        'reference' => $reference,
                    ]);

                    return response()->json([
                        'status' => 'success',
                        'message' => 'Payment verified successfully',
                        'enrollment' => $enrollment->fresh(),
                    ]);
                }

                return response()->json([
                    'status' => 'failed',
                    'message' => 'Payment verification failed'
                ], 400);

            } catch (\Exception $e) {
                Log::error('Payment verification exception', [
                    'error' => $e->getMessage()
                ]);
                return response()->json(['error' => 'Verification failed'], 500);
            }
        }
    }