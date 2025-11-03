<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseEnrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'course_name',
        'course_price',
        'payment_status',
        'transaction_id',
        'enrollment_date',
        'payment_date',
    ];

    protected $casts = [
        'enrollment_date' => 'datetime',
        'payment_date' => 'datetime',
        'course_price' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isPaymentCompleted()
    {
        return $this->payment_status === 'completed';
    }

    public function scopePaid($query)
    {
        return $query->where('payment_status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('payment_status', 'pending');
    }
}