<?php

namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;

use App\Models\CourseEnrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentConfirmation extends Mailable
{
    use Queueable, SerializesModels, UsesEmailTemplate;

    public $enrollment;
    public $amount;

    /**
     * Create a new message instance.
     */
    public function __construct(CourseEnrollment $enrollment, $amount = null)
    {
        $this->enrollment = $enrollment;
        $this->amount = $amount;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->templatedSubject('Payment Confirmation - ' . $this->enrollment->course_name));
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return $this->templatedContent(new Content(
            view: 'emails.payment-confirmation',
        ));
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }

    // ── Website CMS → Emails ────────────────────────────────────────────
    protected function emailTemplateKey(): string
    {
        return 'payment_confirmation';
    }

    protected function emailTemplateVars(): array
    {
        return ['name' => $this->enrollment->user->name ?? 'there', 'first_name' => explode(' ', trim((string) ($this->enrollment->user->name ?? 'there')))[0], 'course' => $this->enrollment->course_name, 'amount' => (strtoupper((string) $this->enrollment->currency) === 'NGN' ? '₦' : '$') . number_format((float) ($this->amount ?? $this->enrollment->amount_paid), 2), 'transaction_id' => (string) $this->enrollment->transaction_id];
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        return rtrim((string) config('app.frontend_url', env('FRONTEND_URL', 'https://learnexity.org')), '/') . '/user/dashboard?tab=your-course';
    }

    protected function emailTemplateDetails(): array
    {
        return ['Course' => $this->enrollment->course_name, 'Amount paid' => (strtoupper((string) $this->enrollment->currency) === 'NGN' ? '₦' : '$') . number_format((float) ($this->amount ?? $this->enrollment->amount_paid), 2), 'Transaction ID' => (string) $this->enrollment->transaction_id];
    }
}
