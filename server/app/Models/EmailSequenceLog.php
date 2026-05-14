<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailSequenceLog extends Model
{
    public $timestamps = false;

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

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if a specific email type was already sent to a user today.
     */
    public static function sentTodayFor(int $userId, string $type, ?string $courseId = null): bool
    {
        $query = static::where('user_id', $userId)
            ->where('email_type', $type)
            ->whereDate('sent_at', today());

        if ($courseId) {
            $query->where('course_id', $courseId);
        }

        return $query->exists();
    }

    /**
     * Check if an email type was sent within the last N hours.
     */
    public static function sentWithinHours(int $userId, string $type, int $hours, ?string $courseId = null): bool
    {
        $query = static::where('user_id', $userId)
            ->where('email_type', $type)
            ->where('sent_at', '>=', now()->subHours($hours));

        if ($courseId) {
            $query->where('course_id', $courseId);
        }

        return $query->exists();
    }

    /**
     * Record that an email was sent.
     */
    public static function record(int $userId, string $type, ?string $courseId = null, array $metadata = []): void
    {
        static::create([
            'user_id'    => $userId,
            'email_type' => $type,
            'course_id'  => $courseId,
            'metadata'   => $metadata ?: null,
            'sent_at'    => now(),
        ]);
    }
}