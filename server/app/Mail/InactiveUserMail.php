<?php
// FILE: app/Mail/InactiveUserMail.php

namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InactiveUserMail extends Mailable
{
    use Queueable, SerializesModels, UsesEmailTemplate;

    public function __construct(
        public User $user,
        public int $daysInactive,
        public array $courseProgress,  // [['name'=>'...','progress'=>40,'next_sprint'=>'...'], ...]
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            2  => "We miss you, {$this->user->name} — come back and keep learning 👋",
            7  => "{$this->user->name}, your courses are waiting for you",
            14 => "It's been a while — don't let your progress slip, {$this->user->name}",
        ];

        // Pick the closest subject key
        $subject = "We miss you, {$this->user->name} — come back and keep learning 👋";
        foreach ([14, 7, 2] as $threshold) {
            if ($this->daysInactive >= $threshold) {
                $subject = $subjects[$threshold];
                break;
            }
        }

        return new Envelope(subject: $this->templatedSubject($subject));
    }

    public function content(): Content
    {
        return $this->templatedContent(new Content(view: 'emails.student.inactive_user'));
    }

    // ── Website CMS → Emails ────────────────────────────────────────────
    protected function emailTemplateKey(): string
    {
        return 'inactive_user';
    }

    protected function emailTemplateVars(): array
    {
        return ['name' => $this->user->name, 'first_name' => explode(' ', trim((string) $this->user->name))[0], 'days' => $this->daysInactive];
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        return rtrim((string) config('app.frontend_url', env('FRONTEND_URL', 'https://learnexity.org')), '/') . '/user/dashboard';
    }
}
