<?php

namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;

use App\Models\Instructor;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InstructorWelcomeMail extends Mailable
{
    use Queueable, SerializesModels, UsesEmailTemplate;

    public function __construct(
        public Instructor $instructor,
        public string $plainPassword,
        public bool $isReset = false
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->templatedSubject($this->isReset
                ? 'Your Learnexity Instructor Password Has Been Reset'
                : 'Welcome to Learnexity — Your Instructor Account is Ready'));
    }

    public function content(): Content
    {
        return $this->templatedContent(new Content(view: 'emails.instructor.welcome'));
    }

    public function attachments(): array
    {
        return [];
    }

    // ── Website CMS → Emails ────────────────────────────────────────────
    protected function emailTemplateKey(): string
    {
        return 'instructor_welcome';
    }

    protected function emailTemplateVars(): array
    {
        return ['name' => $this->instructor->name, 'email' => $this->instructor->email, 'password' => $this->plainPassword, 'login_url' => rtrim((string) config('app.frontend_url', env('FRONTEND_URL', 'https://learnexity.org')), '/') . '/instructors/auth/login'];
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        return rtrim((string) config('app.frontend_url', env('FRONTEND_URL', 'https://learnexity.org')), '/') . '/instructors/auth/login';
    }
}
