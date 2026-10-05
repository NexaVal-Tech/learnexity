<?php

namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;

use App\Models\KidsEnrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class KidsEnrollmentConfirmation extends Mailable
{
    use Queueable, SerializesModels, UsesEmailTemplate;

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

        return new Envelope(subject: $this->templatedSubject($subject));
    }

    public function content(): Content
    {
        return $this->templatedContent(new Content(view: 'emails.kids.enrollment_confirmation'));
    }

    public function attachments(): array
    {
        return [];
    }

    // ── Website CMS → Emails ────────────────────────────────────────────
    protected function emailTemplateKey(): string
    {
        return 'kids_enrollment_confirmation';
    }

    protected function emailTemplateVars(): array
    {
        return ['parent_name' => $this->enrollment->parent_name, 'student_name' => $this->enrollment->student_name, 'course' => $this->enrollment->course?->name ?? 'Kids Programme', 'amount' => (strtoupper((string) $this->enrollment->currency) === 'NGN' ? '₦' : '$') . number_format((float) $this->amountPaid, 2)];
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        return null;
    }
}
