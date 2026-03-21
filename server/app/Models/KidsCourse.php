<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KidsCourse extends Model
{
    protected $fillable = [
        'slug', 'name', 'description', 'emoji', 'color',
        'duration_months', 'is_foundation',
        'one_on_one_price_usd', 'group_price_usd',
        'one_on_one_price_ngn', 'group_price_ngn',
        'bundle_one_on_one_usd', 'bundle_group_usd',
        'bundle_one_on_one_ngn', 'bundle_group_ngn',
        'onetime_discount_percent',
        'is_active', 'order',
    ];

    protected $casts = [
        'is_active'                => 'boolean',
        'is_foundation'            => 'boolean',
        'one_on_one_price_usd'     => 'float',
        'group_price_usd'          => 'float',
        'one_on_one_price_ngn'     => 'float',
        'group_price_ngn'          => 'float',
        'bundle_one_on_one_usd'    => 'float',
        'bundle_group_usd'         => 'float',
        'bundle_one_on_one_ngn'    => 'float',
        'bundle_group_ngn'         => 'float',
        'onetime_discount_percent' => 'float',
    ];

    public function enrollments(): HasMany
    {
        return $this->hasMany(KidsEnrollment::class);
    }

    // ── Pricing helpers ───────────────────────────────────────────────────────

    /**
     * Standalone price (no DF bundled).
     */
    public function getStandalonePrice(string $sessionType, string $currency): float
    {
        return match (true) {
            $sessionType === 'one_on_one' && $currency === 'USD' => $this->one_on_one_price_usd,
            $sessionType === 'one_on_one' && $currency === 'NGN' => $this->one_on_one_price_ngn,
            $sessionType === 'group_mentorship' && $currency === 'USD' => $this->group_price_usd,
            $sessionType === 'group_mentorship' && $currency === 'NGN' => $this->group_price_ngn,
            default => $this->group_price_usd,
        };
    }

    /**
     * Bundle price (DF + this track combined — only valid on track rows).
     */
    public function getBundlePrice(string $sessionType, string $currency): float
    {
        return match (true) {
            $sessionType === 'one_on_one' && $currency === 'USD' => $this->bundle_one_on_one_usd,
            $sessionType === 'one_on_one' && $currency === 'NGN' => $this->bundle_one_on_one_ngn,
            $sessionType === 'group_mentorship' && $currency === 'USD' => $this->bundle_group_usd,
            $sessionType === 'group_mentorship' && $currency === 'NGN' => $this->bundle_group_ngn,
            default => $this->bundle_group_usd,
        };
    }

    /**
     * Final price after applying one-time discount (if paymentType = 'onetime').
     * Installment = full price, no discount.
     */
    public function getFinalPrice(string $sessionType, string $currency, string $paymentType, bool $isBundle = false): float
    {
        $base = $isBundle
            ? $this->getBundlePrice($sessionType, $currency)
            : $this->getStandalonePrice($sessionType, $currency);

        if ($paymentType === 'onetime' && $this->onetime_discount_percent > 0) {
            return round($base * (1 - $this->onetime_discount_percent / 100), 2);
        }

        return $base;
    }

    /**
     * Per-installment amount (full price ÷ 3, no discount).
     */
    public function getInstallmentAmount(string $sessionType, string $currency, bool $isBundle = false): float
    {
        $base = $isBundle
            ? $this->getBundlePrice($sessionType, $currency)
            : $this->getStandalonePrice($sessionType, $currency);

        return round($base / 3, 2);
    }

    /**
     * Discount amount in currency units.
     */
    public function getDiscountAmount(string $sessionType, string $currency, bool $isBundle = false): float
    {
        if ($this->onetime_discount_percent <= 0) return 0;

        $base = $isBundle
            ? $this->getBundlePrice($sessionType, $currency)
            : $this->getStandalonePrice($sessionType, $currency);

        return round($base * $this->onetime_discount_percent / 100, 2);
    }
}