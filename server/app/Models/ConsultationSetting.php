<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsultationSetting extends Model
{
    protected $fillable = ['price_usd', 'price_ngn'];

    public static function current(): self
    {
        return static::query()->firstOrCreate([], ['price_usd' => 10, 'price_ngn' => 10000]);
    }
}