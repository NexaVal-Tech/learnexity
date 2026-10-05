<?php

namespace App\Services;

use App\Mail\ScholarshipResultMail;
use App\Models\CmsGlobal;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\Scholarship;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * What happens the moment a scholarship is awarded (auto-decision or an
 * admin review): prepare the student's pending enrollment priced at the
 * registration fee, then email them the award with a "Proceed to Payment"
 * link.
 *
 * Single-award model: every scholarship = pay only the registration fee
 * set in Course Settings. No percentages anywhere.
 *
 * Why the award email used to show "0.00": the old code always enrolled
 * the student on the self-paced track. For a Deep-Tech / Accelerator
 * course that's the wrong fee category (often not configured → the
 * enrollment call failed with "Registration fee is not configured") and,
 * from the admin screen, the currency came from the admin's IP instead of
 * the student's. The template then printed `number_format(null) = 0.00`.
 * Now the track is the one the course actually offers (or the student's
 * existing pending enrollment), the currency comes from the applicant's
 * own IP, the amount comes straight from PricingService, and the email
 * never prints an amount it doesn't have.
 */
class ScholarshipAwardService
{
    /** Message returned to the scholarship page after applying (editable in CMS → Scholarship). */
    public static function awardMessage(Course $course): string
    {
        $text = self::cmsText('awardMessage')
            ?: "Congratulations! You've been awarded a scholarship for {course}. You'll only pay the registration fee to secure your spot.";

        return str_replace('{course}', $course->title, $text);
    }

    public static function prepareAndNotify(User $user, Scholarship $scholarship, Course $course): void
    {
        $frontend   = rtrim((string) config('app.frontend_url'), '/');
        // Fallback still lands on the payment flow (never the course page):
        // /user/payment/start creates the enrollment and opens checkout.
        $paymentUrl = $frontend . '/user/payment/start?course=' . urlencode($course->course_id);
        $amountDue  = null;
        $currency   = LocationService::detectCurrency($scholarship->applicant_ip ?: null);

        if ($scholarship->status === 'approved') {
            try {
                [$enrollment, $amount] = self::prepareEnrollment($user, $course, $currency);
                if ($enrollment) {
                    $paymentUrl = $frontend . '/user/payment/' . $enrollment->id;
                    $currency   = $enrollment->currency ?: $currency;
                }
                $amountDue = $amount > 0 ? $amount : null;
            } catch (\Throwable $e) {
                Log::error('❌ [ScholarshipAward] Failed to prepare enrollment', [
                    'user_id' => $user->id, 'course_id' => $course->course_id, 'error' => $e->getMessage(),
                ]);
            }
        }

        try {
            Mail::to($user->email)->queue(
                new ScholarshipResultMail($user, $scholarship, $scholarship->status === 'approved', $paymentUrl, $amountDue, $currency)
            );
        } catch (\Throwable $e) {
            Log::error('❌ [ScholarshipAward] Failed to send award email', ['user_id' => $user->id, 'error' => $e->getMessage()]);
        }
    }

    /**
     * Create or re-price the pending enrollment at the registration fee.
     *
     * @return array{0: ?CourseEnrollment, 1: float}
     */
    public static function prepareEnrollment(User $user, Course $course, string $currency): array
    {
        $existing = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $course->course_id)
            ->first();

        if ($existing && $existing->payment_status === 'completed') {
            return [$existing, 0.0];
        }

        $track   = $existing?->learning_track ?: self::defaultTrack($course);
        $pricing = PricingService::calculate($user, $course, $currency, $track, 'onetime');
        $amount  = (float) $pricing['amount'];

        if ($amount <= 0) {
            // Never write a ₦0 / $0 price: leave things as they are so the
            // payment page shows "registration fee not configured" instead of
            // letting anyone check out for nothing. Admin: set the fee in
            // Course Settings → Registration fee for this category.
            Log::warning('⚠️ [ScholarshipAward] Registration fee is not set for this category/currency', [
                'course_id' => $course->course_id, 'track' => $track, 'currency' => $currency,
                'category'  => $pricing['fee_category'] ?? null,
            ]);
            return [$existing, 0.0];
        }

        $fields = [
            'learning_track'      => $track,
            'payment_type'        => $pricing['payment_type'],
            'currency'            => $currency,
            'total_amount'        => $amount,
            'installment_amount'  => $pricing['installment_amount'],
            'total_installments'  => $pricing['total_installments'],
            'scholarship_id'      => $pricing['scholarship']?->id,
            'is_registration_fee' => (bool) $pricing['is_registration_fee'],
        ];

        if ($existing) {
            $existing->update($fields);
            $enrollment = $existing->fresh();
        } else {
            $enrollment = CourseEnrollment::create($fields + [
                'user_id'           => $user->id,
                'course_id'         => $course->course_id,
                'course_name'       => $course->title,
                'amount_paid'       => 0,
                'installments_paid' => 0,
                'payment_status'    => 'pending',
                'has_access'        => false,
                'next_payment_due'  => null,
                'enrollment_date'   => now(),
            ]);
        }

        if ($user->intended_course_id !== $course->course_id) {
            $user->update(['intended_course_id' => $course->course_id]);
        }

        return [$enrollment, $amount];
    }

    /** The track a course is normally taken on (Deep-Tech first, then Accelerator, then self-paced). */
    public static function defaultTrack(Course $course): string
    {
        if ($course->offers_group_mentorship) return 'group_mentorship';
        if ($course->offers_one_on_one) return 'one_on_one';
        if ($course->offers_intermediate ?? false) return 'intermediate';
        return 'self_paced';
    }

    /** A text from the "Scholarship" CMS global, if the admin set one. */
    public static function cmsText(string $key): ?string
    {
        try {
            $data = CmsGlobal::where('key', 'scholarship')->first()?->data;
            $value = is_array($data) ? ($data[$key] ?? null) : null;
            return is_string($value) && trim($value) !== '' ? $value : null;
        } catch (\Throwable) {
            return null;
        }
    }
}
