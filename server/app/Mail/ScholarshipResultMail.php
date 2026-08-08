<?php

namespace App\Mail;

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
    use Queueable, SerializesModels;

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
        $isFullTuition = (float) $this->scholarship->discount_percentage >= 100;

        $subject = $isFullTuition
            ? "🎓 You've been awarded a full-tuition scholarship — {$this->scholarship->course_name}"
            : "🎓 You've been awarded a {$this->scholarship->discount_percentage}% scholarship — {$this->scholarship->course_name}";

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.student.scholarship_result',
            with: [
                'user'          => $this->user,
                'scholarship'   => $this->scholarship,
                'isApproved'    => $this->isApproved,
                'isFullTuition' => (float) $this->scholarship->discount_percentage >= 100,
                'paymentUrl'    => $this->paymentUrl,
                'amountDue'     => $this->amountDue,
                'currency'      => $this->currency,
            ],
        );
    }
}
