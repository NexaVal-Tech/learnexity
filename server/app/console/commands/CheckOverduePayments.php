<?php

namespace App\Console\Commands;

use App\Models\CourseEnrollment;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckOverduePayments extends Command
{
    protected $signature = 'payments:check-overdue';
    protected $description = 'Check and block access for overdue installment payments (after 7-day grace period)';

    public function handle()
    {
        $this->info('Checking for overdue payments...');
        $this->info('Current time: ' . Carbon::now()->toDateTimeString());

        // Get enrollments where payment is overdue by more than 7 days (grace period)
        $overdueEnrollments = CourseEnrollment::where('payment_type', 'installment')
            ->where('payment_status', '!=', 'completed')
            ->whereNotNull('next_payment_due')
            ->where('next_payment_due', '<', Carbon::now()->subDays(7)) // 7-day grace period
            ->get();

        $this->info("Found {$overdueEnrollments->count()} enrollments past grace period");

        $blockedCount = 0;
        $alreadyBlockedCount = 0;

        foreach ($overdueEnrollments as $enrollment) {
            $daysOverdue = Carbon::now()->diffInDays($enrollment->next_payment_due);
            
            if ($enrollment->has_access) {
                // Block access
                $enrollment->update([
                    'has_access' => false,
                    'access_blocked_reason' => "Your installment payment is overdue by {$daysOverdue} days. Please complete your payment to regain access."
                ]);
                
                Log::warning('Blocked access for overdue payment', [
                    'enrollment_id' => $enrollment->id,
                    'user_id' => $enrollment->user_id,
                    'user_name' => $enrollment->user->name ?? 'Unknown',
                    'course_id' => $enrollment->course_id,
                    'course_name' => $enrollment->course_name,
                    'days_overdue' => $daysOverdue,
                    'next_payment_due' => $enrollment->next_payment_due,
                ]);
                
                $this->warn("🚫 Blocked access for enrollment #{$enrollment->id}");
                $this->line("   → User: {$enrollment->user->name} (ID: {$enrollment->user_id})");
                $this->line("   → Course: {$enrollment->course_name}");
                $this->line("   → Days overdue: {$daysOverdue}");
                
                $blockedCount++;
            } else {
                $alreadyBlockedCount++;
                
                // Update the reason with current days overdue
                $enrollment->update([
                    'access_blocked_reason' => "Your installment payment is overdue by {$daysOverdue} days. Please complete your payment to regain access."
                ]);
            }
        }

        $this->newLine();
        $this->info('✅ Overdue payment check completed!');
        $this->table(
            ['Status', 'Count'],
            [
                ['Newly Blocked', $blockedCount],
                ['Already Blocked', $alreadyBlockedCount],
                ['Total Overdue', $overdueEnrollments->count()],
            ]
        );

        return Command::SUCCESS;
    }
}