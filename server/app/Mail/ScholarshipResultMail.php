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
 * Sent the moment a scholarship application is decided — whether approved
 * or rejected — always with a "Proceed to Payment" button. Approved
 * applicants pay the flat registration fee only; rejected (or not-applied)
 * users pay the normal course price. Either way they land on the same
 * payment page and can complete checkout immediately.
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
        $subject = $this->isApproved
            ? "🎓 You've been awarded a full-tuition scholarship — {$this->scholarship->course_name}"
            : "Your scholarship application update — {$this->scholarship->course_name}";

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.student.scholarship_result',
            with: [
                'user'         => $this->user,
                'scholarship'  => $this->scholarship,
                'isApproved'   => $this->isApproved,
                'paymentUrl'   => $this->paymentUrl,
                'amountDue'    => $this->amountDue,
                'currency'     => $this->currency,
            ],
        );
    }
}
