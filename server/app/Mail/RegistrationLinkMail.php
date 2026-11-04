<?php

namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/** Sign-up: "Verify email" button that leads to the create-password page. */
class RegistrationLinkMail extends Mailable
{
    use Queueable, SerializesModels, UsesEmailTemplate;

    public function __construct(public string $url) {}

    public function build()
    {
        $subject = $this->templatedSubject('Verify your email to finish signing up');

        if ($this->hasCustomEmailBody()) {
            return $this->subject($subject)->view('emails.cms_template')->with($this->customEmailViewData());
        }

        return $this->subject($subject)->view('emails.registration_link')->with(['url' => $this->url]);
    }

    protected function emailTemplateKey(): string
    {
        return 'registration_link';
    }

    protected function emailTemplateVars(): array
    {
        return ['link' => $this->url];
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        return $this->url;
    }
}
