<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistrationOtp extends Model
{
    protected $fillable = [
        'email', 'referral_code',
        'otp_hash', 'attempts', 'expires_at',
        'verified_at', 'token_hash', 'token_expires_at',
        'resend_count', 'last_sent_at',
    ];

    protected $casts = [
        'expires_at'       => 'datetime',
        'verified_at'      => 'datetime',
        'token_expires_at' => 'datetime',
        'last_sent_at'     => 'datetime',
    ];
}