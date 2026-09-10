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
        'approved_at',
        'reminders_sent',
    ];

    protected $casts = [
        'answers'        => 'array',
        'is_used'        => 'boolean',
        'used_at'        => 'datetime',
        'approved_at'    => 'datetime',
        'reminders_sent' => 'array',
    ];

    /**
     * Computed, display-only countdown fields — automatically included on
     * every JSON response of this model (scholarship application result,
     * course-scoped lookup, "my applications" list, admin listing) with no
     * per-controller wiring needed.
     */
    protected $appends = ['days_remaining', 'countdown_ends_at'];

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

    /**
     * Cosmetic 30-day countdown window — purely a UI nudge, does NOT cause
     * the scholarship to actually expire or stop being redeemable. Null
     * when there's nothing to count down (not approved, no award
     * timestamp, or already used).
     */
    public function getDaysRemainingAttribute(): ?int
    {
        if ($this->status !== 'approved' || $this->approved_at === null || $this->is_used) {
            return null;
        }

        $daysElapsed = (int) $this->approved_at->diffInDays(now());

        return max(0, 30 - $daysElapsed);
    }

    public function getCountdownEndsAtAttribute(): ?string
    {
        if ($this->status !== 'approved' || $this->approved_at === null || $this->is_used) {
            return null;
        }

        return $this->approved_at->copy()->addDays(30)->toIso8601String();
    }
}
