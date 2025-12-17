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
        // Learning tracks
        'offers_one_on_one',
        'offers_group_mentorship',
        'offers_self_paced',
        'one_on_one_price',
        'group_mentorship_price',
        'self_paced_price',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_freemium' => 'boolean',
        'is_premium' => 'boolean',
        'offers_one_on_one' => 'boolean',
        'offers_group_mentorship' => 'boolean',
        'offers_self_paced' => 'boolean',
        'one_on_one_price' => 'decimal:2',
        'group_mentorship_price' => 'decimal:2',
        'self_paced_price' => 'decimal:2',
    ];

    // Append learning tracks info to JSON responses
    protected $appends = ['available_tracks', 'track_pricing'];

    public function enrollments(): HasMany
    {
        return $this->hasMany(CourseEnrollment::class, 'course_id', 'course_id');
    }

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

    /**
     * Get available learning tracks
     */
    public function getAvailableTracksAttribute(): array
    {
        $tracks = [];
        
        if ($this->offers_one_on_one) {
            $tracks[] = 'one_on_one';
        }
        if ($this->offers_group_mentorship) {
            $tracks[] = 'group_mentorship';
        }
        if ($this->offers_self_paced) {
            $tracks[] = 'self_paced';
        }
        
        // If no tracks are configured, default to self-paced
        if (empty($tracks)) {
            $tracks[] = 'self_paced';
        }
        
        return $tracks;
    }

    /**
     * Get pricing for each track
     */
    public function getTrackPricingAttribute(): array
    {
        return [
            'one_on_one' => $this->one_on_one_price ?? $this->price,
            'group_mentorship' => $this->group_mentorship_price ?? ($this->price * 0.7),
            'self_paced' => $this->self_paced_price ?? ($this->price * 0.5),
        ];
    }

    /**
     * Get price for a specific learning track
     */
    public function getPriceForTrack(string $track): float
    {
        switch ($track) {
            case 'one_on_one':
                return (float) ($this->one_on_one_price ?? $this->price);
            case 'group_mentorship':
                return (float) ($this->group_mentorship_price ?? ($this->price * 0.7));
            case 'self_paced':
                return (float) ($this->self_paced_price ?? ($this->price * 0.5));
            default:
                return (float) $this->price;
        }
    }
}