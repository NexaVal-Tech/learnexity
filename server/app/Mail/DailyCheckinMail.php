<?php
// ──────────────────────────────────────────────────────────────────────────────
// FILE: app/Mail/DailyCheckinMail.php
// ──────────────────────────────────────────────────────────────────────────────
namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DailyCheckinMail extends Mailable
{
    use Queueable, SerializesModels, UsesEmailTemplate;

    public function __construct(
        public User $user,
        public array $enrolledCourses,  // [['name'=>'...','progress'=>40,'next_sprint'=>'...'], ...]
        public int $loginStreakDays
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->templatedSubject("📚 Your Daily Learning Check-in — {$this->user->name}"));
    }

    public function content(): Content
    {
        return $this->templatedContent(new Content(view: 'emails.student.daily_checkin'));
    }

    // ── Website CMS → Emails ────────────────────────────────────────────
    protected function emailTemplateKey(): string
    {
        return 'daily_checkin';
    }

    protected function emailTemplateVars(): array
    {
        return ['name' => $this->user->name, 'first_name' => explode(' ', trim((string) $this->user->name))[0], 'streak' => $this->loginStreakDays];
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        return rtrim((string) config('app.frontend_url', env('FRONTEND_URL', 'https://learnexity.org')), '/') . '/user/dashboard';
    }
}
