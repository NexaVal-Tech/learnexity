<?php
// FILE: app/Mail/LoginWelcomeBackMail.php
namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LoginWelcomeBackMail extends Mailable
{
    use Queueable, SerializesModels, UsesEmailTemplate;

    public function __construct(
        public User $user,
        public int $loginStreakDays,
        public array $courseProgress   // [['name'=>'...','progress'=>55], ...]
    ) {}

    public function envelope(): Envelope
    {
        $streak = $this->loginStreakDays;
        $subject = $streak >= 7
            ? "{$streak}-day streak! Welcome back, {$this->user->name}"
            : "Welcome back, {$this->user->name}!";
        return new Envelope(subject: $this->templatedSubject($subject));
    }

    public function content(): Content
    {
        return $this->templatedContent(new Content(view: 'emails.student.login_welcome_back'));
    }

    // ── Website CMS → Emails ────────────────────────────────────────────
    protected function emailTemplateKey(): string
    {
        return 'login_welcome_back';
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
