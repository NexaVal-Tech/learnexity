<?php

namespace App\Console\Commands;

use App\Models\CourseEnrollment;
use App\Models\Scholarship;
use App\Services\PricingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * One-off repair for a bug in CourseEnrollmentController::enroll(): the sync
 * that refreshes a pending enrollment's price only ran when learning_track,
 * payment_type, or the 100%-scholarship flag visibly changed. A PARTIAL
 * scholarship award (e.g. the 50% tier) never flips that flag, so any
 * student who enrolled BEFORE applying for a scholarship, was then awarded
 * one, and returned to pay without changing track/payment type, was left
 * sitting on the old, undiscounted total_amount/installment_amount — and
 * would be charged (and emailed a confirmation for) the original course
 * price instead of their scholarship price.
 *
 * That code path is now fixed to always resync. This command finds any
 * still-pending (unpaid) enrollment that currently has an approved, unused
 * scholarship for the same user+course and recalculates its price via
 * PricingService — the same single source of truth the live enroll()
 * endpoint uses — so nobody who hasn't paid yet gets overcharged.
 *
 * Never touches enrollments that are already paid (payment_status
 * 'completed') — those reflect money that has already changed hands and
 * need a manual refund/adjustment decision, not an automated rewrite.
 */
class FixScholarshipEnrollmentPricing extends Command
{
    protected $signature = 'scholarships:fix-pending-pricing {--dry-run : Show what would change without saving anything}';
    protected $description = 'Recalculate total_amount/installment_amount on pending enrollments that have an approved, unused scholarship, so scholarship recipients are never charged the original course price';

    public function handle()
    {
        $dryRun = (bool) $this->option('dry-run');

        $this->info($dryRun
            ? 'Running in DRY-RUN mode — no changes will be saved.'
            : 'Running LIVE — matching enrollments will be updated.');

        $enrollments = CourseEnrollment::where('payment_status', 'pending')
            ->with(['user', 'course'])
            ->get();

        $this->info("Found {$enrollments->count()} pending enrollment(s) to check.");

        $checked = 0;
        $corrected = 0;
        $skippedNoScholarship = 0;
        $skippedNoCourseOrUser = 0;
        $errors = 0;
        $rows = [];

        foreach ($enrollments as $enrollment) {
            $checked++;

            try {
                if (!$enrollment->user || !$enrollment->course) {
                    $skippedNoCourseOrUser++;
                    continue;
                }

                $scholarship = Scholarship::where('user_id', $enrollment->user_id)
                    ->where('course_id', $enrollment->course_id)
                    ->where('status', 'approved')
                    ->where('is_used', false)
                    ->first();

                if (!$scholarship) {
                    $skippedNoScholarship++;
                    continue;
                }

                $pricing = PricingService::calculate(
                    $enrollment->user,
                    $enrollment->course,
                    $enrollment->currency,
                    $enrollment->learning_track,
                    $enrollment->payment_type
                );

                $oldTotal = (float) $enrollment->total_amount;
                $newTotal = (float) $pricing['amount'];

                $priceIsStale = round($oldTotal, 2) !== round($newTotal, 2)
                    || (int) ($enrollment->scholarship_id) !== (int) $scholarship->id
                    || (bool) $enrollment->is_registration_fee !== $pricing['is_registration_fee'];

                if (!$priceIsStale) {
                    continue;
                }

                $rows[] = [
                    $enrollment->id,
                    $enrollment->user->email ?? $enrollment->user_id,
                    $enrollment->course_name,
                    $enrollment->currency . ' ' . number_format($oldTotal, 2),
                    $enrollment->currency . ' ' . number_format($newTotal, 2),
                    $scholarship->discount_percentage . '%',
                ];

                if (!$dryRun) {
                    $enrollment->update([
                        'total_amount'        => $pricing['amount'],
                        'installment_amount'  => $pricing['installment_amount'],
                        'total_installments'  => $pricing['total_installments'],
                        'payment_type'        => $pricing['payment_type'],
                        'scholarship_id'      => $scholarship->id,
                        'is_registration_fee' => $pricing['is_registration_fee'],
                    ]);

                    Log::info('🔧 Corrected stale scholarship pricing on pending enrollment', [
                        'enrollment_id'  => $enrollment->id,
                        'user_id'        => $enrollment->user_id,
                        'scholarship_id' => $scholarship->id,
                        'old_total'      => $oldTotal,
                        'new_total'      => $newTotal,
                    ]);
                }

                $corrected++;
            } catch (\Exception $e) {
                $errors++;
                $this->error("❌ Failed on enrollment #{$enrollment->id}: {$e->getMessage()}");
                Log::error('Scholarship pricing repair failed', [
                    'enrollment_id' => $enrollment->id,
                    'error'         => $e->getMessage(),
                ]);
            }
        }

        $this->newLine();

        if (!empty($rows)) {
            $this->table(
                ['Enrollment', 'Student', 'Course', 'Old Price', 'Corrected Price', 'Scholarship %'],
                $rows
            );
        }

        $this->info($dryRun ? '✅ Dry run complete — nothing was saved.' : '✅ Repair complete.');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Pending enrollments checked', $checked],
                ['No approved/unused scholarship', $skippedNoScholarship],
                ['Missing user or course record', $skippedNoCourseOrUser],
                [$dryRun ? 'Would be corrected' : 'Corrected', $corrected],
                ['Errors', $errors],
            ]
        );

        if ($dryRun && $corrected > 0) {
            $this->comment('Run again with `php artisan scholarships:fix-pending-pricing` (no --dry-run) to apply these corrections.');
        }

        return $errors > 0 ? Command::FAILURE : Command::SUCCESS;
    }
}
