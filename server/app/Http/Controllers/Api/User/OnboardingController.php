<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\Scholarship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OnboardingController extends Controller
{
    /**
     * Drives the dashboard's "take the screening" modal. Recomputed fresh
     * on every call (not cached client-side) so it survives logout/login
     * and works no matter which device the person continues on.
     */
    public function status(): JsonResponse
    {
        $user = auth()->user();

        // Scholarship rule elsewhere in the app is "one per user, ever" —
        // so there is at most one row here.
        $scholarship     = Scholarship::where('user_id', $user->id)->first();
        $screeningStatus = $scholarship ? $scholarship->status : 'not_started';

        // Which course is this whole flow "about"? A scholarship is
        // permanently tied to exactly one course (full tuition only ever
        // applies to the course applied for), so once one exists it is the
        // source of truth — NOT user->intended_course_id, which is a more
        // volatile pointer that can drift or get cleared independently
        // (e.g. browsing other courses afterward, or clearIntendedCourse()
        // being called elsewhere). Relying only on intended_course_id here
        // meant an approved-scholarship user could see intended_course come
        // back null even though their scholarship clearly names a course —
        // and the frontend's "Proceed to Payment" button needs this field
        // to build the registration-fee enrollment, so it was silently
        // falling back to the courses list instead.
        $targetCourseId = $scholarship?->course_id ?? $user->intended_course_id;

        $intendedCourse       = null;
        $pendingEnrollmentId  = null;

        if ($targetCourseId) {
            $course = Course::where('course_id', $targetCourseId)->first();

            if ($course) {
                // Lets the frontend auto-enroll with the correct learning
                // track instead of hardcoding 'self_paced' — a deep-tech-only
                // course (mentorship tracks) would otherwise get enrolled at
                // the wrong price tier and skip the deep-tech screening
                // entirely (see CourseEnrollmentController::enroll()).
                $isDeepTech = (bool) ($course->offers_one_on_one || $course->offers_group_mentorship);

                $intendedCourse = [
                    'course_id'    => $course->course_id,
                    'title'        => $course->title,
                    'is_deep_tech' => $isDeepTech,
                ];

                $pendingEnrollment = CourseEnrollment::where('user_id', $user->id)
                    ->where('course_id', $course->course_id)
                    ->where('payment_status', '!=', 'completed')
                    ->latest()
                    ->first();

                $pendingEnrollmentId = $pendingEnrollment?->id;
            }
        }

        // Show the modal while onboarding is unfinished: either the person
        // hasn't taken the screening yet, or they were approved but haven't
        // redeemed it with a payment yet. Once rejected, or once redeemed,
        // we stop nagging them.
        $showModal = $screeningStatus === 'not_started'
            || ($screeningStatus === 'approved' && $scholarship && ! $scholarship->is_used);

        return response()->json([
            'show_modal'            => $showModal,
            'intended_course'       => $intendedCourse,
            'screening_status'      => $screeningStatus,
            'scholarship'           => $scholarship,
            'pending_enrollment_id' => $pendingEnrollmentId,
        ]);
    }

    /**
     * Persist which course the person wants to enroll in. Called right
     * after signup/login (from sessionStorage), and whenever an enrollment
     * is started — so it stays accurate no matter the entry point.
     */
    public function setIntendedCourse(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'course_id' => 'required|string|exists:courses,course_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        auth()->user()->update(['intended_course_id' => $request->course_id]);

        return response()->json(['message' => 'Saved', 'intended_course_id' => $request->course_id]);
    }

    public function clearIntendedCourse(): JsonResponse
    {
        auth()->user()->update(['intended_course_id' => null]);

        return response()->json(['message' => 'Cleared']);
    }
}