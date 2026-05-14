<?php
// ──────────────────────────────────────────────────────────────────────────────
// FILE: app/Mail/DailyCheckinMail.php
// ──────────────────────────────────────────────────────────────────────────────
namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DailyCheckinMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public array $enrolledCourses,  // [['name'=>'...','progress'=>40,'next_sprint'=>'...'], ...]
        public int $loginStreakDays
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "📚 Your Daily Learning Check-in — {$this->user->name}");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.student.daily_checkin');
    }
}