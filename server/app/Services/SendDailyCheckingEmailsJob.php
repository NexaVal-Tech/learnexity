<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\CourseEnrollment;
use App\Models\UserPerformanceScore;
use App\Models\EmailSequenceLog;
use App\Models\CourseMaterial;
use App\Models\SprintProgress;
use App\Mail\DailyCheckinMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendDailyCheckinEmailsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        Log::info('📧 [DailyCheckin] Starting daily check-in email dispatch');

        // Get all users who have at least one active (paid) enrollment
        $userIds = CourseEnrollment::where('payment_status', 'completed')
            ->distinct()
            ->pluck('user_id');

        $sent = 0;
        $skipped = 0;

        foreach ($userIds as $userId) {
            // Don't send to the same user twice today
            if (EmailSequenceLog::sentTodayFor($userId, 'daily_checkin')) {
                $skipped++;
                continue;
            }

            $user = User::find($userId);
            if (!$user) continue;

            $enrollments = CourseEnrollment::where('user_id', $userId)
                ->where('payment_status', 'completed')
                ->get();

            $courseData = [];
            foreach ($enrollments as $enrollment) {
                $totalSprints     = CourseMaterial::where('course_id', $enrollment->course_id)->count();
                $completedSprints = SprintProgress::where('user_id', $userId)
                    ->where('course_id', $enrollment->course_id)
                    ->where('progress_percentage', 100)
                    ->count();

                $progress = $totalSprints > 0 ? round(($completedSprints / $totalSprints) * 100) : 0;

                // Find the next incomplete sprint name
                $nextSprint = CourseMaterial::where('course_id', $enrollment->course_id)
                    ->orderBy('sprint_number')
                    ->get()
                    ->first(function ($sprint) use ($userId) {
                        return SprintProgress::where('user_id', $userId)
                            ->where('course_material_id', $sprint->id)
                            ->where('progress_percentage', 100)
                            ->doesntExist();
                    });

                $courseData[] = [
                    'name'        => $enrollment->course_name ?? "Course #{$enrollment->course_id}",
                    'progress'    => $progress,
                    'next_sprint' => $nextSprint?->sprint_name,
                ];
            }

            if (empty($courseData)) continue;

            // Get streak from any performance score record for this user
            $streak = UserPerformanceScore::where('user_id', $userId)
                ->max('login_streak_days') ?? 0;

            try {
                Mail::to($user->email)->queue(
                    new DailyCheckinMail($user, $courseData, $streak)
                );

                EmailSequenceLog::record($userId, 'daily_checkin', null, [
                    'courses' => count($courseData),
                    'streak'  => $streak,
                ]);

                $sent++;
            } catch (\Exception $e) {
                Log::error('❌ [DailyCheckin] Failed to queue email', [
                    'user_id' => $userId,
                    'error'   => $e->getMessage(),
                ]);
            }
        }

        Log::info("✅ [DailyCheckin] Done. Sent: {$sent}, Skipped (already sent): {$skipped}");
    }
}