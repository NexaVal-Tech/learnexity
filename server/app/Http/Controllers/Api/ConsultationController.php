<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\ConsultationSetting;
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
        $adminEmail = config('mail.admin_email', env('ADMIN_EMAIL', env('MAIL_FROM_ADDRESS')));
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
     */
    public function bookedSlots(Request $request)
    {
        $request->validate(['date' => 'required|date']);

        $slots = Consultation::where('preferred_date', $request->date)
            ->where('status', 'scheduled')
            ->pluck('preferred_time')
            ->values();

        return response()->json(['booked_slots' => $slots]);
    }
}