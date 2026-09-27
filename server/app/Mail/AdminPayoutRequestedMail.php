<?php

namespace App\Mail;

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
    use Queueable, SerializesModels;

    public function __construct(
        public PayoutRequest $payout,
        public string $payeeType,
        public User|PublicReferrer $payee,
    ) {}

    public function envelope(): Envelope
    {
        $name = $this->payeeType === 'user' ? $this->payee->name : $this->payee->email;

        return new Envelope(
            subject: 'Payout Requested - ₦' . number_format((float) $this->payout->amount, 2) . ' - ' . $name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin.payout_requested',
        );
    }
}
