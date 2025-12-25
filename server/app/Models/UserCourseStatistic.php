<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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