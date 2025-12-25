<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


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
