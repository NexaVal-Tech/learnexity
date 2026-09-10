<?php

namespace App\Console\Commands;

use App\Mail\ScholarshipCountdownReminder;
use App\Models\Course;
use App\Models\CourseEnrollment;
use App\Models\Scholarship;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Cosmetic 30-day scholarship countdown reminders. Sent at 14 days left,
 * 7 days left, then every day through the final week (7, 6, 5, 4, 3, 2, 1
 * days left) — never touches whether the scholarship is actually still
 * redeemable, that's governed entirely by Scholarship::isRedeemable().
 *
 * Dedup is explicit (via the reminders_sent JSON column) rather than
 * relying on "the cron only runs once a day" like SendPaymentReminders
 * does — a re-run on the same day, or a missed day, won't cause a
 * duplicate or a skipped threshold.
 */
class SendScholarshipCountdownReminders extends Command
{
    protected $signature = 'scholarships:send-countdown-reminders {--force}';

    protected $description = 'Email scholarship recipients a reminder as their cosmetic 30-day countdown runs down';

    /** Thresholds, in the order we want them checked. */
    private const THRESHOLDS = [14, 7, 6, 5, 4, 3, 2, 1];

    public function handle(): int
    {
        $scholarships = Scholarship::where('status', 'approved')
            ->where('is_used', false)
            ->whereNotNull('approved_at')
            ->with('user')
            ->get();

        $sent = 0;
        $skipped = 0;
        $errors = 0;

        foreach ($scholarships as $scholarship) {
            try {
                $daysRemaining = $scholarship->days_remaining;

                if ($daysRemaining === null || ! in_array($daysRemaining, self::THRESHOLDS, true)) {
                    continue;
                }

                $alreadySent = $scholarship->reminders_sent ?? [];
                if (in_array($daysRemaining, $alreadySent, true) && ! $this->option('force')) {
                    $skipped++;
                    continue;
                }

                $user = $scholarship->user;
                if (! $user) {
                    continue;
                }

                $paymentUrl = $this->buildPaymentUrl($scholarship);

                Mail::to($user->email)->queue(
                    new ScholarshipCountdownReminder($user, $scholarship, $daysRemaining, $paymentUrl)
                );

                $scholarship->update([
                    'reminders_sent' => array_values(array_unique([...$alreadySent, $daysRemaining])),
                ]);

                Log::info('🎓 Scholarship countdown reminder sent', [
                    'scholarship_id' => $scholarship->id,
                    'user_id'        => $user->id,
                    'days_remaining' => $daysRemaining,
                ]);

                $sent++;
            } catch (\Exception $e) {
                $errors++;
                Log::error('❌ Failed to send scholarship countdown reminder', [
                    'scholarship_id' => $scholarship->id,
                    'error'          => $e->getMessage(),
                ]);
            }
        }

        $this->info("Scholarship countdown reminders — sent: {$sent}, skipped (already sent): {$skipped}, errors: {$errors}");

        return self::SUCCESS;
    }

    /**
     * Prefer linking straight to the pending enrollment's payment page
     * (created automatically when the scholarship was awarded — see
     * ScholarshipController::sendResultEmail()) so the recipient doesn't
     * have to re-navigate; fall back to the course page if none exists.
     */
    private function buildPaymentUrl(Scholarship $scholarship): string
    {
        $frontendUrl = rtrim(config('app.frontend_url'), '/');

        $enrollment = CourseEnrollment::where('user_id', $scholarship->user_id)
            ->where('course_id', $scholarship->course_id)
            ->where('payment_status', '!=', 'completed')
            ->latest()
            ->first();

        if ($enrollment) {
            return "{$frontendUrl}/user/payment/{$enrollment->id}";
        }

        $course = Course::where('course_id', $scholarship->course_id)->first();

        return $course
            ? "{$frontendUrl}/courses/{$course->course_id}"
            : $frontendUrl;
    }
}
