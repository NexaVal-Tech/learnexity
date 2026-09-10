<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;



// UserBadge Model
class UserBadge extends Model
{
    protected $fillable = [
        'user_id',
        'achievement_badge_id',
        'unlocked_at',
        'reference_number',
        'pdf_path',
        'rendered_at',
    ];

    protected $casts = [
        'unlocked_at' => 'datetime',
        'rendered_at' => 'datetime',
    ];

    protected $appends = ['download_url'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function badge(): BelongsTo
    {
        return $this->belongsTo(AchievementBadge::class, 'achievement_badge_id');
    }

    public function getDownloadUrlAttribute(): ?string
    {
        return $this->pdf_path ? url("/api/badges/{$this->id}/download") : null;
    }
}