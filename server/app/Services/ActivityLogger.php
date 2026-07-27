<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Central place to record "something happened on the site" for the admin
 * activity feed / analytics page. Deliberately fire-and-forget — a logging
 * failure must never break the request that triggered it.
 */
class ActivityLogger
{
    public static function log(
        string $eventType,
        string $description,
        string $actorType = 'user',
        ?int $actorId = null,
        ?string $actorName = null,
        array $metadata = [],
        ?string $courseId = null,
        ?Request $request = null
    ): void {
        try {
            $request ??= request();

            ActivityLog::create([
                'event_type'  => $eventType,
                'actor_type'  => $actorType,
                'actor_id'    => $actorId,
                'actor_name'  => $actorName,
                'description' => $description,
                'course_id'   => $courseId,
                'metadata'    => $metadata,
                'ip_address'  => $request?->ip(),
                'user_agent'  => $request?->userAgent(),
                'created_at'  => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('ActivityLogger failed', ['event' => $eventType, 'error' => $e->getMessage()]);
        }
    }
}
