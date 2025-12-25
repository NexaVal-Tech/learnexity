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




