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
            $sessionType === 'one_on_one'       && $currency === 'USD' => (float) $this->one_on_one_price_usd,
            $sessionType === 'one_on_one'       && $currency === 'NGN' => (float) $this->one_on_one_price_ngn,
            $sessionType === 'group_mentorship' && $currency === 'USD' => (float) $this->group_price_usd,
            $sessionType === 'group_mentorship' && $currency === 'NGN' => (float) $this->group_price_ngn,
            $sessionType === 'starter_group'    && $currency === 'USD' => (float) $this->starter_group_price_usd,
            $sessionType === 'starter_group'    && $currency === 'NGN' => (float) $this->starter_group_price_ngn,
            default                                                     => 0.0,
        };
    }
    
    // ── getBundlePrice ────────────────────────────────────────────────────────────
    public function getBundlePrice(string $sessionType, string $currency): float
    {
        return match (true) {
            $sessionType === 'one_on_one'       && $currency === 'USD' => (float) $this->bundle_one_on_one_usd,
            $sessionType === 'one_on_one'       && $currency === 'NGN' => (float) $this->bundle_one_on_one_ngn,
            $sessionType === 'group_mentorship' && $currency === 'USD' => (float) $this->bundle_group_usd,
            $sessionType === 'group_mentorship' && $currency === 'NGN' => (float) $this->bundle_group_ngn,
            $sessionType === 'starter_group'    && $currency === 'USD' => (float) $this->bundle_starter_group_usd,
            $sessionType === 'starter_group'    && $currency === 'NGN' => (float) $this->bundle_starter_group_ngn,
            default                                                     => 0.0,
        };
    }
    
    // ── getFinalPrice ─────────────────────────────────────────────────────────────
    public function getFinalPrice(
        string $sessionType,
        string $currency,
        string $paymentType,
        bool   $isBundle
    ): float {
        $basePrice = $isBundle
            ? $this->getBundlePrice($sessionType, $currency)
            : $this->getStandalonePrice($sessionType, $currency);
    
        if ($paymentType === 'onetime' && $basePrice > 0) {
            $discount = (float) $this->onetime_discount_percent / 100;
            return round($basePrice * (1 - $discount), 2);
        }
    
        return $basePrice;
    }
    
    // ── getInstallmentAmount ──────────────────────────────────────────────────────
    public function getInstallmentAmount(string $sessionType, string $currency, bool $isBundle): float
    {
        $total = $isBundle
            ? $this->getBundlePrice($sessionType, $currency)
            : $this->getStandalonePrice($sessionType, $currency);
    
        // Installments are always 3 payments for the bundle, or duration_months for standalone
        $months = $isBundle ? 3 : (int) $this->duration_months;
    
        return $months > 0 ? round($total / $months, 2) : $total;
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