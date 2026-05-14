<?php
// ──────────────────────────────────────────────────────────────────────────────
// FILE: app/Mail/PerformanceMail.php
// Sent when the AI rule engine detects a performance pattern.
// ──────────────────────────────────────────────────────────────────────────────
namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PerformanceMail extends Mailable
{
    use Queueable, SerializesModels;

    // email_type values: slow_progress | high_performer | streak_broken |
    //                    streak_milestone | completion_near | quality_drop
    public function __construct(
        public User $user,
        public string $emailType,
        public string $courseName,
        public array $scores,       // ['speed'=>70,'quality'=>60,'reliability'=>80,'problem_solving'=>55]
        public string $message,     // personalised message from rule engine
        public ?string $actionUrl = null
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            'slow_progress'     => "We noticed you haven't progressed in a while, {$this->user->name}",
            'high_performer'    => "You're crushing it, {$this->user->name}!",
            'streak_broken'     => "Your learning streak ended — let's restart",
            'streak_milestone'  => "{$this->scores['streak']} day streak — keep going, {$this->user->name}!",
            'completion_near'   => "You're almost done with {$this->courseName}!",
            'quality_drop'      => "We noticed a dip — we're here to help",
        ];

        return new Envelope(subject: $subjects[$this->emailType] ?? "A note about your learning progress");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.student.performance');
    }
}