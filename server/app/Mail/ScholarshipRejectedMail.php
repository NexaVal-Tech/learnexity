<?php

namespace App\Mail;

use App\Models\Scholarship;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Sent when an admin rejects a scholarship application. The student may apply again. */
class ScholarshipRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user, public Scholarship $scholarship, public ?string $note = null) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your Learnexity scholarship application — ' . $this->scholarship->course_name);
    }

    public function content(): Content
    {
        $site = rtrim((string) config('app.frontend_url', 'https://learnexity.org'), '/');

        return new Content(view: 'emails.student.scholarship_rejected', with: [
            'firstName'   => explode(' ', trim((string) $this->user->name))[0] ?: 'there',
            'course'      => $this->scholarship->course_name,
            'note'        => $this->note,
            'coursesUrl'  => $site . '/courses',
            'courseUrl'   => $site . '/courses/' . rawurlencode((string) $this->scholarship->course_id),
            'whatsappUrl' => 'https://wa.me/12762528415',
            'siteUrl'     => $site,
        ]);
    }
}
