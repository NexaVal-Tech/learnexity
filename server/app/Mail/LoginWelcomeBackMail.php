<?php
// FILE: app/Mail/LoginWelcomeBackMail.php
namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LoginWelcomeBackMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public int $loginStreakDays,
        public array $courseProgress   // [['name'=>'...','progress'=>55], ...]
    ) {}

    public function envelope(): Envelope
    {
        $streak = $this->loginStreakDays;
        $subject = $streak >= 7
            ? "{$streak}-day streak! Welcome back, {$this->user->name}"
            : "Welcome back, {$this->user->name}!";
        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.student.login_welcome_back');
    }
}