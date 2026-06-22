<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\ConsultationSetting;
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
            'total'     => Consultation::count(),
            'scheduled' => Consultation::where('status', 'scheduled')->count(),
            'completed' => Consultation::where('status', 'completed')->count(),
            'cancelled' => Consultation::where('status', 'cancelled')->count(),
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
}