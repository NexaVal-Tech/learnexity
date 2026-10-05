<?php

namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;

use App\Models\PayoutRequest;
use App\Models\PublicReferrer;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminPayoutRequestedMail extends Mailable
{
    use Queueable, SerializesModels, UsesEmailTemplate;

    public function __construct(
        public PayoutRequest $payout,
        public string $payeeType,
        public User|PublicReferrer $payee,
    ) {}

    public function envelope(): Envelope
    {
        $name = $this->payeeType === 'user' ? $this->payee->name : $this->payee->email;

        return new Envelope(subject: $this->templatedSubject('Payout Requested - ₦' . number_format((float) $this->payout->amount, 2) . ' - ' . $name));
    }

    public function content(): Content
    {
        return $this->templatedContent(new Content(
            view: 'emails.admin.payout_requested',
        ));
    }

    // ── Website CMS → Emails ────────────────────────────────────────────
    protected function emailTemplateKey(): string
    {
        return 'admin_payout_requested';
    }

    protected function emailTemplateVars(): array
    {
        return ['amount' => '₦' . number_format((float) $this->payout->amount, 2), 'payee' => $this->payeeType === 'user' ? $this->payee->name : $this->payee->email, 'bank' => (string) $this->payout->bank_name, 'account_number' => (string) $this->payout->account_number, 'account_name' => (string) $this->payout->account_name];
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        return null;
    }
}
