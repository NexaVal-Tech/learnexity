<?php

namespace App\Mail;

use App\Models\Scholarship;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Cosmetic countdown nudge — the scholarship itself never actually expires
 * or lapses; this is purely a "don't forget to use it" reminder, sent at
 * 14 days left, 7 days left, then every day through the final week
 * (7, 6, 5, 4, 3, 2, 1 days left). See ScholarshipCountdownReminders
 * command for the send schedule/dedup logic.
 */
class ScholarshipCountdownReminder extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public Scholarship $scholarship,
        public int $daysRemaining,
        public string $paymentUrl,
    ) {}

    public function envelope(): Envelope
    {
        $isFullTuition = (float) $this->scholarship->discount_percentage >= 100;
        $tier          = $isFullTuition ? 'full-tuition scholarship' : "{$this->scholarship->discount_percentage}% scholarship";

        $subject = $this->daysRemaining <= 7
            ? "⏳ {$this->daysRemaining} day" . ($this->daysRemaining === 1 ? '' : 's') . " left to use your {$tier}"
            : "Reminder: {$this->daysRemaining} days left to use your {$tier}";

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.student.scholarship_countdown_reminder',
            with: [
                'user'          => $this->user,
                'scholarship'   => $this->scholarship,
                'daysRemaining' => $this->daysRemaining,
                'isFullTuition' => (float) $this->scholarship->discount_percentage >= 100,
                'isUrgent'      => $this->daysRemaining <= 7,
                'paymentUrl'    => $this->paymentUrl,
            ],
        );
    }
}
