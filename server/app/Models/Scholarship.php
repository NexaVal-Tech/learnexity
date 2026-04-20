<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Scholarship extends Model
{
    protected $fillable = [
        'user_id',
        'course_id',
        'course_name',
        'status',
        'score',
        'location_bonus',
        'total_score',
        'discount_percentage',
        'answers',
        'is_used',
        'used_in_enrollment_id',
        'used_at',
        'review_notes',
        'applicant_country',
        'applicant_ip',
    ];

    protected $casts = [
        'answers'   => 'array',
        'is_used'   => 'boolean',
        'used_at'   => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(CourseEnrollment::class, 'used_in_enrollment_id');
    }

    /**
     * Mark this scholarship as used by a specific enrollment.
     * Called right before/after payment is confirmed.
     */
    public function markAsUsed(int $enrollmentId): void
    {
        $this->update([
            'is_used'               => true,
            'used_in_enrollment_id' => $enrollmentId,
            'used_at'               => now(),
        ]);
    }

    /**
     * Is this scholarship still redeemable?
     */
    public function isRedeemable(): bool
    {
        return $this->status === 'approved' && ! $this->is_used;
    }
}