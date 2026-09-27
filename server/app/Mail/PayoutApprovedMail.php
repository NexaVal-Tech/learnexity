<?php

namespace App\Mail;

use App\Models\PayoutRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PayoutApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public PayoutRequest $payout) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your Learnexity payout has been sent');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.payout_approved');
    }
}
