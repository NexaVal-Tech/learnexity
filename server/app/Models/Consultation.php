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
        'course',
        'message',
        'preferred_date',
        'preferred_time',
        'status',
        'payment_status',
        'notes',
        'user_id',
    ];

    protected $casts = [
        'preferred_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}