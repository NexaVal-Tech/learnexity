<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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