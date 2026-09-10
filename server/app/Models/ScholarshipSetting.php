<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Single platform-wide row (same singleton pattern as
 * RegistrationFeeSetting::current()) holding the scholarship application
 * deadline used to drive the homepage countdown banner.
 */
class ScholarshipSetting extends Model
{
    protected $fillable = [
        'deadline',
        'is_active',
    ];

    protected $casts = [
        'deadline'  => 'datetime',
        'is_active' => 'boolean',
    ];

    public static function current(): self
    {
        return static::query()->first() ?? static::create([
            'deadline'  => null,
            'is_active' => false,
        ]);
    }

    /**
     * Whether the banner should actually be shown right now: admin has it
     * switched on, a deadline is set, and that deadline hasn't passed yet.
     */
    public function isCurrentlyActive(): bool
    {
        return $this->is_active
            && $this->deadline !== null
            && $this->deadline->isFuture();
    }
}
