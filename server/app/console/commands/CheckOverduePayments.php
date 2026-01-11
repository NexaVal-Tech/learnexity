<?php

namespace App\Console\Commands;

use App\Models\CourseEnrollment;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckOverduePayments extends Command
{
    protected $signature = 'payments:check-overdue';
    protected $description = 'Check and block access for overdue installment payments';

    public function handle()
    {
        $this->info('Checking for overdue payments...');

        $overdueEnrollments = CourseEnrollment::where('payment_type', 'installment')
            ->where('payment_status', '!=', 'completed')
            ->where('next_payment_due', '<', Carbon::now())
            ->where('has_access', true)
            ->get();

        $count = 0;
        foreach ($overdueEnrollments as $enrollment) {
            $enrollment->update(['has_access' => false]);
            
            Log::info('Blocked access for overdue payment', [
                'enrollment_id' => $enrollment->id,
                'user_id' => $enrollment->user_id,
                'course_id' => $enrollment->course_id,
                'days_overdue' => Carbon::now()->diffInDays($enrollment->next_payment_due)
            ]);
            
            $this->warn("Blocked access for enrollment #{$enrollment->id} (User: {$enrollment->user->name})");
            $count++;
        }

        $this->info("Processed {$count} overdue payments");
        
        return Command::SUCCESS;
    }
}