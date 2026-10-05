<?php

namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;

use App\Models\PayoutRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PayoutDeclinedMail extends Mailable
{
    use Queueable, SerializesModels, UsesEmailTemplate;

    public function __construct(public PayoutRequest $payout) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->templatedSubject('Update on your Learnexity payout request'));
    }

    public function content(): Content
    {
        return $this->templatedContent(new Content(view: 'emails.payout_declined'));
    }

    // ── Website CMS → Emails ────────────────────────────────────────────
    protected function emailTemplateKey(): string
    {
        return 'payout_declined';
    }

    protected function emailTemplateVars(): array
    {
        return ['amount' => '₦' . number_format((float) $this->payout->amount, 2), 'note' => (string) $this->payout->admin_note];
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        return null;
    }
}
