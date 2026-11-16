<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Mail\ScholarshipApplicationAdminMail;
use App\Models\Course;
use App\Models\Scholarship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

/**
 * Scholarship applications — MANUALLY reviewed.
 *
 *  - Applying saves the application as "pending" and emails the admin team.
 *    Nothing is awarded automatically.
 *  - An admin approves (student gets the award email + registration-fee
 *    payment link, see ScholarshipAwardService) or rejects (student gets a
 *    "not successful this time" email and may apply again).
 *  - A student can have only ONE open application at a time (pending, or
 *    approved and not yet used). A rejected or revoked one doesn't block a
 *    new application.
 *  - Every question is required; the two written answers (why us /
 *    long-term goal) need at least MIN_WORDS words each.
 */
class ScholarshipController extends Controller
{
    public const MIN_WORDS = 30;
    public const MAX_CHARS = 4000;
    public const WHATSAPP_URL = 'https://wa.me/12762528415';

    /** The application that currently blocks a new one, if any. */
    private function openApplication(int $userId): ?Scholarship
    {
        return Scholarship::where('user_id', $userId)
            ->where(function ($q) {
                $q->where('status', 'pending')
                  ->orWhere(fn ($q2) => $q2->where('status', 'approved')->where('is_used', false));
            })
            ->orderByDesc('id')
            ->first();
    }

    public function checkEligibility(Request $request, string $courseId): JsonResponse
    {
        $user = auth()->user();
        $course = Course::where('course_id', $courseId)->first();
        if (! $course) {
            return response()->json(['eligible' => false, 'reason' => 'course_not_found'], 404);
        }

        $open = $this->openApplication($user->id);
        if ($open) {
            return response()->json([
                'eligible'             => false,
                'reason'               => 'already_applied',
                'course_name'          => $course->title,
                'existing_application' => $open->course_id === $courseId ? $open : null,
                'open_course_name'     => $open->course_name,
                'open_course_id'       => $open->course_id,
            ]);
        }

        // Already used a scholarship on THIS course (can't take it twice).
        $usedHere = Scholarship::where('user_id', $user->id)->where('course_id', $courseId)->where('is_used', true)->exists();
        if ($usedHere) {
            return response()->json(['eligible' => false, 'reason' => 'scholarship_already_used']);
        }

        $last = Scholarship::where('user_id', $user->id)->where('course_id', $courseId)->orderByDesc('id')->first();

        return response()->json([
            'detected_location' => $this->detectedLocation($request),
            'eligible'        => true,
            'course_name'     => $course->title,
            'pathway'         => ($course->offers_group_mentorship || $course->offers_one_on_one) ? 'deeptech' : (($course->offers_intermediate ?? false) ? 'accelerator' : 'flex'),
            'min_words'       => self::MIN_WORDS,
            'previous_status' => $last?->status, // e.g. "rejected" → reapplying
        ]);
    }

    public function apply(Request $request, string $courseId): JsonResponse
    {
        $user = auth()->user();
        $course = Course::where('course_id', $courseId)->first();
        if (! $course) {
            return response()->json(['message' => 'This course could not be found.'], 404);
        }

        $open = $this->openApplication($user->id);
        if ($open) {
            return response()->json([
                'message'     => $open->status === 'pending'
                    ? 'You already have a scholarship application under review. Please wait for our response by email.'
                    : 'You already have an approved scholarship. Use it before applying again.',
                'scholarship' => $open->course_id === $courseId ? $open : null,
            ], 409);
        }

        if (Scholarship::where('user_id', $user->id)->where('course_id', $courseId)->where('is_used', true)->exists()) {
            return response()->json(['message' => 'You have already used a scholarship on this course.'], 409);
        }

        $validator = Validator::make($request->all(), [
            'weekly_hours'   => 'required|in:1_3,4_6,7_10,10_plus',
            'is_student'     => 'required|in:yes,no',
            'is_employed'    => 'required|in:yes,no',
            'salary_range'   => 'required_if:is_employed,yes|nullable|in:under_100,100_200,above_200,not_employed',
            'country'        => 'nullable|string|max:100',
            'current_location' => 'required|string|max:120',
            'why_scholarship' => 'required|string|max:' . self::MAX_CHARS,
            'long_term_goal'  => 'required|string|max:' . self::MAX_CHARS,
        ], [
            'why_scholarship.required' => 'Please tell us why we should give you the scholarship.',
            'long_term_goal.required'  => 'Please tell us your long-term goal after graduation.',
            'current_location.required' => 'Please tell us your current location.',
            'weekly_hours.required'    => 'Please tell us how many hours per week you can dedicate.',
            'is_student.required'      => 'Please tell us whether you are a student.',
            'is_employed.required'     => 'Please tell us whether you are employed.',
            'salary_range.required_if' => 'Please choose your monthly income range.',
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => 'Please check your answers.', 'errors' => $validator->errors()], 422);
        }

        $why  = $this->cleanText((string) $request->input('why_scholarship'));
        $goal = $this->cleanText((string) $request->input('long_term_goal'));
        $errors = [];
        if ($this->words($why) < self::MIN_WORDS) {
            $errors['why_scholarship'] = ['Please write at least ' . self::MIN_WORDS . ' words about why we should give you the scholarship.'];
        }
        if ($this->words($goal) < self::MIN_WORDS) {
            $errors['long_term_goal'] = ['Please write at least ' . self::MIN_WORDS . ' words about your long-term goal.'];
        }
        if ($errors) {
            return response()->json(['message' => 'Please write a little more.', 'errors' => $errors], 422);
        }

        $location = mb_substr($this->cleanText((string) $request->input('current_location', ''), false), 0, 120);
        if ($location === '') {
            return response()->json(['message' => 'Please tell us your current location.', 'errors' => ['current_location' => ['Please tell us your current location.']]], 422);
        }
        $detected = $this->detectedLocation($request);
        // Country part of "City, Country" (or the whole value) for the admin list.
        $parts = array_map('trim', explode(',', $location));
        $country = mb_substr((string) end($parts), 0, 100);
        $answers = array_filter([
            'weekly_hours'    => $request->input('weekly_hours'),
            'is_student'      => $request->input('is_student'),
            'is_employed'     => $request->input('is_employed'),
            'salary_range'    => $request->input('is_employed') === 'yes' ? $request->input('salary_range') : 'not_employed',
            'current_location'  => $location,
            'detected_location' => $detected ? trim(($detected['city'] ? $detected['city'] . ', ' : '') . $detected['country']) : null,
            'why_scholarship' => $why,
            'long_term_goal'  => $goal,
        ], fn ($v) => $v !== null && $v !== '');

        $fields = [
            'course_name'         => $course->title,
            'status'              => 'pending',
            'score'               => 0,
            'location_bonus'      => 0,
            'total_score'         => 0,
            'discount_percentage' => 100,
            'answers'             => $answers,
            'review_notes'        => null,
            'applicant_country'   => $country ?: null,
            'applicant_ip'        => $request->ip(),
            'approved_at'         => null,
            'is_used'             => false,
            'reminders_sent'      => null,
        ];

        // One row per user+course (database rule): reapplying after a
        // rejection / revoke re-opens that row as a fresh application.
        $scholarship = Scholarship::where('user_id', $user->id)->where('course_id', $courseId)->first();
        if ($scholarship) {
            $scholarship->update($fields);
            $scholarship->touch();
        } else {
            $scholarship = Scholarship::create($fields + ['user_id' => $user->id, 'course_id' => $courseId]);
        }

        if ($user->intended_course_id !== $courseId) {
            $user->update(['intended_course_id' => $courseId]);
        }

        // Tell the team there's an application to review.
        try {
            $to = config('app.admin_notification_email');
            if ($to && filter_var($to, FILTER_VALIDATE_EMAIL)) {
                Mail::to($to)->queue((new ScholarshipApplicationAdminMail($user, $scholarship->fresh()))->onQueue('emails'));
            }
        } catch (\Throwable $e) {
            Log::error('Scholarship admin notification failed: ' . $e->getMessage());
        }

        Log::info('Scholarship application received (awaiting review)', ['user_id' => $user->id, 'course_id' => $courseId, 'scholarship_id' => $scholarship->id]);

        return response()->json([
            'message'      => 'Your scholarship application has been received. Our team will review it and email you a response.',
            'scholarship'  => $scholarship->fresh(),
            'whatsapp_url' => self::WHATSAPP_URL,
        ], 201);
    }

    /** The latest application for a course (payment page / course page badge). */
    public function getForCourse(string $courseId): JsonResponse
    {
        $scholarship = Scholarship::where('user_id', auth()->id())
            ->where('course_id', $courseId)
            ->orderByDesc('id')
            ->first();

        return response()->json(['scholarship' => $scholarship]);
    }

    public function myApplications(): JsonResponse
    {
        $scholarships = Scholarship::where('user_id', auth()->id())->orderByDesc('updated_at')->get();
        return response()->json(['scholarships' => $scholarships]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /** Plain text only: tags + control characters removed. */
    private function cleanText(string $v, bool $keepNewlines = true): string
    {
        $v = str_replace(["\r\n", "\r"], "\n", $v);
        $v = strip_tags($v);
        $v = preg_replace('/[\x{0000}-\x{0008}\x{000B}\x{000C}\x{000E}-\x{001F}\x{007F}\x{202A}-\x{202E}\x{2066}-\x{2069}]/u', '', $v) ?? '';
        if (! $keepNewlines) $v = preg_replace('/\s+/u', ' ', $v) ?? '';
        $v = preg_replace("/\n{3,}/", "\n\n", $v) ?? '';
        return trim(mb_substr($v, 0, self::MAX_CHARS));
    }

    /** Where the request comes from (by IP) — null when unknown / local. */
    private function detectedLocation(Request $request): ?array
    {
        try {
            $info = \App\Services\LocationService::getLocationInfo($request->ip());
        } catch (\Throwable $e) {
            return null;
        }
        $country = trim((string) ($info['country'] ?? ''));
        if ($country === '' || in_array($country, ['Unknown', 'Local Development'], true)) return null;
        $city = trim((string) ($info['city'] ?? '')) ?: null;
        return ['country' => $country, 'city' => $city, 'country_code' => $info['country_code'] ?? null];
    }

    private function words(string $v): int
    {
        // Words must contain at least one letter — "a a a ." spam still counts
        // per word, but punctuation/number runs don't.
        preg_match_all('/[\p{L}][\p{L}\p{M}\'’-]*/u', $v, $m);
        return count($m[0]);
    }
}
