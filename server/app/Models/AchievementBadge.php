<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


// AchievementBadge Model
class AchievementBadge extends Model
{
    protected $fillable = [
        'course_id',
        'name',
        'description',
        'badge_icon',
        'badge_color',
        'unlock_type',
        'unlock_value',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    public function userBadges(): HasMany
    {
        return $this->hasMany(UserBadge::class);
    }

    public function isUnlockedBy($userId): bool
    {
        return $this->userBadges()
            ->where('user_id', $userId)
            ->exists();
    }
}