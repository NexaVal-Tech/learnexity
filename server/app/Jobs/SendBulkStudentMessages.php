<?php

namespace App\Jobs;

use App\Models\User;
use App\Notifications\StudentMessageNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class SendBulkStudentMessages implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $studentIds;
    public $subject;
    public $message;
    public $attachmentPath;
    public $adminName;
    public $timeout = 600; // 10 minutes timeout
    public $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(
        array $studentIds,
        string $subject,
        string $message,
        ?string $attachmentPath = null,
        string $adminName = 'Admin'
    ) {
        $this->studentIds = $studentIds;
        $this->subject = $subject;
        $this->message = $message;
        $this->attachmentPath = $attachmentPath;
        $this->adminName = $adminName;
        $this->onQueue('emails');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Bulk email job started', [
            'total_recipients' => count($this->studentIds),
            'subject' => $this->subject,
        ]);

        // Process in chunks of 50 to avoid memory issues
        $chunks = array_chunk($this->studentIds, 50);
        $totalSent = 0;
        $totalFailed = 0;

        foreach ($chunks as $chunkIndex => $chunk) {
            Log::info("Processing chunk " . ($chunkIndex + 1) . " of " . count($chunks));

            $students = User::whereIn('id', $chunk)->get();

            foreach ($students as $student) {
                try {
                    $student->notify(
                        new StudentMessageNotification(
                            $this->subject,
                            $this->message,
                            $this->attachmentPath,
                            $this->adminName
                        )
                    );
                    $totalSent++;

                    Log::info("Email queued for: {$student->email}");
                } catch (\Exception $e) {
                    $totalFailed++;
                    Log::error("Failed to queue email for student {$student->id}: " . $e->getMessage());
                }
            }

            // Small delay between chunks to prevent overwhelming the queue
            if ($chunkIndex < count($chunks) - 1) {
                sleep(1);
            }
        }

        Log::info('Bulk email job completed', [
            'total_sent' => $totalSent,
            'total_failed' => $totalFailed,
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Bulk email job failed: ' . $exception->getMessage(), [
            'student_count' => count($this->studentIds),
            'subject' => $this->subject,
        ]);
    }
}