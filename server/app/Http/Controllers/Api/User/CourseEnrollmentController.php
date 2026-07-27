<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\CourseEnrollment;
use App\Models\Scholarship;
use App\Models\Course;
use App\Models\User;
use App\Models\RegistrationFeeSetting;
use App\Services\LocationService;
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

        // Update access status if enrollment exists
        if ($enrollment) {
            $enrollment->updateAccessStatus();
        }

        Log::info('Enrollment lookup result', [
            'found' => $enrollment !== null,
            'payment_status' => $enrollment->payment_status ?? null,
            'has_access' => $enrollment->has_access ?? null,
        ]);

        return response()->json([
            'isEnrolled' => $enrollment !== null && $enrollment->payment_status === 'completed',
            'has_access' => $enrollment ? $enrollment->has_access : false,
            'enrollment' => $enrollment,
        ]);
    }

    /**
     * Enroll user in a course with location-based pricing.
     *
     * Pricing rule: if the user has an APPROVED, UNUSED scholarship tied to
     * THIS exact course, they pay the flat platform registration fee
     * (RegistrationFeeSetting) instead of the course price, one-time only.
     * Otherwise pricing is unchanged from before.
     */
    public function enroll(Request $request, $courseId)
    {
        $user = auth()->user();

        Log::info('📥 Enrollment request received', [
            'user_id'   => $user->id,
            'course_id' => $courseId,
            'request_data' => $request->all(),
        ]);

        $validator = Validator::make($request->all(), [
            'learning_track' => 'nullable|in:one_on_one,group_mentorship,self_paced',
            'payment_type'   => 'required|in:onetime,installment',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $course        = Course::where('course_id', $courseId)->firstOrFail();
        $currency      = LocationService::detectCurrency();
        $learningTrack = $request->input('learning_track', 'self_paced');
        $paymentType   = $request->input('payment_type');

        // ── Registration-fee override ────────────────────────────────────────
        $scholarship = Scholarship::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->where('status', 'approved')
            ->where('is_used', false)
            ->first();

        $isRegistrationFee     = (bool) $scholarship;
        $registrationFeeAmount = null;

        if ($isRegistrationFee) {
            $regFeeSetting          = RegistrationFeeSetting::current();
            $registrationFeeAmount  = $regFeeSetting->priceForCurrency($currency);
            $paymentType            = 'onetime'; // the registration fee is always paid in full, no installments

            if ($registrationFeeAmount <= 0) {
                Log::warning('⚠️ [enroll] Registration fee not configured', ['currency' => $currency]);
                return response()->json([
                    'message' => 'Registration fee is not configured yet. Please contact support.',
                ], 400);
            }

            Log::info('🎓 Registration-fee pricing applied', [
                'user_id' => $user->id, 'course_id' => $courseId,
                'scholarship_id' => $scholarship->id, 'amount' => $registrationFeeAmount, 'currency' => $currency,
            ]);
        }

        // Keep the intended course in sync regardless of entry point, so the
        // onboarding modal and payment reminders always point at the right course.
        if ($user->intended_course_id !== $courseId) {
            $user->update(['intended_course_id' => $courseId]);
        }

        // ── Check for existing enrollment ────────────────────────────────────────
        $existingEnrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->first();

        if ($existingEnrollment) {
            if ($existingEnrollment->payment_status === 'completed') {
                return response()->json([
                    'message'       => 'You are already enrolled in this course',
                    'enrollment_id' => $existingEnrollment->id,
                ], 409);
            }

            $needsUpdate = $existingEnrollment->learning_track !== $learningTrack
                || (bool) $existingEnrollment->is_registration_fee !== $isRegistrationFee;

            if ($needsUpdate) {
                if ($isRegistrationFee) {
                    $newPrice = $registrationFeeAmount;
                } else {
                    $newPrice = $course->getTrackPriceByCurrency($learningTrack, $currency);

                    if ($paymentType === 'onetime') {
                        $discountPercent = $course->getOneTimeDiscountByCurrency($currency);
                        if ($discountPercent > 0) {
                            $newPrice = max(0, round($newPrice * (1 - ($discountPercent / 100)), 2));
                        }
                    }
                }

                $newInstallmentAmount = $paymentType === 'installment'
                    ? round($newPrice / 4, 2)
                    : $newPrice;

                $existingEnrollment->update([
                    'learning_track'      => $learningTrack,
                    'payment_type'        => $paymentType,
                    'total_amount'        => $newPrice,
                    'installment_amount'  => $newInstallmentAmount,
                    'total_installments'  => $paymentType === 'installment' ? 4 : 1,
                    'currency'            => $currency,
                    'scholarship_id'      => $scholarship?->id,
                    'is_registration_fee' => $isRegistrationFee,
                ]);

                Log::info('🔄 Updated pending enrollment pricing', [
                    'enrollment_id'        => $existingEnrollment->id,
                    'new_track'            => $learningTrack,
                    'new_price'            => $newPrice,
                    'is_registration_fee'  => $isRegistrationFee,
                ]);
            }

            return response()->json([
                'message'             => 'Enrollment already exists. Please complete your payment.',
                'enrollment_id'       => $existingEnrollment->id,
                'total_amount'        => $existingEnrollment->fresh()->total_amount,
                'installment_amount'  => $existingEnrollment->fresh()->installment_amount,
                'total_installments'  => $existingEnrollment->total_installments,
                'currency'            => $existingEnrollment->currency,
                'payment_type'        => $existingEnrollment->payment_type,
                'is_registration_fee' => $existingEnrollment->fresh()->is_registration_fee,
            ], 200);
        }

        // ── New enrollment ───────────────────────────────────────────────────────
        if ($isRegistrationFee) {
            $finalPrice = $registrationFeeAmount;
        } else {
            $finalPrice = $course->getTrackPriceByCurrency($learningTrack, $currency);

            if ($finalPrice <= 0) {
                return response()->json([
                    'message' => 'Pricing not configured for this course and currency combination',
                ], 400);
            }

            if ($paymentType === 'onetime') {
                $discountPercent = $course->getOneTimeDiscountByCurrency($currency);
                if ($discountPercent > 0) {
                    $finalPrice = max(0, round($finalPrice * (1 - ($discountPercent / 100)), 2));
                }
            }
        }

        $totalInstallments  = $paymentType === 'installment' ? 4 : 1;
        $installmentAmount  = $paymentType === 'installment'
            ? round($finalPrice / 4, 2)
            : $finalPrice;

        $enrollment = CourseEnrollment::create([
            'user_id'             => $user->id,
            'course_id'           => $courseId,
            'course_name'         => $course->title,
            'learning_track'      => $learningTrack,
            'payment_type'        => $paymentType,
            'currency'            => $currency,
            'total_amount'        => $finalPrice,
            'amount_paid'         => 0,
            'total_installments'  => $totalInstallments,
            'installments_paid'   => 0,
            'installment_amount'  => $installmentAmount,
            'payment_status'      => 'pending',
            'has_access'          => false,
            'next_payment_due'    => $paymentType === 'installment' ? now()->addWeeks(4) : null,
            'enrollment_date'     => now(),
            'scholarship_id'      => $scholarship?->id,
            'is_registration_fee' => $isRegistrationFee,
        ]);

        Log::info('✅ Enrollment created successfully', [
            'enrollment_id'       => $enrollment->id,
            'is_registration_fee' => $isRegistrationFee,
        ]);

        return response()->json([
            'message'             => 'Enrollment created successfully',
            'enrollment_id'       => $enrollment->id,
            'total_amount'        => $finalPrice,
            'installment_amount'  => $installmentAmount,
            'total_installments'  => $totalInstallments,
            'currency'            => $currency,
            'payment_type'        => $paymentType,
            'is_registration_fee' => $isRegistrationFee,
        ], 201);
    }


    /**
     * Get user's enrolled courses with access status
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

        // Update access status for all enrollments
        foreach ($enrollments as $enrollment) {
            $enrollment->updateAccessStatus();
        }

        Log::info('Enrollments retrieved', ['count' => $enrollments->count()]);

        return response()->json([
            'enrollments' => $enrollments->fresh(),
        ]);
    }

    /**
     * Update payment status (used by frontend after Paystack success)
     */
    public function updatePaymentStatus(Request $request, $enrollmentId)
    {
        Log::info('🔹 [updatePaymentStatus] Manual update requested', [
            'enrollment_id' => $enrollmentId,
            'request_data' => $request->all(),
        ]);

        $validator = Validator::make($request->all(), [
            'payment_status' => 'required|in:pending,completed,failed',
            'transaction_id' => 'nullable|string',
            'scholarship_id' => 'nullable|integer',
            'learning_track' => 'nullable|in:one_on_one,group_mentorship,self_paced',
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
            ->firstOrFail();

        $updateData = [
            'payment_status' => $request->payment_status,
        ];

        if ($request->transaction_id) {
            $updateData['transaction_id'] = $request->transaction_id;
        }

        if ($request->learning_track) {
            $updateData['learning_track'] = $request->learning_track;
        }

        // If payment is completed
        if ($request->payment_status === 'completed') {
            if ($enrollment->payment_type === 'onetime') {
                // One-time payment: full access, fully paid
                $updateData['amount_paid'] = $enrollment->total_amount;
                $updateData['has_access'] = true;
                $updateData['payment_date'] = now();
            } else {
                // Installment: first payment
                $updateData['installments_paid'] = 1;
                $updateData['amount_paid'] = $enrollment->installment_amount;
                $updateData['has_access'] = true;
                $updateData['last_installment_paid_at'] = now();
                $updateData['next_payment_due'] = now()->addWeeks(4);
            }
        }

        $enrollment->update($updateData);

        // Fall back to the request's scholarship_id for backward compatibility,
        // but prefer the one stored on the enrollment itself (set at enroll time).
        $scholarshipIdToMark = $enrollment->scholarship_id ?? $request->scholarship_id;
        if ($request->payment_status === 'completed' && $scholarshipIdToMark) {
            Scholarship::find($scholarshipIdToMark)?->markAsUsed((int) $enrollmentId);
        }

        $this->clearIntendedCourseIfMatched($user, $enrollment->fresh());

        Log::info('✅ Payment status updated manually', [
            'enrollment_id' => $enrollmentId,
            'payment_status' => $request->payment_status,
            'has_access' => $enrollment->has_access,
        ]);

        return response()->json([
            'message' => 'Payment status updated successfully',
            'enrollment' => $enrollment->fresh(),
        ]);
    }

    /**
     * Process payment (called after Paystack verification)
     */
    public function processPayment(Request $request, $enrollmentId)
    {
        $validator = Validator::make($request->all(), [
            'transaction_id' => 'required|string',
            'amount' => 'required|numeric|min:0',
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
            ->firstOrFail();

        $amountPaid = $request->input('amount');

        // One-time payment
        if ($enrollment->payment_type === 'onetime') {
            $enrollment->update([
                'amount_paid' => $amountPaid,
                'payment_status' => 'completed',
                'has_access' => true,
                'transaction_id' => $request->transaction_id,
                'payment_date' => now(),
            ]);

            if ($enrollment->scholarship_id) {
                Scholarship::find($enrollment->scholarship_id)?->markAsUsed((int) $enrollmentId);
            }
            $this->clearIntendedCourseIfMatched($user, $enrollment->fresh());

            return response()->json([
                'message' => 'Payment completed successfully',
                'enrollment' => $enrollment->fresh(),
            ]);
        }

        // Installment payment
        $enrollment->installments_paid += 1;
        $enrollment->amount_paid += $amountPaid;
        $enrollment->last_installment_paid_at = now();
        $enrollment->transaction_id = $request->transaction_id;

        // Grant access after first payment
        $enrollment->has_access = true;

        // Calculate next payment due (4 weeks from now)
        if ($enrollment->installments_paid < $enrollment->total_installments) {
            $enrollment->next_payment_due = now()->addWeeks(4);
        } else {
            // All installments paid
            $enrollment->payment_status = 'completed';
            $enrollment->next_payment_due = null;
        }

        $enrollment->save();

        if ($enrollment->payment_status === 'completed') {
            if ($enrollment->scholarship_id) {
                Scholarship::find($enrollment->scholarship_id)?->markAsUsed($enrollment->id);
            }
            $this->clearIntendedCourseIfMatched($user, $enrollment->fresh());
        }

        // Record installment payment
        \DB::table('installment_payments')->insert([
            'enrollment_id' => $enrollment->id,
            'installment_number' => $enrollment->installments_paid,
            'amount' => $amountPaid,
            'currency' => $enrollment->currency,
            'status' => 'completed',
            'transaction_id' => $request->transaction_id,
            'paid_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Installment payment processed successfully',
            'enrollment' => $enrollment->fresh(),
            'installments_remaining' => $enrollment->total_installments - $enrollment->installments_paid,
            'next_payment_due' => $enrollment->next_payment_due,
        ]);
    }

    /**
     * Verify payment with Paystack API
     */
    public function verifyPaymentStatus(Request $request, $enrollmentId)
    {
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
                return response()->json(['error' => 'Verification failed: ' . $err], 500);
            }

            $result = json_decode($response, true);

            if ($result['status'] && $result['data']['status'] === 'success') {
                $amountPaidKobo = $result['data']['amount'];
                $amountPaid = $amountPaidKobo / 100;

                // Process the payment
                return $this->processPayment(
                    new Request([
                        'transaction_id' => $reference,
                        'amount' => $amountPaid,
                    ]),
                    $enrollmentId
                );
            }

            return response()->json([
                'status' => 'failed',
                'message' => 'Payment verification failed',
            ], 400);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Verification failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Check if user can access course (for frontend)
     */
    public function checkAccess($courseId)
    {
        $user = auth()->user();
        
        $enrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->first();

        if (!$enrollment) {
            return response()->json([
                'has_access' => false,
                'reason' => 'not_enrolled',
                'message' => 'You are not enrolled in this course.',
                'enrollment' => null,
            ]);
        }

        // Update access status based on payment deadlines
        $enrollment->updateAccessStatus();
        
        // Refresh the model to get updated values
        $enrollment->refresh();

        return response()->json([
            'has_access' => $enrollment->has_access,
            'reason' => !$enrollment->has_access ? 'payment_required' : null,
            'message' => $enrollment->access_blocked_reason,
            'next_payment_due' => $enrollment->next_payment_due,
            'installments_paid' => $enrollment->installments_paid,
            'total_installments' => $enrollment->total_installments,
            'payment_type' => $enrollment->payment_type,
            'is_overdue' => $enrollment->isPaymentOverdue(),
            'days_until_payment' => $enrollment->getDaysUntilPayment(),
            'enrollment' => $enrollment,
        ]);
    }

    /**
     * If this enrollment just got fully paid and it's the course the user
     * had marked as "intended", clear that flag so the onboarding modal
     * stops nagging them about it.
     */
    private function clearIntendedCourseIfMatched(User $user, CourseEnrollment $enrollment): void
    {
        if ($enrollment->payment_status === 'completed' && $user->intended_course_id === $enrollment->course_id) {
            $user->update(['intended_course_id' => null]);
        }
    }
}