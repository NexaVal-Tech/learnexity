<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Single row of settings for the Learnexity TV webinar page. */
class TvWebinarSetting extends Model
{
    protected $fillable = [
        'title', 'event_at', 'event_time_label', 'price_usd', 'price_ngn',
        'join_link', 'recording_link', 'whatsapp_number',
        'registration_open', 'premium_open', 'premium_capacity',
    ];

    protected $casts = [
        'event_at'          => 'datetime',
        'price_usd'         => 'float',
        'price_ngn'         => 'float',
        'registration_open' => 'boolean',
        'premium_open'      => 'boolean',
        'premium_capacity'  => 'integer',
    ];

    public static function current(): self
    {
        return static::query()->first() ?? static::create([]);
    }

    public function premiumSeatsLeft(): ?int
    {
        if (!$this->premium_capacity) return null;
        $taken = TvRegistration::where('tier', 'premium')->where('payment_status', 'paid')->count();
        return max(0, $this->premium_capacity - $taken);
    }

    /** Nigerian visitors pay in naira through Paystack only when a naira price is set. */
    public function usesPaystackFor(?string $countryCode): bool
    {
        return $countryCode === 'NG' && (float) $this->price_ngn > 0;
    }
}
