<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// CourseMaterial Model
class CourseMaterial extends Model
{
    protected $fillable = [
        'course_id',
        'sprint_name',
        'sprint_number',
        'order',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(MaterialItem::class)->orderBy('order');
    }

    public function progress(): HasMany
    {
        return $this->hasMany(SprintProgress::class);
    }

    public function userProgress($userId)
    {
        return $this->progress()->where('user_id', $userId)->first();
    }
}

// MaterialItem Model
class MaterialItem extends Model
{
    protected $fillable = [
        'course_material_id',
        'title',
        'type',
        'file_path',
        'file_url',
        'file_size',
        'order',
    ];

    public function courseMaterial(): BelongsTo
    {
        return $this->belongsTo(CourseMaterial::class);
    }

    public function progress(): HasMany
    {
        return $this->hasMany(MaterialItemProgress::class);
    }

    public function isCompletedBy($userId): bool
    {
        return $this->progress()
            ->where('user_id', $userId)
            ->where('is_completed', true)
            ->exists();
    }
}

// SprintProgress Model
class SprintProgress extends Model
{
    protected $fillable = [
        'user_id',
        'course_id',
        'course_material_id',
        'progress_percentage',
        'completed_items',
        'total_items',
        'completed_at',
    ];

    protected $casts = [
        'progress_percentage' => 'decimal:2',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function courseMaterial(): BelongsTo
    {
        return $this->belongsTo(CourseMaterial::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }
}

// MaterialItemProgress Model
class MaterialItemProgress extends Model
{
    protected $table = 'material_item_progress';
    
    protected $fillable = [
        'user_id',
        'material_item_id',
        'is_completed',
        'completed_at',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function materialItem(): BelongsTo
    {
        return $this->belongsTo(MaterialItem::class);
    }
}

// UserCourseStatistic Model
class UserCourseStatistic extends Model
{
    protected $fillable = [
        'user_id',
        'course_id',
        'overall_progress',
        'total_sprints',
        'completed_sprints',
        'time_spent_minutes',
        'sprints_ahead',
    ];

    protected $casts = [
        'overall_progress' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }
}

// CohortLeaderboard Model
class CohortLeaderboard extends Model
{
    protected $fillable = [
        'course_id',
        'cohort_name',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(CohortParticipant::class)->orderBy('rank');
    }
}

// CohortParticipant Model
class CohortParticipant extends Model
{
    protected $fillable = [
        'cohort_leaderboard_id',
        'user_id',
        'rank',
        'sprint1_score',
        'sprint2_score',
        'sprint3_score',
        'sprint4_score',
        'overall_score',
    ];

    protected $casts = [
        'sprint1_score' => 'decimal:2',
        'sprint2_score' => 'decimal:2',
        'sprint3_score' => 'decimal:2',
        'sprint4_score' => 'decimal:2',
        'overall_score' => 'decimal:2',
    ];

    public function cohort(): BelongsTo
    {
        return $this->belongsTo(CohortLeaderboard::class, 'cohort_leaderboard_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

// ExternalResource Model
class ExternalResource extends Model
{
    protected $fillable = [
        'course_id',
        'category',
        'title',
        'description',
        'url',
        'source',
        'duration',
        'order',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }
}

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

// UserBadge Model
class UserBadge extends Model
{
    protected $fillable = [
        'user_id',
        'achievement_badge_id',
        'unlocked_at',
    ];

    protected $casts = [
        'unlocked_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function badge(): BelongsTo
    {
        return $this->belongsTo(AchievementBadge::class, 'achievement_badge_id');
    }
}