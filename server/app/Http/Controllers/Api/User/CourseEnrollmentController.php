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
            'learning_track' => 'nullable|in:one_on_one,group_mentorship,self_paced,intermediate',
            'payment_type'   => 'required|in:onetime,installment',
            // Deep-tech screening (one_on_one / group_mentorship only) — a
            // soft-gate self-attestation. Optional so existing clients that
            // don't send it (or self-paced enrollments) keep working.
            'screening'                            => 'nullable|array',
            'screening.has_laptop'                 => 'nullable|boolean',
            'screening.has_programming_knowledge'  => 'nullable|boolean',
            'screening.reliable_internet'          => 'nullable|boolean',
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

        // ── Free courses: skip payment entirely ────────────────────────────
        // Admin has marked this course is_free — the student gets instant,
        // full access to resources with no checkout step. We still record a
        // nominal total_amount (the course's normal track price) purely for
        // display purposes ("this course is normally worth $X — free right
        // now"); no money ever changes hands and payment_status is set
        // straight to 'completed' with has_access true.
        if ($course->is_free) {
            if ($user->intended_course_id !== $courseId) {
                $user->update(['intended_course_id' => $courseId]);
            }

            $existingFreeEnrollment = CourseEnrollment::where('user_id', $user->id)
                ->where('course_id', $courseId)
                ->first();

            if ($existingFreeEnrollment) {
                if (!$existingFreeEnrollment->has_access || $existingFreeEnrollment->payment_status !== 'completed') {
                    $existingFreeEnrollment->update([
                        'payment_status' => 'completed',
                        'has_access'     => true,
                        'payment_date'   => $existingFreeEnrollment->payment_date ?? now(),
                        'transaction_id' => $existingFreeEnrollment->transaction_id ?? 'FREE-ENROLLMENT',
                    ]);
                }

                return response()->json([
                    'message'       => 'You are already enrolled in this free course',
                    'enrollment_id' => $existingFreeEnrollment->id,
                    'is_free'       => true,
                    'has_access'    => true,
                ], 200);
            }

            $nominalPrice = $course->getTrackPriceByCurrency($learningTrack, $currency);

            $freeEnrollment = CourseEnrollment::create([
                'user_id'             => $user->id,
                'course_id'           => $courseId,
                'course_name'         => $course->title,
                'learning_track'      => $learningTrack,
                'payment_type'        => 'onetime',
                'currency'            => $currency,
                'total_amount'        => $nominalPrice,
                'amount_paid'         => 0,
                'total_installments'  => 1,
                'installments_paid'   => 1,
                'installment_amount'  => 0,
                'payment_status'      => 'completed',
                'has_access'          => true,
                'next_payment_due'    => null,
                'enrollment_date'     => now(),
                'payment_date'        => now(),
                'transaction_id'      => 'FREE-ENROLLMENT',
                'is_registration_fee' => false,
            ]);

            Log::info('✅ Free course enrollment granted', [
                'enrollment_id' => $freeEnrollment->id,
                'user_id'       => $user->id,
                'course_id'     => $courseId,
            ]);

            \App\Services\ActivityLogger::log(
                'enrollment.created',
                "{$user->name} enrolled in {$course->title} (free)",
                actorType: 'user',
                actorId: $user->id,
                actorName: $user->name,
                metadata: ['enrollment_id' => $freeEnrollment->id, 'is_free' => true],
                courseId: $courseId,
                request: $request
            );

            return response()->json([
                'message'       => 'Enrolled successfully — this course is free!',
                'enrollment_id' => $freeEnrollment->id,
                'is_free'       => true,
                'has_access'    => true,
                'total_amount'  => $nominalPrice,
                'currency'      => $currency,
            ], 201);
        }

        // ── Deep-tech screening (soft gate) ───────────────────────────────
        // Only meaningful for the mentorship tracks. Self-attestation only —
        // never blocks enrollment, just flags the enrollment so admins know
        // to follow up (e.g. via WhatsApp) with applicants who don't yet
        // meet the criteria.
        $isDeepTechTrack   = in_array($learningTrack, ['one_on_one', 'group_mentorship'], true);
        $screeningInput    = $request->input('screening');
        $screeningAnswers  = null;
        $screeningPassed   = null;

        if ($isDeepTechTrack && is_array($screeningInput)) {
            $screeningAnswers = [
                'has_laptop'                => (bool) ($screeningInput['has_laptop'] ?? false),
                'has_programming_knowledge' => (bool) ($screeningInput['has_programming_knowledge'] ?? false),
                'reliable_internet'         => (bool) ($screeningInput['reliable_internet'] ?? false),
                'screened_at'               => now()->toIso8601String(),
            ];
            $screeningPassed = $screeningAnswers['has_laptop']
                && $screeningAnswers['has_programming_knowledge']
                && $screeningAnswers['reliable_internet'];

            Log::info('🧪 Deep-tech screening recorded', [
                'user_id'   => $user->id,
                'course_id' => $courseId,
                'passed'    => $screeningPassed,
                'answers'   => $screeningAnswers,
            ]);
        }

        // ── Pricing (single source of truth — see PricingService) ────────────
        $pricing = \App\Services\PricingService::calculate($user, $course, $currency, $learningTrack, $paymentType);

        $isRegistrationFee     = $pricing['is_registration_fee'];
        $scholarship           = $pricing['scholarship'];
        $paymentType           = $pricing['payment_type']; // forced to 'onetime' for registration-fee, except Deep-Tech/Intermediate which may split into 2 (see PricingService)
        $registrationFeeAmount = $isRegistrationFee ? $pricing['amount'] : null;

        if ($isRegistrationFee && $registrationFeeAmount <= 0) {
            Log::warning('⚠️ [enroll] Registration fee not configured', ['currency' => $currency]);
            return response()->json([
                'message' => 'Registration fee is not configured yet. Please contact support.',
            ], 400);
        }

        if ($isRegistrationFee) {
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

            // Always resync pricing against PricingService (the single source
            // of truth) on every call — not just when track/payment-type/the
            // 100%-scholarship flag visibly changed.
            //
            // Why: a PARTIAL scholarship award (e.g. the 50% tier) never
            // flips is_registration_fee — that flag only turns true at
            // >=100%. So the old "did something obviously change" gate below
            // this comment used to silently skip the price refresh for any
            // student who applied for and was awarded a scholarship AFTER
            // their initial (pre-scholarship) enrollment and then returned
            // to pay with the same track/payment type — which is the normal
            // flow. Result: they were charged, and the confirmation email
            // reported, the original undiscounted course price instead of
            // their scholarship price. Recomputing on every sync call is
            // cheap and idempotent (PricingService does a couple of indexed
            // lookups), so there's no upside to gating it — always write the
            // fresh numbers.
            $oldTotalAmount = (float) $existingEnrollment->total_amount;

            $existingEnrollment->update([
                'learning_track'      => $learningTrack,
                'payment_type'        => $paymentType,
                'total_amount'        => $pricing['amount'],
                'installment_amount'  => $pricing['installment_amount'],
                'total_installments'  => $pricing['total_installments'],
                'currency'            => $currency,
                'scholarship_id'      => $scholarship?->id,
                'is_registration_fee' => $isRegistrationFee,
                // Screening answers can arrive on a retry even when nothing
                // else changed (e.g. user closed the payment page and came
                // back through the screening modal again) — always refresh
                // them when present so admins see the latest attestation.
                ...($screeningAnswers !== null ? [
                    'deep_tech_screening_passed'  => $screeningPassed,
                    'deep_tech_screening_answers' => $screeningAnswers,
                ] : []),
            ]);

            if (round($oldTotalAmount, 2) !== round((float) $pricing['amount'], 2)) {
                Log::info('🔄 Pending enrollment price resynced — amount changed', [
                    'enrollment_id'        => $existingEnrollment->id,
                    'old_total_amount'     => $oldTotalAmount,
                    'new_total_amount'     => $pricing['amount'],
                    'scholarship_id'       => $scholarship?->id,
                    'is_registration_fee'  => $isRegistrationFee,
                ]);
            } else {
                Log::info('🔄 Pending enrollment pricing resynced (no change)', [
                    'enrollment_id' => $existingEnrollment->id,
                    'total_amount'  => $pricing['amount'],
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
                'registration_fee_split_allowed' => $pricing['registration_fee_split_allowed'] ?? false,
            ], 200);
        }

        // ── New enrollment ───────────────────────────────────────────────────────
        $finalPrice = $pricing['amount'];

        if (!$isRegistrationFee && $finalPrice <= 0) {
            return response()->json([
                'message' => 'Pricing not configured for this course and currency combination',
            ], 400);
        }

        $totalInstallments = $pricing['total_installments'];
        $installmentAmount = $pricing['installment_amount'];

        $enrollment = CourseEnrollment::create([
            'user_id'             => $user->id,
            'course_id'           => $courseId,
            'course_name'         => $course->title,
            'learning_track'      => $learningTrack,
            'deep_tech_screening_passed'  => $screeningPassed,
            'deep_tech_screening_answers' => $screeningAnswers,
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

        \App\Services\ActivityLogger::log(
            'enrollment.created',
            "{$user->name} enrolled in {$course->title}",
            actorType: 'user',
            actorId: $user->id,
            actorName: $user->name,
            metadata: ['enrollment_id' => $enrollment->id],
            courseId: $courseId,
            request: $request
        );

        return response()->json([
            'message'             => 'Enrollment created successfully',
            'enrollment_id'       => $enrollment->id,
            'total_amount'        => $finalPrice,
            'installment_amount'  => $installmentAmount,
            'total_installments'  => $totalInstallments,
            'currency'            => $currency,
            'payment_type'        => $paymentType,
            'is_registration_fee' => $isRegistrationFee,
            'registration_fee_split_allowed' => $pricing['registration_fee_split_allowed'] ?? false,
            'deep_tech_screening_passed' => $screeningPassed,
        ], 201);
    }


    /**
     * Submit the deep-tech readiness screening (laptop, programming
     * knowledge, reliable internet) for an EXISTING enrollment. This is
     * called from the payment page — every enrollment path (courses list,
     * scholarship approval, dashboard modal) funnels through the payment
     * page, so screening lives here once instead of being gated separately
     * at each enrollment entry point.
     *
     * Soft gate: always succeeds and never blocks payment, it just records
     * whether the applicant met all three criteria so admins can follow up
     * (see admin/new_student.blade.php).
     */
    public function submitDeepTechScreening(Request $request, $enrollmentId)
    {
        $user = auth()->user();

        $enrollment = CourseEnrollment::where('id', $enrollmentId)
            ->where('user_id', $user->id)
            ->first();

        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        if (!in_array($enrollment->learning_track, ['one_on_one', 'group_mentorship'], true)) {
            return response()->json([
                'message' => 'Deep-tech screening only applies to mentorship tracks',
            ], 422);
        }

        $validated = $request->validate([
            'has_laptop'                => 'required|boolean',
            'has_programming_knowledge' => 'required|boolean',
            'reliable_internet'         => 'required|boolean',
        ]);

        $screeningPassed = $validated['has_laptop']
            && $validated['has_programming_knowledge']
            && $validated['reliable_internet'];

        $enrollment->update([
            'deep_tech_screening_passed'  => $screeningPassed,
            'deep_tech_screening_answers' => [
                ...$validated,
                'screened_at' => now()->toIso8601String(),
            ],
        ]);

        Log::info('🧪 Deep-tech screening submitted on payment page', [
            'enrollment_id' => $enrollment->id,
            'user_id'       => $user->id,
            'passed'        => $screeningPassed,
        ]);

        return response()->json([
            'message' => 'Screening recorded',
            'deep_tech_screening_passed' => $screeningPassed,
        ]);
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
            'learning_track' => 'nullable|in:one_on_one,group_mentorship,self_paced,intermediate',
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

        if ($request->payment_status === 'completed') {
            \App\Services\ActivityLogger::log(
                'payment.completed',
                "{$user->name} completed payment for {$enrollment->course_name}",
                actorType: 'user',
                actorId: $user->id,
                actorName: $user->name,
                metadata: ['enrollment_id' => $enrollment->id, 'amount' => $enrollment->amount_paid],
                courseId: $enrollment->course_id,
                request: $request
            );
        }

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