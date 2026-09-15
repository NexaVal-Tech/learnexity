<?php

namespace App\Mail;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ConsultationBookedAdmin extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Consultation $consultation) {}

    public function envelope(): Envelope
    {
        $prefix = $this->consultation->source === 'advisory'
            ? 'New Technology Value Assessment — '
            : 'New Consultation Booked — ';

        return new Envelope(subject: $prefix . $this->consultation->full_name);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.consultation-booked-admin',
        );
    }
}