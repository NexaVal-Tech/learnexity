<?php

namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RegistrationOtpMail extends Mailable
{
    use Queueable, SerializesModels, UsesEmailTemplate;

    public function __construct(public string $otp) {}

    public function build()
    {
        $subject = $this->templatedSubject('Your Learnexity verification code');

        if ($this->hasCustomEmailBody()) {
            return $this->subject($subject)->view('emails.cms_template')->with($this->customEmailViewData());
        }

        return $this->subject($subject)
            ->view('emails.registration_otp');
    }

    // ── Website CMS → Emails ────────────────────────────────────────────
    protected function emailTemplateKey(): string
    {
        return 'registration_otp';
    }

    protected function emailTemplateVars(): array
    {
        return ['code' => $this->otp];
    }
}