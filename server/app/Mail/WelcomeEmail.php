<?php

namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeEmail extends Mailable
{
    use Queueable, SerializesModels, UsesEmailTemplate;

    public User $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->templatedSubject('🎉 Welcome to Learnexity — You\'re In!'));
    }

    public function content(): Content
    {
        return $this->templatedContent(new Content(
            view: 'emails.welcome',
            with: [
                'user' => $this->user,
                'coursesUrl' => env('FRONTEND_URL', 'http://localhost:3000') . '/courses/courses',
                'dashboardUrl' => env('FRONTEND_URL', 'http://localhost:3000') . '/user/dashboard',
                'whatsappCommunityUrl' => 'https://chat.whatsapp.com/GNMAOp0663AAlNOkJYbiCR?s=cl&p=i&mlu=3&amv=2',
            ]
        ));
    }

    // ── Website CMS → Emails ────────────────────────────────────────────
    protected function emailTemplateKey(): string
    {
        return 'welcome';
    }

    protected function emailTemplateVars(): array
    {
        return ['name' => $this->user->name, 'first_name' => explode(' ', trim((string) $this->user->name))[0]];
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        return rtrim((string) config('app.frontend_url', env('FRONTEND_URL', 'https://learnexity.org')), '/') . '/courses';
    }
}
