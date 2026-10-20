<?php

namespace App\Mail;

use App\Models\TvRegistration;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Tells the admin team a Premium Career Pass was paid (consultation to schedule). */
class TvAdminPremiumMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public TvRegistration $registration) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'New Premium Career Pass: ' . $this->registration->full_name);
    }

    public function content(): Content
    {
        $r = $this->registration;
        return new Content(view: 'emails.tv.message', with: [
            'heading'     => 'New Premium Career Pass',
            'firstName'   => 'team',
            'paragraphs'  => ['A Premium Career Pass was just paid for the Learnexity TV webinar. Please schedule their 1-hour consultation.'],
            'details'     => array_filter([
                'Name'          => $r->full_name,
                'Email'         => $r->email,
                'Phone'         => $r->phone,
                'Focus'         => $r->consultation_focus === 'monetization' ? 'Monetization & Business Strategy' : 'Career Strategy & Mapping',
                'Amount'        => $r->amount ? (($r->currency === 'NGN' ? '₦' : '$') . number_format((float) $r->amount, 2)) : null,
                'Paid with'     => $r->payment_method,
                'Reference'     => $r->transaction_id,
            ]),
            'buttonUrl'   => rtrim((string) config('app.frontend_url'), '/') . '/admin/tv',
            'buttonLabel' => 'Open in admin',
            'whatsappUrl' => null,
        ]);
    }
}
