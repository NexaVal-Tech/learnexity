<?php
// FILE: app/Mail/UnenrolledUserNudgeMail.php

namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;

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
    use Queueable, SerializesModels, UsesEmailTemplate;

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

        return new Envelope(subject: $this->templatedSubject($subjects[min($this->nudgeDay, 3)]
                ?? "Your courses are waiting at Learnexity"));
    }

    public function content(): Content
    {
        return $this->templatedContent(new Content(view: 'emails.student.unenrolled_nudge'));
    }

    // ── Website CMS → Emails ────────────────────────────────────────────
    protected function emailTemplateKey(): string
    {
        return 'unenrolled_nudge';
    }

    protected function emailTemplateVars(): array
    {
        return ['name' => $this->user->name, 'first_name' => explode(' ', trim((string) $this->user->name))[0]];
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        return $this->coursesUrl;
    }
}
