<?php
// FILE: app/Mail/UnenrolledUserNudgeMail.php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent to users who registered but have never enrolled in any course.
 * Three variants are sent across 3 days, after which we stop.
 */
class UnenrolledUserNudgeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public int $nudgeDay,      // 1, 2, or 3
        public string $coursesUrl,
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            1 => "Your Learnexity account is ready — pick your first course, {$this->user->name}",
            2 => "Still deciding? Here's why students love Learnexity",
            3 => "Last nudge — we'd love to see you in a course, {$this->user->name}",
        ];

        return new Envelope(
            subject: $subjects[min($this->nudgeDay, 3)]
                ?? "Your courses are waiting at Learnexity"
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.student.unenrolled_nudge');
    }
}