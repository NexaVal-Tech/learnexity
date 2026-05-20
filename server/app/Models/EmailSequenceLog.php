<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Tracks every transactional/sequence email ever sent.
 *
 * Columns:
 *  id, user_id, email_type, course_id (nullable), metadata (json), sent_at, created_at, updated_at
 */
class EmailSequenceLog extends Model
{
    protected $fillable = [
        'user_id',
        'email_type',
        'course_id',
        'metadata',
        'sent_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'sent_at'  => 'datetime',
    ];

    // ── Writers ───────────────────────────────────────────────────────────────

    /**
     * Record that an email was sent.
     */
    public static function record(
        int $userId,
        string $emailType,
        ?string $courseId = null,
        array $metadata = []
    ): self {
        return self::create([
            'user_id'    => $userId,
            'email_type' => $emailType,
            'course_id'  => $courseId,
            'metadata'   => $metadata,
            'sent_at'    => now(),
        ]);
    }

    public $timestamps = false;

    // ── Readers ───────────────────────────────────────────────────────────────

    /**
     * Was this email type sent to this user today (calendar day)?
     * Optionally scoped to a course.
     */
    public static function sentTodayFor(
        int $userId,
        string $emailType,
        ?string $courseId = null
    ): bool {
        $query = self::where('user_id', $userId)
            ->where('email_type', $emailType)
            ->whereDate('sent_at', Carbon::today());

        if ($courseId !== null) {
            $query->where('course_id', $courseId);
        }

        return $query->exists();
    }

    /**
     * Was this email type sent to this user within the last N hours?
     * Optionally scoped to a course.
     */
    public static function sentWithinHours(
        int $userId,
        string $emailType,
        int $hours,
        ?string $courseId = null
    ): bool {
        $query = self::where('user_id', $userId)
            ->where('email_type', $emailType)
            ->where('sent_at', '>=', now()->subHours($hours));

        if ($courseId !== null) {
            $query->where('course_id', $courseId);
        }

        return $query->exists();
    }

    /**
     * Was this email type sent within the last N days?
     */
    public static function sentWithinDays(
        int $userId,
        string $emailType,
        int $days,
        ?string $courseId = null
    ): bool {
        return self::sentWithinHours($userId, $emailType, $days * 24, $courseId);
    }

    /**
     * How many times has this email been sent to this user (optionally per course)?
     */
    public static function countSent(
        int $userId,
        string $emailType,
        ?string $courseId = null
    ): int {
        $query = self::where('user_id', $userId)
            ->where('email_type', $emailType);

        if ($courseId !== null) {
            $query->where('course_id', $courseId);
        }

        return $query->count();
    }
}