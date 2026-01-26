<?php

namespace App\Console\Commands;

use App\Mail\InstallmentPaymentReminder;
use App\Models\CourseEnrollment;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendPaymentReminders extends Command
{
    protected $signature = 'payments:send-reminders {--force : Force send reminders regardless of schedule}';
    protected $description = 'Send payment reminders for upcoming and overdue installments';

    public function handle()
    {
        $this->info('Starting payment reminder process...');
        $this->info('Current time: ' . Carbon::now()->toDateTimeString());

        // Get all installment enrollments that are not completed
        $enrollments = CourseEnrollment::where('payment_type', 'installment')
            ->where('payment_status', '!=', 'completed')
            ->whereNotNull('next_payment_due')
            ->with('user')
            ->get();

        $this->info("Found {$enrollments->count()} active installment enrollments");

        $sentCount = 0;
        $skippedCount = 0;
        $errorCount = 0;

        foreach ($enrollments as $enrollment) {
            try {
                $daysUntilDue = $enrollment->getDaysUntilPayment();
                $shouldSendReminder = false;
                $reminderType = '';

                // Send reminder if:
                // 1. Payment is 7 days away (1 week before)
                if ($daysUntilDue === 7) {
                    $shouldSendReminder = true;
                    $reminderType = '7-day advance notice';
                }
                // 2. Payment is 3 days away
                elseif ($daysUntilDue === 3) {
                    $shouldSendReminder = true;
                    $reminderType = '3-day advance notice';
                }
                // 3. Payment is 1 day away
                elseif ($daysUntilDue === 1) {
                    $shouldSendReminder = true;
                    $reminderType = '1-day advance notice';
                }
                // 4. Payment is due today (0 days)
                elseif ($daysUntilDue === 0) {
                    $shouldSendReminder = true;
                    $reminderType = 'due today';
                }
                // 5. Payment is overdue - send weekly reminders
                elseif ($daysUntilDue < 0 && abs($daysUntilDue) % 7 === 0) {
                    $shouldSendReminder = true;
                    $reminderType = abs($daysUntilDue) . ' days overdue';
                }

                if ($shouldSendReminder) {
                    if (!$enrollment->user || !$enrollment->user->email) {
                        $this->error("Enrollment #{$enrollment->id} has no valid user email");
                        $errorCount++;
                        continue;
                    }

                    $this->line("📧 Sending '{$reminderType}' reminder for enrollment #{$enrollment->id}");
                    $this->line("   → User: {$enrollment->user->name} ({$enrollment->user->email})");
                    $this->line("   → Course: {$enrollment->course_name}");
                    $this->line("   → Payment due: {$enrollment->next_payment_due->format('M d, Y')}");
                    $this->line("   → Installment: {$enrollment->installments_paid}/{$enrollment->total_installments}");

                    Mail::to($enrollment->user->email)
                        ->send(new InstallmentPaymentReminder($enrollment));
                    
                    $sentCount++;
                    
                    Log::info('Payment reminder sent', [
                        'enrollment_id' => $enrollment->id,
                        'user_id' => $enrollment->user_id,
                        'user_email' => $enrollment->user->email,
                        'course_name' => $enrollment->course_name,
                        'days_until_due' => $daysUntilDue,
                        'reminder_type' => $reminderType,
                        'next_payment_due' => $enrollment->next_payment_due,
                    ]);
                } else {
                    $skippedCount++;
                }

                // Update access status
                $enrollment->updateAccessStatus();

            } catch (\Exception $e) {
                $errorCount++;
                $this->error("❌ Failed to send reminder for enrollment #{$enrollment->id}: {$e->getMessage()}");
                
                Log::error('Payment reminder failed', [
                    'enrollment_id' => $enrollment->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }

        $this->newLine();
        $this->info('✅ Payment reminder process completed!');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Total Enrollments', $enrollments->count()],
                ['Reminders Sent', $sentCount],
                ['Skipped', $skippedCount],
                ['Errors', $errorCount],
            ]
        );

        if ($errorCount > 0) {
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}