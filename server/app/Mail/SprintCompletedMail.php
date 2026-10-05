<?php
// ──────────────────────────────────────────────────────────────────────────────
// FILE: app/Mail/SprintCompletedMail.php
// ──────────────────────────────────────────────────────────────────────────────

namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SprintCompletedMail extends Mailable
{
    use Queueable, SerializesModels, UsesEmailTemplate;

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
        return new Envelope(subject: $this->templatedSubject("Sprint {$this->sprintNumber} Complete — Great work, {$this->user->name}!"));
    }

    public function content(): Content
    {
        return $this->templatedContent(new Content(view: 'emails.student.sprint_completed'));
    }

    // ── Website CMS → Emails ────────────────────────────────────────────
    protected function emailTemplateKey(): string
    {
        return 'sprint_completed';
    }

    protected function emailTemplateVars(): array
    {
        return ['name' => $this->user->name, 'first_name' => explode(' ', trim((string) $this->user->name))[0], 'course' => $this->courseName, 'sprint_number' => $this->sprintNumber, 'sprint_name' => $this->sprintName, 'progress' => $this->progressPercent, 'total_sprints' => $this->totalSprints];
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        return rtrim((string) config('app.frontend_url', env('FRONTEND_URL', 'https://learnexity.org')), '/') . '/user/dashboard';
    }
}
