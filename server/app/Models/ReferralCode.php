<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReferralCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'referral_code',
        'total_referrals',
        'successful_referrals',
        'pending_referrals',
        'total_rewards',
        'current_streak_months',
        'last_referral_at',
    ];

    protected $casts = [
        'total_rewards' => 'decimal:2',
        'last_referral_at' => 'datetime',
    ];

    /**
     * Get the user that owns the referral code
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all referrals made with this code
     */
    public function referrals(): HasMany
    {
        return $this->hasMany(ReferralHistory::class, 'referrer_id', 'user_id');
    }
}
