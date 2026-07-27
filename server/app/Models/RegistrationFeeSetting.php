<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistrationFeeSetting extends Model
{
    protected $table = 'registration_fee_settings';

    protected $fillable = [
        'price_usd',
        'price_ngn',
    ];

    /**
     * This is a single-row settings table (created by the migration).
     * Always use this instead of ::first() directly so the app never
     * has to worry about the row missing.
     */
    public static function current(): self
    {
        return static::query()->first() ?? static::create(['price_usd' => 0, 'price_ngn' => 0]);
    }

    public function priceForCurrency(string $currency): float
    {
        return strtoupper($currency) === 'NGN' ? (float) $this->price_ngn : (float) $this->price_usd;
    }
}