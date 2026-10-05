<?php

namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;

use App\Models\Scholarship;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent the moment a scholarship application is decided, always with a
 * "Proceed to Payment" button. Every applicant is approved now — there's no
 * reject outcome — but the award is one of two tiers: 100% (full tuition,
 * pay the flat registration fee only) or the admin-configured partial
 * percentage (discount applied to the normal course price, normal payment
 * flow still applies).
 */
class ScholarshipResultMail extends Mailable
{
    use Queueable, SerializesModels, UsesEmailTemplate;

    public function __construct(
        public User $user,
        public Scholarship $scholarship,
        public bool $isApproved,
        public string $paymentUrl,
        public ?float $amountDue = null,
        public string $currency = 'USD',
    ) {}

    public function envelope(): Envelope
    {
        $subject = "🎓 You've been awarded a scholarship — {$this->scholarship->course_name}";

        return new Envelope(subject: $this->templatedSubject($subject));
    }

    public function content(): Content
    {
        return $this->templatedContent(new Content(
            view: 'emails.student.scholarship_result',
            with: [
                'user'          => $this->user,
                'scholarship'   => $this->scholarship,
                'isApproved'    => $this->isApproved,
                'isFullTuition' => true, // single-award model
                'paymentUrl'    => $this->paymentUrl,
                'amountDue'     => $this->amountDue,
                'currency'      => $this->currency,
            ],
        ));
    }

    // ── Website CMS → Emails ────────────────────────────────────────────
    protected function emailTemplateKey(): string
    {
        return 'scholarship_result';
    }

    protected function emailTemplateVars(): array
    {
        return ['name' => $this->user->name, 'first_name' => explode(' ', trim((string) $this->user->name))[0], 'course' => $this->scholarship->course_name, 'fee' => $this->amountDue ? (strtoupper((string) $this->currency) === 'NGN' ? '₦' : '$') . number_format((float) $this->amountDue, 2) : 'the registration fee shown on your payment page'];
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        return $this->paymentUrl;
    }

    protected function emailTemplateDetails(): array
    {
        return ['Course' => $this->scholarship->course_name, 'Status' => 'Scholarship awarded', 'Registration fee' => $this->amountDue ? (strtoupper((string) $this->currency) === 'NGN' ? '₦' : '$') . number_format((float) $this->amountDue, 2) : 'Shown on your payment page'];
    }
}
