<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'project',
        'description',
        'hero_image',
        'secondary_image',
        'duration',
        'level',
        'price',
        'is_freemium',
        'is_premium',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_freemium' => 'boolean',
        'is_premium' => 'boolean',
    ];

    public function tools(): HasMany
    {
        return $this->hasMany(CourseTool::class)->orderBy('order');
    }

    public function learnings(): HasMany
    {
        return $this->hasMany(CourseLearning::class)->orderBy('order');
    }

    public function benefits(): HasMany
    {
        return $this->hasMany(CourseBenefit::class)->orderBy('order');
    }

    public function careerPaths(): HasMany
    {
        return $this->hasMany(CourseCareerPath::class)->orderBy('order');
    }

    public function industries(): HasMany
    {
        return $this->hasMany(CourseIndustry::class)->orderBy('order');
    }

    public function salary(): HasOne
    {
        return $this->hasOne(CourseSalary::class);
    }
}