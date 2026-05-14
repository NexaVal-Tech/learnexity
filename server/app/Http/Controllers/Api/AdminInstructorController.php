<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instructor;
use App\Models\Course;
use App\Mail\InstructorWelcomeMail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AdminInstructorController extends Controller
{
    /**
     * GET /api/admin/instructors
     * List all instructors with their assigned courses.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Instructor::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $instructors = $query->latest()->paginate($request->per_page ?? 20);

        // Attach assigned course IDs to each instructor
        $instructors->getCollection()->transform(function (Instructor $instructor) {
            $instructor->assigned_course_ids = DB::table('instructor_courses')
                ->where('instructor_id', $instructor->id)
                ->pluck('course_id');
            return $instructor;
        });

        return response()->json($instructors);
    }

    /**
     * POST /api/admin/instructors
     * Create a new instructor and send welcome email with credentials.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name'           => 'required|string|max:255',
            'email'          => 'required|email|unique:instructors,email',
            'phone'          => 'nullable|string|max:20',
            'bio'            => 'nullable|string|max:500',
            'specialisation' => 'nullable|string|max:255',
            'course_ids'     => 'nullable|array',
            'course_ids.*'   => 'string',   // course_id strings
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Generate a random password
        $plainPassword = Str::random(10);

        $instructor = Instructor::create([
            'name'           => $request->name,
            'email'          => $request->email,
            'password'       => Hash::make($plainPassword),
            'phone'          => $request->phone,
            'bio'            => $request->bio,
            'specialisation' => $request->specialisation,
            'is_active'      => true,
        ]);

        // Assign courses if provided
        if ($request->filled('course_ids')) {
            $rows = collect($request->course_ids)->map(fn ($cid) => [
                'instructor_id' => $instructor->id,
                'course_id'     => $cid,
                'created_at'    => now(),
                'updated_at'    => now(),
            ])->toArray();

            DB::table('instructor_courses')->insert($rows);
        }

        // Send welcome email with credentials
        $emailSent = false;
        try {
            Mail::to($instructor->email)->send(new InstructorWelcomeMail($instructor, $plainPassword));
            $emailSent = true;
            Log::info('✅ Instructor welcome email sent', ['instructor_id' => $instructor->id]);
        } catch (\Exception $e) {
            Log::error('❌ Failed to send instructor welcome email', [
                'instructor_id' => $instructor->id,
                'error'         => $e->getMessage(),
            ]);
        }

        return response()->json([
            'success'    => true,
            'message'    => $emailSent
                ? 'Instructor created and login credentials sent to their email.'
                : 'Instructor created. Note: welcome email could not be sent — please share login credentials manually.',
            'instructor' => $instructor,
            'email_sent' => $emailSent,
        ], 201);
    }

    /**
     * GET /api/admin/instructors/{id}
     */
    public function show(int $id): JsonResponse
    {
        $instructor = Instructor::findOrFail($id);
        $instructor->assigned_course_ids = DB::table('instructor_courses')
            ->where('instructor_id', $instructor->id)
            ->pluck('course_id');

        return response()->json(['success' => true, 'instructor' => $instructor]);
    }

    /**
     * PUT /api/admin/instructors/{id}
     * Update instructor info and course assignments.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $instructor = Instructor::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name'           => 'nullable|string|max:255',
            'phone'          => 'nullable|string|max:20',
            'bio'            => 'nullable|string|max:500',
            'specialisation' => 'nullable|string|max:255',
            'is_active'      => 'nullable|boolean',
            'course_ids'     => 'nullable|array',
            'course_ids.*'   => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $instructor->update(array_filter([
            'name'           => $request->name,
            'phone'          => $request->phone,
            'bio'            => $request->bio,
            'specialisation' => $request->specialisation,
            'is_active'      => $request->is_active,
        ], fn ($v) => !is_null($v)));

        // Re-sync course assignments
        if ($request->has('course_ids')) {
            DB::table('instructor_courses')->where('instructor_id', $instructor->id)->delete();
            if (!empty($request->course_ids)) {
                $rows = collect($request->course_ids)->map(fn ($cid) => [
                    'instructor_id' => $instructor->id,
                    'course_id'     => $cid,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ])->toArray();
                DB::table('instructor_courses')->insert($rows);
            }
        }

        return response()->json(['success' => true, 'message' => 'Instructor updated', 'instructor' => $instructor->fresh()]);
    }

    /**
     * DELETE /api/admin/instructors/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $instructor = Instructor::findOrFail($id);
        DB::table('instructor_courses')->where('instructor_id', $instructor->id)->delete();
        $instructor->delete();

        return response()->json(['success' => true, 'message' => 'Instructor deleted']);
    }

    /**
     * POST /api/admin/instructors/{id}/reset-password
     * Generate a new password and email it to the instructor.
     */
    public function resetPassword(int $id): JsonResponse
    {
        $instructor = Instructor::findOrFail($id);
        $newPassword = Str::random(10);
        $instructor->update(['password' => Hash::make($newPassword)]);

        try {
            Mail::to($instructor->email)->send(new InstructorWelcomeMail($instructor, $newPassword, isReset: true));
        } catch (\Exception $e) {
            Log::error('Failed to send instructor password reset email', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Password reset but email delivery failed. New password: ' . $newPassword,
            ]);
        }

        return response()->json(['success' => true, 'message' => 'New password sent to instructor email.']);
    }
}