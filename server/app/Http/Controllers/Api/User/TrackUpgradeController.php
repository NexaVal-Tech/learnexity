<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\UserActivityLog;
use App\Services\LocationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class TrackUpgradeController extends Controller
{
    const TRACK_HIERARCHY = [
        'self_paced'       => 1,
        'group_mentorship' => 2,
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/courses/{courseId}/upgrade/options
    // ─────────────────────────────────────────────────────────────────────────
    public function getUpgradeOptions(Request $request, $courseId)
    {
        $user = auth()->user();

        $enrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->where('payment_status', 'completed')
            ->first();

        if (!$enrollment) {
            UserActivityLog::record($user->id, 'upgrade_options_checked', 'course', null, [
                'course_id' => $courseId,
                'result'    => 'no_active_enrollment',
            ]);

            return response()->json([
                'message'     => 'No active enrollment found for this course.',
                'can_upgrade' => false,
            ], 404);
        }

        $currentTrack = $enrollment->learning_track;
        $course       = Course::where('course_id', $courseId)->firstOrFail();
        $currency     = LocationService::detectCurrency();

        $options = $this->buildUpgradeOptions($enrollment, $course, $currency, $currentTrack);

        UserActivityLog::record($user->id, 'upgrade_options_checked', 'enrollment', $enrollment->id, [
            'course_id'     => $courseId,
            'current_track' => $currentTrack,
            'currency'      => $currency,
            'options_count' => count($options),
        ]);

        return response()->json([
            'current_track' => $currentTrack,
            'currency'      => $currency,
            'can_upgrade'   => count($options) > 0,
            'options'       => $options,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/courses/{courseId}/upgrade/initiate
    // Returns the charge amount so the frontend can open Paystack/Stripe.
    // Nothing is written to the enrollment yet — that happens in finalise.
    // ─────────────────────────────────────────────────────────────────────────
    public function initiateUpgrade(Request $request, $courseId)
    {
        Log::info('🔍 initiateUpgrade raw input', [
            'all'         => $request->all(),
            'content_type'=> $request->header('Content-Type'),
            'body'        => $request->getContent(),
        ]);

        $validator = Validator::make($request->all(), [
            'target_track' => 'required|in:self_paced,group_mentorship,one_on_one',
            'payment_type' => 'required|in:onetime,installment',
            'hours'        => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user        = auth()->user();
        $targetTrack = $request->input('target_track');
        $paymentType = $request->input('payment_type');
        $hours       = $request->input('hours', 1);

        $enrollment = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->where('payment_status', 'completed')
            ->first();

        if (!$enrollment) {
            return response()->json(['message' => 'No active enrollment found.'], 404);
        }

        $currentTrack = $enrollment->learning_track;
        $course       = Course::where('course_id', $courseId)->firstOrFail();
        $currency     = LocationService::detectCurrency();

        $validation = $this->validateUpgradePath($currentTrack, $targetTrack);
        if (!$validation['valid']) {
            return response()->json(['message' => $validation['message']], 422);
        }

        $upgradeType  = ($targetTrack === 'one_on_one') ? 'addon' : 'track_upgrade';
        $chargeAmount = $this->calculateChargeAmount(
            $enrollment, $course, $currency,
            $currentTrack, $targetTrack,
            $paymentType, $hours
        );

        if ($chargeAmount <= 0) {
            return response()->json(['message' => 'Invalid upgrade amount calculated.'], 422);
        }

        UserActivityLog::record($user->id, 'upgrade_initiated', 'enrollment', $enrollment->id, [
            'course_id'      => $courseId,
            'from_track'     => $currentTrack,
            'to_track'       => $targetTrack,
            'upgrade_type'   => $upgradeType,
            'charge_amount'  => $chargeAmount,
            'currency'       => $currency,
            'payment_type'   => $paymentType,
            'hours'          => $upgradeType === 'addon' ? $hours : null,
        ]);

        return response()->json([
            'enrollment_id' => $enrollment->id,
            'upgrade_type'  => $upgradeType,
            'from_track'    => $currentTrack,
            'to_track'      => $targetTrack,
            'charge_amount' => $chargeAmount,
            'currency'      => $currency,
            'hours'         => $upgradeType === 'addon' ? $hours : null,
            'payment_type'  => $paymentType,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/enrollments/{enrollmentId}/finalise-upgrade
    // Called after payment is confirmed (Paystack callback / Stripe webhook).
    // Directly updates the enrollment — no temp columns needed.
    // ─────────────────────────────────────────────────────────────────────────
    public function finaliseUpgrade(Request $request, $enrollmentId)
    {
        $validator = Validator::make($request->all(), [
            'transaction_id' => 'required|string',
            'target_track'   => 'required|in:self_paced,group_mentorship,one_on_one',
            'upgrade_type'   => 'required|in:track_upgrade,addon',
            'amount_paid'    => 'required|numeric|min:0',
            'currency'       => 'required|string',
            'hours'          => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user       = auth()->user();
        $enrollment = CourseEnrollment::where('id', $enrollmentId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $previousTrack = $enrollment->learning_track;
        $upgradeType   = $request->input('upgrade_type');
        $targetTrack   = $request->input('target_track');
        $amountPaid    = $request->input('amount_paid');
        $currency      = $request->input('currency');
        $hours         = $request->input('hours', 1);

        DB::transaction(function () use (
            $enrollment, $upgradeType, $targetTrack,
            $amountPaid, $currency, $hours, $request, $user, $previousTrack
        ) {
            if ($upgradeType === 'track_upgrade') {
                $enrollment->update([
                    'learning_track' => $targetTrack,
                    'transaction_id' => $request->input('transaction_id'),
                    'total_amount'   => $enrollment->total_amount + $amountPaid,  // plain float
                    'amount_paid'    => $enrollment->amount_paid + $amountPaid,   // plain float
                ]);

                UserActivityLog::record($user->id, 'track_upgraded', 'enrollment', $enrollment->id, [
                    'from_track'     => $previousTrack,
                    'to_track'       => $targetTrack,
                    'amount_paid'    => $amountPaid,
                    'currency'       => $currency,
                    'transaction_id' => $request->input('transaction_id'),
                ]);

                Log::info('🎓 Track upgraded', [
                    'enrollment_id' => $enrollment->id,
                    'from'          => $previousTrack,
                    'to'            => $targetTrack,
                    'amount'        => $amountPaid,
                ]);
            } else {
                // ── Log one-on-one hours without changing the track ───────
                DB::table('one_on_one_bookings')->insert([
                    'enrollment_id'  => $enrollment->id,
                    'user_id'        => $enrollment->user_id,
                    'course_id'      => $enrollment->course_id,
                    'hours_booked'   => $hours,
                    'amount_paid'    => $amountPaid,
                    'currency'       => $currency,
                    'transaction_id' => $request->input('transaction_id'),
                    'booked_at'      => now(),
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);

                UserActivityLog::record($user->id, 'one_on_one_booked', 'enrollment', $enrollment->id, [
                    'hours'          => $hours,
                    'amount_paid'    => $amountPaid,
                    'currency'       => $currency,
                    'transaction_id' => $request->input('transaction_id'),
                    'current_track'  => $previousTrack,
                ]);

                Log::info('📅 One-on-one hours booked', [
                    'enrollment_id' => $enrollment->id,
                    'hours'         => $hours,
                    'amount'        => $amountPaid,
                ]);
            }
        });

        return response()->json([
            'message'      => $upgradeType === 'track_upgrade'
                ? 'Track upgraded successfully.'
                : 'One-on-one hours booked successfully.',
            'enrollment'   => $enrollment->fresh(),
            'upgrade_type' => $upgradeType,
            'new_track'    => $enrollment->fresh()->learning_track,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function buildUpgradeOptions(
        CourseEnrollment $enrollment,
        Course $course,
        string $currency,
        string $currentTrack
    ): array {
        $options = [];

        if ($currentTrack === 'self_paced' && $course->offers_group_mentorship) {
            $groupPrice = $course->getTrackPriceByCurrency('group_mentorship', $currency);
            $selfPrice  = $course->getTrackPriceByCurrency('self_paced', $currency);
            $diff       = max(0, $groupPrice - $selfPrice);

            $options[] = [
                'type'             => 'track_upgrade',
                'target_track'     => 'group_mentorship',
                'label'            => 'Upgrade to Group Mentorship / Live Class',
                'description'      => 'Join live sessions and group mentorship. Your progress carries over.',
                'charge_amount'    => $diff,
                'currency'         => $currency,
                'payment_options'  => ['onetime', 'installment'],
            ];
        }

        // One-on-one is always an hourly add-on regardless of current track
        if ($course->offers_one_on_one) {
            $hourlyRate = $currency === 'NGN'
                ? ($course->one_on_one_hourly_rate_ngn ?? $course->one_on_one_hourly_rate_usd ?? null)
                : ($course->one_on_one_hourly_rate_usd ?? null);

            if ($hourlyRate && $hourlyRate > 0) {
                $options[] = [
                    'type'            => 'addon',
                    'target_track'    => 'one_on_one',
                    'label'           => 'Book One-on-One Hours',
                    'description'     => 'Private coaching billed per hour. Your current track stays unchanged.',
                    'hourly_rate'     => $hourlyRate,
                    'currency'        => $currency,
                    'payment_options' => ['onetime'],
                ];
            }
        }

        return $options;
    }

    private function validateUpgradePath(string $from, string $to): array
    {
        if ($to === 'one_on_one') {
            return ['valid' => true, 'message' => ''];
        }

        $h = self::TRACK_HIERARCHY;

        if (!isset($h[$from], $h[$to])) {
            return ['valid' => false, 'message' => 'Invalid track specified.'];
        }

        if ($h[$to] <= $h[$from]) {
            return ['valid' => false, 'message' => 'You can only upgrade to a higher track.'];
        }

        return ['valid' => true, 'message' => ''];
    }

    private function calculateChargeAmount(
        CourseEnrollment $enrollment,
        Course $course,
        string $currency,
        string $fromTrack,
        string $toTrack,
        string $paymentType,
        int $hours
    ): float {
        if ($toTrack === 'one_on_one') {
            $rate = $currency === 'NGN'
                ? ($course->one_on_one_hourly_rate_ngn ?? $course->one_on_one_hourly_rate_usd ?? 0)
                : ($course->one_on_one_hourly_rate_usd ?? 0);
            return round($rate * $hours, 2);
        }

        $fromPrice = $course->getTrackPriceByCurrency($fromTrack, $currency);
        $toPrice   = $course->getTrackPriceByCurrency($toTrack, $currency);
        $diff      = max(0, $toPrice - $fromPrice);

        return $paymentType === 'installment'
            ? round($diff / 4, 2)
            : round($diff, 2);
    }
}