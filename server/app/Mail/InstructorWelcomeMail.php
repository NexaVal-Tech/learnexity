<?php

namespace App\Mail;

use App\Models\Instructor;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InstructorWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Instructor $instructor,
        public string $plainPassword,
        public bool $isReset = false
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->isReset
                ? 'Your Learnexity Instructor Password Has Been Reset'
                : 'Welcome to Learnexity — Your Instructor Account is Ready'
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.instructor.welcome');
    }

    public function attachments(): array
    {
        return [];
    }
}