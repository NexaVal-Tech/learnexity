<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KidsCourse;
use App\Models\KidsEnrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class KidsController extends Controller
{
    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/kids/courses
    // Returns all active courses with full pricing breakdown.
    // ──────────────────────────────────────────────────────────────────────────
    public function courses(): JsonResponse
    {
        $courses = KidsCourse::where('is_active', true)
            ->orderBy('order')
            ->get()
            ->map(fn($c) => $this->formatCourse($c));

        return response()->json(['courses' => $courses]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/kids/enroll
    //
    // enrollment_type options:
    //   'bundle'           → creates TWO linked enrollment rows (DF + track)
    //   'track_only'       → one row for the track, skipped_foundation = true
    //   'foundation_only'  → one row for DF only
    //
    // Pricing rules:
    //   onetime     → discounted price (onetime_discount_percent applied)
    //   installment → full price, no discount, 3 equal monthly payments
    // ──────────────────────────────────────────────────────────────────────────
    public function enroll(Request $request): JsonResponse
    {
        $data = $request->validate([
            'parent_name'     => 'required|string|max:255',
            'parent_email'    => 'required|email|max:255',
            'parent_phone'    => 'nullable|string|max:30',
            'student_name'    => 'required|string|max:255',
            'student_age'     => 'required|integer|min:8|max:18',
            'session_type'    => ['required', Rule::in(['one_on_one', 'group_mentorship'])],
            'track_slug'      => 'required|string|exists:kids_courses,slug',
            'enrollment_type' => ['required', Rule::in(['bundle', 'track_only', 'foundation_only'])],
            'payment_type'    => ['required', Rule::in(['onetime', 'installment'])],
            'currency'        => ['required', Rule::in(['USD', 'NGN'])],
        ]);

        $sessionType    = $data['session_type'];
        $paymentType    = $data['payment_type'];
        $currency       = $data['currency'];
        $enrollmentType = $data['enrollment_type'];

        $trackCourse = KidsCourse::where('slug', $data['track_slug'])->firstOrFail();
        $dfCourse    = KidsCourse::where('is_foundation', true)->where('is_active', true)->first();

        // ── Shared parent/student fields ──────────────────────────────────────
        $base = [
            'parent_name'     => $data['parent_name'],
            'parent_email'    => $data['parent_email'],
            'parent_phone'    => $data['parent_phone'] ?? null,
            'student_name'    => $data['student_name'],
            'student_age'     => $data['student_age'],
            'session_type'    => $sessionType,
            'payment_type'    => $paymentType,
            'payment_status'  => 'pending',
            'currency'        => $currency,
            'amount_paid'     => 0,
            'has_access'      => false,
        ];

        DB::beginTransaction();
        try {
            $primaryEnrollment = null;

            // ── BUNDLE: DF (1 month) + Track (2 months) ───────────────────────
            if ($enrollmentType === 'bundle' && $dfCourse) {
                $isBundle       = true;
                $originalPrice  = $trackCourse->getBundlePrice($sessionType, $currency);
                $finalPrice     = $trackCourse->getFinalPrice($sessionType, $currency, $paymentType, $isBundle);
                $discountAmount = $originalPrice - $finalPrice;
                $installments   = $paymentType === 'installment' ? 3 : 1;

                // Primary enrollment row = the track (this is what gets paid)
                $primaryEnrollment = KidsEnrollment::create(array_merge($base, [
                    'kids_course_id'    => $trackCourse->id,
                    'chosen_track'      => str_replace('-', '_', $trackCourse->slug),
                    'enrollment_type'   => 'bundle',
                    'skipped_foundation' => false,
                    'total_price'       => $finalPrice,
                    'original_price'    => $originalPrice,
                    'discount_applied'  => $discountAmount,
                    'total_installments' => $installments,
                    'installments_paid' => 0,
                ]));

                // Secondary enrollment row = DF (linked, no separate payment)
                $dfEnrollment = KidsEnrollment::create(array_merge($base, [
                    'kids_course_id'     => $dfCourse->id,
                    'chosen_track'       => 'digital_foundations',
                    'enrollment_type'    => 'bundle',
                    'paired_enrollment_id' => $primaryEnrollment->id,
                    'skipped_foundation' => false,
                    'total_price'        => 0,    // covered by primary
                    'original_price'     => 0,
                    'discount_applied'   => 0,
                    'total_installments' => $installments,
                    'installments_paid'  => 0,
                ]));

                // Link back
                $primaryEnrollment->update(['paired_enrollment_id' => $dfEnrollment->id]);
            }

            // ── TRACK ONLY (skipped DF) ───────────────────────────────────────
            elseif ($enrollmentType === 'track_only') {
                $originalPrice  = $trackCourse->getStandalonePrice($sessionType, $currency);
                $finalPrice     = $trackCourse->getFinalPrice($sessionType, $currency, $paymentType, false);
                $discountAmount = $originalPrice - $finalPrice;
                $installments   = $paymentType === 'installment' ? 3 : 1;

                $primaryEnrollment = KidsEnrollment::create(array_merge($base, [
                    'kids_course_id'     => $trackCourse->id,
                    'chosen_track'       => str_replace('-', '_', $trackCourse->slug),
                    'enrollment_type'    => 'track_only',
                    'skipped_foundation' => true,
                    'total_price'        => $finalPrice,
                    'original_price'     => $originalPrice,
                    'discount_applied'   => $discountAmount,
                    'total_installments' => $installments,
                    'installments_paid'  => 0,
                ]));
            }

            // ── FOUNDATION ONLY ───────────────────────────────────────────────
            else {
                $foundationCourse = $dfCourse ?? $trackCourse;
                $originalPrice    = $foundationCourse->getStandalonePrice($sessionType, $currency);
                $finalPrice       = $foundationCourse->getFinalPrice($sessionType, $currency, $paymentType, false);
                $discountAmount   = $originalPrice - $finalPrice;
                $installments     = $paymentType === 'installment' ? 3 : 1;

                $primaryEnrollment = KidsEnrollment::create(array_merge($base, [
                    'kids_course_id'     => $foundationCourse->id,
                    'chosen_track'       => 'digital_foundations',
                    'enrollment_type'    => 'foundation_only',
                    'skipped_foundation' => false,
                    'total_price'        => $finalPrice,
                    'original_price'     => $originalPrice,
                    'discount_applied'   => $discountAmount,
                    'total_installments' => $installments,
                    'installments_paid'  => 0,
                ]));
            }

            DB::commit();

            Log::info('Kids enrollment created', [
                'enrollment_id'   => $primaryEnrollment->id,
                'enrollment_type' => $enrollmentType,
                'parent_email'    => $primaryEnrollment->parent_email,
                'total_price'     => $primaryEnrollment->total_price,
                'discount'        => $primaryEnrollment->discount_applied,
            ]);

            return response()->json([
                'enrollment' => $this->formatEnrollment($primaryEnrollment->load('course')),
                'message'    => 'Enrollment created. Proceed to payment.',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Kids enrollment failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Enrollment failed. Please try again.'], 500);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/kids/enrollment/lookup?email=…
    // ──────────────────────────────────────────────────────────────────────────
    public function lookupByEmail(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => 'required|email']);

        $enrollments = KidsEnrollment::with('course')
            ->where('parent_email', $data['email'])
            ->whereIn('payment_status', ['pending', 'partial'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($e) => $this->formatEnrollment($e));

        return response()->json(['enrollments' => $enrollments]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/kids/enrollment/{id}
    // ──────────────────────────────────────────────────────────────────────────
    public function getEnrollment(int $id): JsonResponse
    {
        $enrollment = KidsEnrollment::with('course', 'installmentPayments')->findOrFail($id);
        return response()->json(['enrollment' => $this->formatEnrollment($enrollment)]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/kids/resume/{token}
    // ──────────────────────────────────────────────────────────────────────────
    public function resumeByToken(string $token): JsonResponse
    {
        $enrollment = KidsEnrollment::with('course', 'installmentPayments')
            ->where('resume_token', $token)
            ->firstOrFail();

        return response()->json([
            'status'     => $enrollment->isFullyPaid() ? 'already_paid' : 'pending',
            'enrollment' => $this->formatEnrollment($enrollment),
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/kids/enrollment/{id}/verify
    // ──────────────────────────────────────────────────────────────────────────
    public function verifyPayment(Request $request, int $id): JsonResponse
    {
        $enrollment = KidsEnrollment::with('course')->findOrFail($id);
        $enrollment->refresh();
        return response()->json(['enrollment' => $this->formatEnrollment($enrollment)]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────

    private function formatCourse(KidsCourse $c): array
    {
        return [
            'id'               => $c->id,
            'slug'             => $c->slug,
            'name'             => $c->name,
            'description'      => $c->description,
            'emoji'            => $c->emoji,
            'color'            => $c->color,
            'duration_months'  => $c->duration_months,
            'is_foundation'    => $c->is_foundation,
            'onetime_discount_percent' => $c->onetime_discount_percent,
            'pricing' => [
                'USD' => [
                    // Standalone
                    'standalone_group'       => $c->group_price_usd,
                    'standalone_one_on_one'  => $c->one_on_one_price_usd,
                    // Bundle (DF + this track)
                    'bundle_group'           => $c->bundle_group_usd,
                    'bundle_one_on_one'      => $c->bundle_one_on_one_usd,
                    // After one-time discount
                    'standalone_group_discounted'      => $c->getFinalPrice('group_mentorship', 'USD', 'onetime', false),
                    'standalone_one_on_one_discounted' => $c->getFinalPrice('one_on_one', 'USD', 'onetime', false),
                    'bundle_group_discounted'           => $c->getFinalPrice('group_mentorship', 'USD', 'onetime', true),
                    'bundle_one_on_one_discounted'      => $c->getFinalPrice('one_on_one', 'USD', 'onetime', true),
                    // Per-installment (no discount)
                    'installment_standalone_group'      => $c->getInstallmentAmount('group_mentorship', 'USD', false),
                    'installment_standalone_one_on_one' => $c->getInstallmentAmount('one_on_one', 'USD', false),
                    'installment_bundle_group'           => $c->getInstallmentAmount('group_mentorship', 'USD', true),
                    'installment_bundle_one_on_one'      => $c->getInstallmentAmount('one_on_one', 'USD', true),
                ],
                'NGN' => [
                    'standalone_group'       => $c->group_price_ngn,
                    'standalone_one_on_one'  => $c->one_on_one_price_ngn,
                    'bundle_group'           => $c->bundle_group_ngn,
                    'bundle_one_on_one'      => $c->bundle_one_on_one_ngn,
                    'standalone_group_discounted'      => $c->getFinalPrice('group_mentorship', 'NGN', 'onetime', false),
                    'standalone_one_on_one_discounted' => $c->getFinalPrice('one_on_one', 'NGN', 'onetime', false),
                    'bundle_group_discounted'           => $c->getFinalPrice('group_mentorship', 'NGN', 'onetime', true),
                    'bundle_one_on_one_discounted'      => $c->getFinalPrice('one_on_one', 'NGN', 'onetime', true),
                    'installment_standalone_group'      => $c->getInstallmentAmount('group_mentorship', 'NGN', false),
                    'installment_standalone_one_on_one' => $c->getInstallmentAmount('one_on_one', 'NGN', false),
                    'installment_bundle_group'           => $c->getInstallmentAmount('group_mentorship', 'NGN', true),
                    'installment_bundle_one_on_one'      => $c->getInstallmentAmount('one_on_one', 'NGN', true),
                ],
            ],
        ];
    }

    public function formatEnrollment(KidsEnrollment $enrollment): array
    {
        return [
            'id'                      => $enrollment->id,
            'resume_token'            => $enrollment->resume_token,
            'parent_name'             => $enrollment->parent_name,
            'parent_email'            => $enrollment->parent_email,
            'parent_phone'            => $enrollment->parent_phone,
            'student_name'            => $enrollment->student_name,
            'student_age'             => $enrollment->student_age,
            'session_type'            => $enrollment->session_type,
            'chosen_track'            => $enrollment->chosen_track,
            'enrollment_type'         => $enrollment->enrollment_type,
            'skipped_foundation'      => $enrollment->skipped_foundation,
            'payment_type'            => $enrollment->payment_type,
            'payment_status'          => $enrollment->payment_status,
            'currency'                => $enrollment->currency,
            'original_price'          => $enrollment->original_price,
            'discount_applied'        => $enrollment->discount_applied,
            'total_price'             => $enrollment->total_price,
            'amount_paid'             => $enrollment->amount_paid,
            'remaining_balance'       => $enrollment->remainingBalance(),
            'next_installment_amount' => $enrollment->nextInstallmentAmount(),
            'total_installments'      => $enrollment->total_installments,
            'installments_paid'       => $enrollment->installments_paid,
            'installments_remaining'  => $enrollment->installmentsRemaining(),
            'next_payment_due'        => $enrollment->next_payment_due?->toDateString(),
            'has_access'              => $enrollment->has_access,
            'enrolled_at'             => $enrollment->enrolled_at?->toDateString(),
            'course'                  => $enrollment->course ? [
                'id'              => $enrollment->course->id,
                'slug'            => $enrollment->course->slug,
                'name'            => $enrollment->course->name,
                'emoji'           => $enrollment->course->emoji,
                'color'           => $enrollment->course->color,
                'duration_months' => $enrollment->course->duration_months,
                'is_foundation'   => $enrollment->course->is_foundation,
            ] : null,
            'payments' => $enrollment->relationLoaded('installmentPayments')
                ? $enrollment->installmentPayments->map(fn($p) => [
                    'number'         => $p->installment_number,
                    'amount'         => $p->amount,
                    'currency'       => $p->currency,
                    'paid_at'        => $p->paid_at?->toDateTimeString(),
                    'transaction_id' => $p->transaction_id,
                    'gateway'        => $p->gateway,
                ])
                : [],
        ];
    }
}