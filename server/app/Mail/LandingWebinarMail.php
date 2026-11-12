<?php

namespace App\Mail;

use App\Models\LandingWebinarRegistration;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Webinar registration emails from the landing page:
 *  - forAdmin = false → confirmation to the person who registered
 *  - forAdmin = true  → "new registration" notice to the team
 * $form is the admin-edited "Webinar form" settings (title, date, links).
 */
class LandingWebinarMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public LandingWebinarRegistration $registration,
        public array $form,
        public bool $forAdmin = false
    ) {}

    public function envelope(): Envelope
    {
        $title = (string) ($this->form['webinar_title'] ?? 'Learnexity Free Webinar');
        return new Envelope(subject: $this->forAdmin
            ? 'New webinar registration: ' . $this->registration->name
            : "You're registered: {$title}");
    }

    public function content(): Content
    {
        $digits = preg_replace('/\D+/', '', (string) ($this->form['whatsapp_number'] ?? '')) ?: '12762528415';
        $msg = (string) ($this->form['whatsapp_message'] ?? '');

        return new Content(view: 'emails.landing.webinar', with: [
            'forAdmin'    => $this->forAdmin,
            'r'           => $this->registration,
            'firstName'   => explode(' ', trim($this->registration->name))[0] ?: 'there',
            'title'       => (string) ($this->form['webinar_title'] ?? 'Learnexity Free Webinar'),
            'when'        => (string) ($this->form['webinar_when'] ?? ''),
            'joinUrl'     => (string) ($this->form['join_href'] ?? ''),
            'whatsappUrl' => 'https://wa.me/' . $digits . ($msg !== '' ? '?text=' . rawurlencode($msg) : ''),
            'whatsappLabel' => (string) ($this->form['whatsapp_label'] ?? 'Get Expert Guidance'),
            'siteUrl'     => rtrim((string) config('app.frontend_url', 'https://learnexity.org'), '/'),
        ]);
    }
}
