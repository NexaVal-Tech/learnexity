<?php

namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;

use App\Models\PayoutRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PayoutApprovedMail extends Mailable
{
    use Queueable, SerializesModels, UsesEmailTemplate;

    public function __construct(public PayoutRequest $payout) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->templatedSubject('Your Learnexity payout has been sent'));
    }

    public function content(): Content
    {
        return $this->templatedContent(new Content(view: 'emails.payout_approved'));
    }

    // ── Website CMS → Emails ────────────────────────────────────────────
    protected function emailTemplateKey(): string
    {
        return 'payout_approved';
    }

    protected function emailTemplateVars(): array
    {
        return ['amount' => '₦' . number_format((float) $this->payout->amount, 2), 'bank' => trim("{$this->payout->bank_name} · {$this->payout->account_number}")];
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        return null;
    }
}
