<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Admin-only organizational grouping for courses — e.g. "Data Analysis" as a
 * group containing several related courses. One group can contain many
 * courses; a course can also stand alone with no group. Purely for admin
 * organization for now, no user-facing display yet.
 */
class CourseGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }
}
