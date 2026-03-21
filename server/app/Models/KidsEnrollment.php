<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class KidsEnrollment extends Model
{
    protected $fillable = [
        'kids_course_id',
        'parent_name', 'parent_email', 'parent_phone',
        'student_name', 'student_age',
        'enrollment_type', 'paired_enrollment_id',
        'session_type', 'chosen_track',
        'payment_type', 'payment_status', 'currency',
        'total_price', 'original_price', 'discount_applied', 'amount_paid',
        'total_installments', 'installments_paid',
        'next_payment_due', 'last_payment_at',
        'has_access', 'skipped_foundation',
        'transaction_id', 'stripe_session_id', 'paystack_reference',
        'resume_token', 'enrolled_at',
    ];

    protected $casts = [
        'has_access'         => 'boolean',
        'skipped_foundation' => 'boolean',
        'next_payment_due'   => 'datetime',
        'last_payment_at'    => 'datetime',
        'enrolled_at'        => 'datetime',
        'total_price'        => 'float',
        'original_price'     => 'float',
        'discount_applied'   => 'float',
        'amount_paid'        => 'float',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (self $model) {
            if (empty($model->resume_token)) {
                $model->resume_token = Str::random(40) . '-' . time();
            }
        });
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function course(): BelongsTo
    {
        return $this->belongsTo(KidsCourse::class, 'kids_course_id');
    }

    public function installmentPayments(): HasMany
    {
        return $this->hasMany(KidsInstallmentPayment::class);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function remainingBalance(): float
    {
        return max(0, $this->total_price - $this->amount_paid);
    }

    /**
     * For installments: total_price / 3.
     * For one-time: the full total_price (already discounted).
     */
    public function nextInstallmentAmount(): float
    {
        if ($this->payment_type === 'installment') {
            return round($this->total_price / 3, 2);
        }
        return $this->total_price;
    }

    public function isFullyPaid(): bool
    {
        return $this->payment_status === 'completed';
    }

    public function installmentsRemaining(): int
    {
        return max(0, $this->total_installments - $this->installments_paid);
    }
}