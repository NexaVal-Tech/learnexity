<?php

namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;

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
    use Queueable, SerializesModels, UsesEmailTemplate;

    public function __construct(
        public readonly KidsEnrollment $enrollment
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->templatedSubject("You're registered! Here's how to complete your enrollment — Learnexity Kids"));
    }

    public function content(): Content
    {
        return $this->templatedContent(new Content(
            view: 'emails.kids.registration',
            with: [
                'enrollment'  => $this->enrollment,
                'paymentUrl'  => config('app.frontend_url') . '/kids/payment/' . $this->enrollment->id,
                'trackName'   => ucwords(str_replace('_', ' ', $this->enrollment->chosen_track)),
                'sessionType' => $this->enrollment->session_type === 'one_on_one' ? 'One-on-One Coaching' : 'Live Classes (3–5 kids)',
                'paymentType' => $this->enrollment->payment_type === 'onetime' ? 'Pay in Full' : '3 Monthly Payments',
            ],
        ));
    }

    // ── Website CMS → Emails ────────────────────────────────────────────
    protected function emailTemplateKey(): string
    {
        return 'kids_registration';
    }

    protected function emailTemplateVars(): array
    {
        return ['parent_name' => $this->enrollment->parent_name, 'student_name' => $this->enrollment->student_name, 'course' => $this->enrollment->course?->name ?? 'Kids Programme', 'total' => (strtoupper((string) $this->enrollment->currency) === 'NGN' ? '₦' : '$') . number_format((float) $this->enrollment->total_price, 2)];
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        return config('app.frontend_url') . '/kids/payment/' . $this->enrollment->id;
    }
}
