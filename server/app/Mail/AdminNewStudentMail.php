<?php
// FILE: app/Mail/AdminNewStudentMail.php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminNewStudentMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public ?string $referralCode = null
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Student Registration — ' . $this->user->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin.new_student',
        );
    }
}