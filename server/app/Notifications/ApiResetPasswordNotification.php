<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ApiResetPasswordNotification extends BaseResetPassword
{
    protected string $resetUrl;

    public function __construct(string $token, string $resetUrl)
    {
        parent::__construct($token);
        $this->resetUrl = $resetUrl;
    }

    protected function resetUrl($notifiable)
    {
        return $this->resetUrl;
    }
}
