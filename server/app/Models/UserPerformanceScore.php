<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserPerformanceScore extends Model
{
    protected $fillable = [
        'user_id',
        'course_id',
        'speed_score',
        'quality_score',
        'reliability_score',
        'problem_solving_score',
        'overall_score',
        'sprints_completed',
        'total_sprints',
        'login_streak_days',
        'total_logins',
        'last_login_at',
        'last_sprint_completed_at',
    ];

    protected $casts = [
        'last_login_at'            => 'datetime',
        'last_sprint_completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}