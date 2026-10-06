<?php

namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;
use App\Models\CourseEnrollment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent when an admin grants a student access to a course (Admin → Students
 * → Grant access). Text editable in Website CMS → Emails.
 */
class CourseAccessGrantedMail extends Mailable
{
    use Queueable, SerializesModels, UsesEmailTemplate;

    public function __construct(
        public User $user,
        public CourseEnrollment $enrollment,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->templatedSubject("🎉 You now have access to {$this->enrollment->course_name}"));
    }

    public function content(): Content
    {
        return $this->templatedContent(new Content(
            view: 'emails.student.course_access_granted',
            with: [
                'user'        => $this->user,
                'courseName'  => $this->enrollment->course_name,
                'learningUrl' => $this->emailTemplateButtonUrl(),
            ],
        ));
    }

    // ── Website CMS → Emails ────────────────────────────────────────────
    protected function emailTemplateKey(): string
    {
        return 'course_access_granted';
    }

    protected function emailTemplateVars(): array
    {
        return [
            'name'       => $this->user->name,
            'first_name' => explode(' ', trim((string) $this->user->name))[0],
            'course'     => $this->enrollment->course_name,
        ];
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        return rtrim((string) config('app.frontend_url', env('FRONTEND_URL', 'https://learnexity.org')), '/')
            . '/user/resource?courseId=' . urlencode((string) $this->enrollment->course_id);
    }
}
