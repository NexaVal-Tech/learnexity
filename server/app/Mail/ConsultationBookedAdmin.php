<?php

namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;

use App\Models\Consultation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ConsultationBookedAdmin extends Mailable
{
    use Queueable, SerializesModels, UsesEmailTemplate;

    public function __construct(public Consultation $consultation) {}

    public function envelope(): Envelope
    {
        $prefix = $this->consultation->source === 'advisory'
            ? 'New Technology Value Assessment — '
            : 'New Consultation Booked — ';

        return new Envelope(subject: $this->templatedSubject($prefix . $this->consultation->full_name));
    }

    public function content(): Content
    {
        return $this->templatedContent(new Content(
            view: 'emails.consultation-booked-admin',
        ));
    }

    // ── Website CMS → Emails ────────────────────────────────────────────
    protected function emailTemplateKey(): string
    {
        return 'consultation_booked_admin';
    }

    protected function emailTemplateVars(): array
    {
        return ['name' => $this->consultation->full_name, 'email' => (string) $this->consultation->email, 'type' => ucwords(str_replace('_', ' ', (string) $this->consultation->consultation_type)), 'date' => optional($this->consultation->preferred_date)->format('F j, Y') ?? (string) $this->consultation->preferred_date, 'time' => (string) $this->consultation->preferred_time];
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        return null;
    }
}
