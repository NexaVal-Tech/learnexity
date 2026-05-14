<?php
// ──────────────────────────────────────────────────────────────────────────────
// FILE: app/Mail/SprintCompletedMail.php
// ──────────────────────────────────────────────────────────────────────────────

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SprintCompletedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $sprintName,
        public int $sprintNumber,
        public string $courseName,
        public int $progressPercent,
        public int $totalSprints
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Sprint {$this->sprintNumber} Complete — Great work, {$this->user->name}!");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.student.sprint_completed');
    }
}