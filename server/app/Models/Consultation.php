<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'consultation_type',
        'source',
        'course',
        'message',
        'preferred_date',
        'preferred_time',
        'status',
        'payment_status',
        'notes',
        'user_id',
        'amount',
        'currency',
        'transaction_id',
        'payment_method',
    ];

    protected $casts = [
        // Format modifier keeps JSON output a plain "Y-m-d" string (what the
        // admin dashboard and booking widgets expect) instead of Eloquent's
        // default full ISO-8601 datetime, which broke `new Date(x + 'T12:00:00')`
        // parsing on the frontend and showed "Invalid Date".
        'preferred_date' => 'date:Y-m-d',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}