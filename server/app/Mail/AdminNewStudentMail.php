<?php
// FILE: app/Mail/AdminNewStudentMail.php

namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;

use App\Models\User;
use App\Models\CourseEnrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminNewStudentMail extends Mailable
{
    use Queueable, SerializesModels, UsesEmailTemplate;

    public function __construct(
        public User $user,
        public ?CourseEnrollment $enrollment = null,
        public ?string $referralCode = null,
        public ?string $subjectOverride = null
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->templatedSubject($this->subjectOverride
                ?? ($this->enrollment
                    ? 'New Course Enrollment - ' . $this->user->name
                    : 'New Student Signup - ' . $this->user->name)));
    }

    public function content(): Content
    {
        return $this->templatedContent(new Content(
            view: 'emails.admin.new_student',
        ));
    }

    // ── Website CMS → Emails ────────────────────────────────────────────
    protected function emailTemplateKey(): string
    {
        return 'admin_new_student';
    }

    protected function emailTemplateVars(): array
    {
        return ['name' => $this->user->name, 'email' => $this->user->email, 'course' => $this->enrollment?->course_name ?? '—'];
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        return null;
    }
}
