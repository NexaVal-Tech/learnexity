<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;


class ReferralHistory extends Model
{
    use HasFactory;

    protected $table = 'referral_history';

    protected $fillable = [
        'referrer_id',
        'referred_user_id',
        'status',
        'reward_amount',
        'referred_at',
        'completed_at',
    ];

    protected $casts = [
        'reward_amount' => 'decimal:2',
        'referred_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the user who made the referral
     */
    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    /**
     * Get the user who was referred
     */
    public function referredUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_user_id');
    }
}