<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistrationFeeSetting extends Model
{
    protected $table = 'registration_fee_settings';

    protected $fillable = [
        'price_usd',
        'price_ngn',
        'deeptech_price_usd',
        'deeptech_price_ngn',
        'flexible_price_usd',
        'flexible_price_ngn',
    ];

    public const CATEGORY_DEEPTECH = 'deeptech';
    public const CATEGORY_FLEXIBLE = 'flexible';

    /**
     * This is a single-row settings table (created by the migration).
     * Always use this instead of ::first() directly so the app never
     * has to worry about the row missing.
     */
    public static function current(): self
    {
        return static::query()->first() ?? static::create(['price_usd' => 0, 'price_ngn' => 0]);
    }

    /**
     * Which category a learning track belongs to for registration-fee
     * purposes. one_on_one/group_mentorship are the "Deep-Tech" tracks
     * (see Courses.tsx); self_paced is "Flexible". A course can offer more
     * than one track, so this is decided per-enrollment by the track the
     * student actually picked, not by a fixed label on the course itself.
     */
    public static function categoryForTrack(?string $learningTrack): string
    {
        return in_array($learningTrack, ['one_on_one', 'group_mentorship'], true)
            ? self::CATEGORY_DEEPTECH
            : self::CATEGORY_FLEXIBLE;
    }

    /**
     * @deprecated Use priceForCategory() — kept only so nothing that still
     * calls this (if anything) breaks; it now just returns the flexible
     * tier's price as a reasonable default.
     */
    public function priceForCurrency(string $currency): float
    {
        return $this->priceForCategory(self::CATEGORY_FLEXIBLE, $currency);
    }

    public function priceForCategory(string $category, string $currency): float
    {
        $isNgn = strtoupper($currency) === 'NGN';

        if ($category === self::CATEGORY_DEEPTECH) {
            return $isNgn ? (float) $this->deeptech_price_ngn : (float) $this->deeptech_price_usd;
        }

        return $isNgn ? (float) $this->flexible_price_ngn : (float) $this->flexible_price_usd;
    }
}