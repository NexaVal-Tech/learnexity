<?php

namespace App\Listeners;

use App\Mail\WelcomeEmail;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendWelcomeEmail
{
    /**
     * Handle the Verified event.
     * Fires automatically when a user clicks the email verification link.
     */
    public function handle(Verified $event): void
    {
        /** @var \App\Models\User $user */
        $user = $event->user;

        Log::info('📧 [WELCOME EMAIL] Sending welcome email after verification', [
            'user_id' => $user->id,
            'email'   => $user->email,
        ]);

        try {
            Mail::to($user->email)->send(new WelcomeEmail($user));

            Log::info('✅ [WELCOME EMAIL] Sent successfully', [
                'user_id' => $user->id,
                'email'   => $user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('❌ [WELCOME EMAIL] Failed to send', [
                'user_id' => $user->id,
                'email'   => $user->email,
                'error'   => $e->getMessage(),
            ]);
        }
    }
}