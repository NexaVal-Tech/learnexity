<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
