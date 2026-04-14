<?php

namespace App\Mail;

use App\Models\KidsEnrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent immediately after a new enrollment is created (before any payment).
 * Gives the parent a record of what they signed up for + a link to pay.
 */
class KidsEnrollmentRegistration extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly KidsEnrollment $enrollment
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "You're registered! Here's how to complete your enrollment — Learnexity Kids",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.kids.registration',
            with: [
                'enrollment'  => $this->enrollment,
                'paymentUrl'  => config('app.frontend_url') . '/kids/payment/' . $this->enrollment->id,
                'trackName'   => ucwords(str_replace('_', ' ', $this->enrollment->chosen_track)),
                'sessionType' => $this->enrollment->session_type === 'one_on_one' ? 'One-on-One Coaching' : 'Group Mentorship (3–5 kids)',
                'paymentType' => $this->enrollment->payment_type === 'onetime' ? 'Pay in Full' : '3 Monthly Payments',
            ],
        );
    }
}