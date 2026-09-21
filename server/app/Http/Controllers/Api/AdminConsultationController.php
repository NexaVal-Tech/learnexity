<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\ConsultationSetting;
use App\Models\ConsultationFreeDay;
use App\Models\ConsultationAvailability;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminConsultationController extends Controller
{
    /**
     * List consultations with filters + pagination.
     */
    public function index(Request $request)
    {
        $query = Consultation::query()->latest();

        // Search: name, email, course
        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('course', 'like', "%{$search}%");
            });
        }

        if ($request->consultation_type) {
            $query->where('consultation_type', $request->consultation_type);
        }

        if ($request->source) {
            $query->where('source', $request->source);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->payment_status) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->course) {
            $query->where('course', $request->course);
        }

        if ($request->date_from) {
            $query->whereDate('preferred_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('preferred_date', '<=', $request->date_to);
        }

        $perPage = (int) $request->get('per_page', 15);
        $results = $query->paginate($perPage);

        return response()->json([
            'data' => $results->items(),
            'meta' => [
                'current_page' => $results->currentPage(),
                'last_page'    => $results->lastPage(),
                'total'        => $results->total(),
                'per_page'     => $results->perPage(),
            ],
        ]);
    }

    /**
     * Aggregate stats for the stats cards.
     */
    public function stats()
    {
        return response()->json([
            'total'            => Consultation::count(),
            'scheduled'        => Consultation::where('status', 'scheduled')->count(),
            'completed'        => Consultation::where('status', 'completed')->count(),
            'cancelled'        => Consultation::where('status', 'cancelled')->count(),
            'advisory_total'   => Consultation::where('source', 'advisory')->count(),
            'advisory_pending' => Consultation::where('source', 'advisory')->where('status', 'scheduled')->count(),
        ]);
    }

    /**
     * Show a single consultation.
     */
    public function show($id)
    {
        $consultation = Consultation::findOrFail($id);
        return response()->json($consultation);
    }

    /**
     * Update status and/or admin notes.
     */
    public function update(Request $request, $id)
    {
        $consultation = Consultation::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:scheduled,completed,cancelled,no_show',
            'notes'  => 'nullable|string|max:5000',
            'payment_status' => 'sometimes|in:free,paid,pending',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed.', 'errors' => $validator->errors()], 422);
        }

        $consultation->update($request->only(['status', 'notes', 'payment_status']));

        return response()->json([
            'message'      => 'Consultation updated.',
            'consultation' => $consultation->fresh(),
        ]);
    }

    /**
     * Delete a consultation record.
     */
    public function destroy($id)
    {
        $consultation = Consultation::findOrFail($id);
        $consultation->delete();

        return response()->json(['message' => 'Consultation deleted.']);
    }

    public function getSettings()
    {
        $settings = ConsultationSetting::current();
        return response()->json([
            'price_usd' => (float) $settings->price_usd,
            'price_ngn' => (float) $settings->price_ngn,
        ]);
    }

    public function updateSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'price_usd' => 'required|numeric|min:0',
            'price_ngn' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed.', 'errors' => $validator->errors()], 422);
        }

        $settings = ConsultationSetting::current();
        $settings->update($request->only(['price_usd', 'price_ngn']));

        return response()->json(['message' => 'Pricing updated.', 'settings' => $settings->fresh()]);
    }

    /**
     * Free consultation days — on these dates, anyone can book a
     * consultation with no payment and no per-slot limit (see
     * ConsultationPaymentController::initiate() and
     * ConsultationController::bookedSlots()).
     */
    public function getFreeDays()
    {
        return response()->json([
            'free_days' => ConsultationFreeDay::orderBy('date')->get(['id', 'date', 'note']),
        ]);
    }

    public function addFreeDay(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date|after_or_equal:today',
            'note' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed.', 'errors' => $validator->errors()], 422);
        }

        $freeDay = ConsultationFreeDay::firstOrCreate(
            ['date' => $request->date],
            ['note' => $request->note]
        );

        return response()->json([
            'message'  => 'Free day added.',
            'free_day' => $freeDay,
        ], 201);
    }

    public function removeFreeDay($id)
    {
        $freeDay = ConsultationFreeDay::findOrFail($id);
        $freeDay->delete();

        return response()->json(['message' => 'Free day removed.']);
    }

    /**
     * Booking availability windows — when admin can be booked, per source
     * (learnexity / advisory / both), either recurring every week on a
     * given weekday or as a one-off specific date. Consumed publicly via
     * ConsultationController::schedule() / availableSlots() and shown on
     * both the main-site /consultation page and the advisory booking widget.
     */
    public function getAvailability(Request $request)
    {
        $query = ConsultationAvailability::query()->orderBy('is_recurring', 'desc')->orderBy('weekday')->orderBy('specific_date');

        if ($request->source) {
            $query->where(function ($q) use ($request) {
                $q->where('source', $request->source)->orWhereNull('source');
            });
        }

        return response()->json(['availability' => $query->get()]);
    }

    public function addAvailability(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'source'                 => 'nullable|in:learnexity,advisory',
            'is_recurring'           => 'required|boolean',
            'weekday'                => 'required_if:is_recurring,1|nullable|integer|min:0|max:6',
            'specific_date'          => 'required_if:is_recurring,0|nullable|date|after_or_equal:today',
            'start_time'             => 'required|date_format:H:i',
            'end_time'               => 'required|date_format:H:i|after:start_time',
            'slot_interval_minutes'  => 'nullable|integer|min:5|max:240',
            'label'                  => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed.', 'errors' => $validator->errors()], 422);
        }

        $availability = ConsultationAvailability::create([
            'source'                => $request->source,
            'is_recurring'          => (bool) $request->is_recurring,
            'weekday'               => $request->is_recurring ? $request->weekday : null,
            'specific_date'         => $request->is_recurring ? null : $request->specific_date,
            'start_time'            => $request->start_time,
            'end_time'              => $request->end_time,
            'slot_interval_minutes' => $request->slot_interval_minutes ?? 30,
            'is_active'             => true,
            'label'                 => $request->label,
        ]);

        return response()->json(['message' => 'Availability window added.', 'availability' => $availability], 201);
    }

    public function updateAvailability(Request $request, $id)
    {
        $availability = ConsultationAvailability::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'is_active' => 'sometimes|boolean',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time'   => 'sometimes|date_format:H:i|after:start_time',
            'slot_interval_minutes' => 'sometimes|integer|min:5|max:240',
            'label' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed.', 'errors' => $validator->errors()], 422);
        }

        $availability->update($request->only(['is_active', 'start_time', 'end_time', 'slot_interval_minutes', 'label']));

        return response()->json(['message' => 'Availability window updated.', 'availability' => $availability->fresh()]);
    }

    public function removeAvailability($id)
    {
        $availability = ConsultationAvailability::findOrFail($id);
        $availability->delete();

        return response()->json(['message' => 'Availability window removed.']);
    }
}