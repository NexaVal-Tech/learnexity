<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\ConsultationSetting;
use App\Models\ConsultationFreeDay;
use App\Models\ConsultationAvailability;
use App\Services\LocationService;
use App\Mail\ConsultationBookedAdmin;
use App\Mail\ConsultationConfirmation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ConsultationController extends Controller
{
    /**
     * Book a new consultation.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name'         => 'required|string|max:255',
            'email'             => 'required|email|max:255',
            'phone'             => 'nullable|string|max:30',
            'consultation_type' => 'required|in:course_guidance,career_advice,technical_support,renewal,general',
            'course'            => 'nullable|string|max:255',
            'message'           => 'nullable|string|max:2000',
            'preferred_date'    => 'required|date|after_or_equal:today',
            'preferred_time'    => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Block weekends
        $date = Carbon::parse($request->preferred_date);
        if ($date->isWeekend()) {
            return response()->json(['message' => 'Consultations are only available Monday–Friday.'], 422);
        }

        // Check if slot is already taken
        $slotTaken = Consultation::where('preferred_date', $request->preferred_date)
            ->where('preferred_time', $request->preferred_time)
            ->whereIn('status', ['scheduled'])
            ->exists();

        if ($slotTaken) {
            return response()->json(['message' => 'This time slot is no longer available. Please choose another.'], 409);
        }

        $consultation = Consultation::create([
            'user_id'           => auth('api')->id(), // nullable, works for guests too
            'full_name'         => $request->full_name,
            'email'             => $request->email,
            'phone'             => $request->phone,
            'consultation_type' => $request->consultation_type,
            'course'            => $request->course,
            'message'           => $request->message,
            'preferred_date'    => $request->preferred_date,
            'preferred_time'    => $request->preferred_time,
            'status'            => 'scheduled',
            'payment_status'    => 'free',
        ]);

        // ── Send emails ────────────────────────────────────────────────────

        // 1. Confirmation to student
        try {
            Mail::to($consultation->email)->send(new ConsultationConfirmation($consultation));
        } catch (\Throwable $e) {
            Log::error('Consultation confirmation email failed: ' . $e->getMessage());
        }

        // 2. Notification to admin
        $adminEmail = env('ADMIN_NOTIFICATION_EMAIL', env('MAIL_FROM_ADDRESS'));
        try {
            Mail::to($adminEmail)->send(new ConsultationBookedAdmin($consultation));
        } catch (\Throwable $e) {
            Log::error('Consultation admin notification email failed: ' . $e->getMessage());
        }

        return response()->json([
            'message'      => 'Consultation booked successfully.',
            'consultation' => $consultation,
        ], 201);
    }

    public function getPricing(Request $request)
    {
        $settings = ConsultationSetting::current();
        $locationInfo = LocationService::getLocationInfo();
        $isNigeria = ($locationInfo['country_code'] ?? null) === 'NG';

        return response()->json([
            'currency'     => $isNigeria ? 'NGN' : 'USD',
            'amount'       => $isNigeria ? (float) $settings->price_ngn : (float) $settings->price_usd,
            'country_code' => $locationInfo['country_code'] ?? null,
        ]);
    }

    /**
     * Already-booked time slots for a given date — greys out taken
     * slots on the frontend calendar. Only 'scheduled' (i.e. paid)
     * consultations block a slot — pending_payment ones don't.
     *
     * On an admin-marked free day, bookings are unlimited — many people can
     * book the same (or different) time slots with no payment, so nothing
     * is ever reported as "taken" for that date.
     */
    public function bookedSlots(Request $request)
    {
        $request->validate([
            'date'   => 'required|date',
            'source' => 'nullable|in:learnexity,advisory',
        ]);

        $source = $request->source ?? 'learnexity';

        // Advisory bookings are always free and have their own slot
        // namespace (see ConsultationPaymentController::initiate) — they
        // don't participate in the main site's free-day promo mechanism.
        if ($source === 'advisory') {
            $slots = Consultation::where('preferred_date', $request->date)
                ->where('source', 'advisory')
                ->where('status', 'scheduled')
                ->pluck('preferred_time')
                ->values();

            return response()->json(['booked_slots' => $slots, 'is_free_day' => false]);
        }

        if (ConsultationFreeDay::isFreeDay($request->date)) {
            return response()->json(['booked_slots' => [], 'is_free_day' => true]);
        }

        $slots = Consultation::where('preferred_date', $request->date)
            ->where('status', 'scheduled')
            ->where('source', 'learnexity')
            ->pluck('preferred_time')
            ->values();

        return response()->json(['booked_slots' => $slots, 'is_free_day' => false]);
    }

    /**
     * Public list of admin-marked free consultation days (ISO date
     * strings) — the booking wizard uses this to know when to skip
     * payment and slot limits entirely.
     */
    public function freeDays()
    {
        // pluck() operates on the raw query builder (bypasses Eloquent casts),
        // so these come back as plain "Y-m-d" strings already.
        $dates = ConsultationFreeDay::orderBy('date')->pluck('date')->values();

        return response()->json(['free_days' => $dates]);
    }

    /**
     * Human-readable booking schedule for a source — the recurring weekly
     * window(s) plus any upcoming one-off dates admin has configured via
     * AdminConsultationController::addAvailability(). Both the main-site
     * /consultation page and the advisory booking widget call this to show
     * visitors exactly when they can book, before they open the calendar.
     * Falls back to the historical Mon–Fri, 9:00 AM–4:30 PM description
     * when no admin availability has been configured yet.
     */
    public function schedule(Request $request)
    {
        $request->validate(['source' => 'nullable|in:learnexity,advisory']);

        return response()->json(
            ConsultationAvailability::summaryForSource($request->source)
        );
    }

    /**
     * Bookable time slots for one calendar date + source — combines the
     * admin-configured availability window (or the legacy Mon–Fri default
     * if none is configured) with already-booked slots and the free-day /
     * weekend rules already enforced elsewhere in this controller and in
     * ConsultationPaymentController.
     */
    public function availableSlots(Request $request)
    {
        $request->validate([
            'date'   => 'required|date',
            'source' => 'nullable|in:learnexity,advisory',
        ]);

        $source = $request->source ?? 'learnexity';
        $window = ConsultationAvailability::windowForDate($request->date, $source);

        if (!$window) {
            return response()->json(['available' => false, 'slots' => [], 'is_free_day' => false]);
        }

        $isFreeDay = $source === 'learnexity' && ConsultationFreeDay::isFreeDay($request->date);

        $slots = ConsultationAvailability::generateSlots(
            $window['start_time'],
            $window['end_time'],
            $window['slot_interval_minutes']
        );

        if (!$isFreeDay) {
            // Mirrors bookedSlots() above exactly, per-source, so the two
            // endpoints never disagree about what's taken.
            $booked = Consultation::where('preferred_date', $request->date)
                ->where('status', 'scheduled')
                ->where('source', $source)
                ->pluck('preferred_time')
                ->all();

            $slots = array_values(array_diff($slots, $booked));
        }

        return response()->json(['available' => true, 'slots' => $slots, 'is_free_day' => $isFreeDay]);
    }
}