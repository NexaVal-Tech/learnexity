<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Storage;

class StudentMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $subject;
    public $messageBody;
    public $attachmentPath;
    public $adminName;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $subject, string $messageBody, ?string $attachmentPath = null, string $adminName = 'Admin')
    {
        $this->subject = $subject;
        $this->messageBody = $messageBody;
        $this->attachmentPath = $attachmentPath;
        $this->adminName = $adminName;
        
        // Set queue configuration
        $this->onQueue('emails');
        $this->delay(now()->addSeconds(2)); // Slight delay to prevent rate limiting
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject($this->subject)
            ->greeting("Hello {$notifiable->name},")
            ->line($this->messageBody)
            ->line('---')
            ->line("Best regards,")
            ->line($this->adminName);

        // Attach file if present
        if ($this->attachmentPath && Storage::disk('public')->exists($this->attachmentPath)) {
            $mail->attach(
                Storage::disk('public')->path($this->attachmentPath),
                [
                    'as' => basename($this->attachmentPath),
                    'mime' => Storage::disk('public')->mimeType($this->attachmentPath),
                ]
            );
        }

        return $mail;
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'subject' => $this->subject,
            'message' => $this->messageBody,
            'sent_at' => now(),
        ];
    }
}