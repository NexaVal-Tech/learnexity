<?php

namespace App\Mail;

use App\Models\KidsEnrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class KidsEnrollmentConfirmation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public KidsEnrollment $enrollment,
        public float          $amountPaid,
        public bool           $isFullyPaid
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->isFullyPaid
            ? '🎉 Enrolment Confirmed — ' . $this->enrollment->course->name
            : '✅ Payment Received — ' . $this->enrollment->installments_paid . ' of ' . $this->enrollment->total_installments . ' payments done';

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.kids.enrollment_confirmation');
    }

    public function attachments(): array
    {
        return [];
    }
}