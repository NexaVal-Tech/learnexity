<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KidsInstallmentPayment extends Model
{
    protected $fillable = [
        'kids_enrollment_id',
        'installment_number',
        'amount',
        'currency',
        'status',
        'transaction_id',
        'gateway',
        'paid_at',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'amount'  => 'float',
    ];

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(KidsEnrollment::class, 'kids_enrollment_id');
    }
}