<?php

namespace App\Notifications;

use App\Services\StudentEmailContent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Storage;

/**
 * Email an admin writes in Compose Message. The body is cleaned once when
 * it is sent (StudentEmailContent::toHtml) and personalised per student
 * here. Only what the admin wrote is shown — no automatic sign-off.
 */
class StudentMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $subject;
    public $messageBody;      // cleaned HTML
    public $attachmentPath;
    public $adminName;
    public $recipientName;    // used when sending to an address, not a User (test emails)

    public function __construct(
        string $subject,
        string $messageBody,
        ?string $attachmentPath = null,
        string $adminName = 'Admin',
        ?string $recipientName = null
    ) {
        $this->subject = $subject;
        $this->messageBody = $messageBody;
        $this->attachmentPath = $attachmentPath;
        $this->adminName = $adminName;
        $this->recipientName = $recipientName;

        $this->onQueue('emails');
        $this->delay(now()->addSeconds(2)); // Slight delay to prevent rate limiting
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $name = $notifiable instanceof \Illuminate\Database\Eloquent\Model
            ? (string) ($notifiable->getAttribute('name') ?? '')
            : (string) ($this->recipientName ?? '');

        $mail = (new MailMessage)
            ->subject(app(StudentEmailContent::class)->personalizeSubject($this->subject, $name))
            ->view('emails.student.broadcast', self::viewData($this->subject, $this->messageBody, $name));

        if ($this->attachmentPath && Storage::disk('public')->exists($this->attachmentPath)) {
            $mail->attach(
                Storage::disk('public')->path($this->attachmentPath),
                [
                    'as'   => preg_replace('/^\d+_/', '', basename($this->attachmentPath)),
                    'mime' => Storage::disk('public')->mimeType($this->attachmentPath),
                ]
            );
        }

        return $mail;
    }

    /** Data for the email view — shared with the admin preview. */
    public static function viewData(string $subject, string $cleanHtml, ?string $name): array
    {
        $content = app(StudentEmailContent::class);
        $site = rtrim((string) config('app.frontend_url', 'https://learnexity.org'), '/');

        return [
            'subject'   => $content->personalizeSubject($subject, $name),
            'firstName' => $content->names($name)[0],
            // Cleaned again here too (cheap, and it also covers messages that
            // were queued before this cleaner existed).
            'bodyHtml'  => $content->personalize($content->toHtml($cleanHtml), $name),
            'siteUrl'   => $site,
            'logoUrl'   => $site . '/images/Logo.png',
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'subject' => $this->subject,
            'message' => $this->messageBody,
            'sent_at' => now(),
        ];
    }
}
