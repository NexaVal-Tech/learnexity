<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** One person registered for the Learnexity TV webinar (free or premium). */
class TvRegistration extends Model
{
    protected $fillable = [
        'full_name', 'email', 'phone', 'tier',
        'learn_about', 'career_concern', 'heard_from', 'consultation_focus',
        'payment_status', 'amount', 'currency', 'payment_method', 'transaction_id', 'paid_at',
        'consultation_status', 'consultation_at', 'admin_notes',
        'join_link_sent_at', 'recording_sent_at', 'ip_address',
    ];

    protected $hidden = ['ip_address'];

    protected $casts = [
        'amount'            => 'float',
        'paid_at'           => 'datetime',
        'consultation_at'   => 'datetime',
        'join_link_sent_at' => 'datetime',
        'recording_sent_at' => 'datetime',
    ];

    public function isPremiumPaid(): bool
    {
        return $this->tier === 'premium' && $this->payment_status === 'paid';
    }
}
