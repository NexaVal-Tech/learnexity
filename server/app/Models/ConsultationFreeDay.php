<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsultationFreeDay extends Model
{
    protected $fillable = ['date', 'note'];

    protected $casts = [
        'date' => 'date:Y-m-d',
    ];

    public static function isFreeDay(string $date): bool
    {
        return static::where('date', $date)->exists();
    }
}
