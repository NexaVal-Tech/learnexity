<?php
// FILE: app/Mail/PendingPaymentNudgeMail.php

namespace App\Mail;

use App\Models\User;
use App\Models\CourseEnrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PendingPaymentNudgeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public CourseEnrollment $enrollment,
        public int $nudgeDay,       // 1, 2, 3 … used to vary the copy
        public string $paymentUrl,
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            1 => "Complete your enrollment in {$this->enrollment->course_name}, {$this->user->name}",
            2 => "Your spot in {$this->enrollment->course_name} is waiting 👀",
            3 => "Don't lose your place — {$this->enrollment->course_name} is ready for you",
        ];

        $subject = $subjects[min($this->nudgeDay, 3)]
            ?? "Reminder: complete your payment for {$this->enrollment->course_name}";

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.student.pending_payment_nudge');
    }
}