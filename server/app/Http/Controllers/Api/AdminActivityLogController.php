<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminActivityLogController extends Controller
{
    /**
     * Paginated, filterable activity feed for the admin Analytics page.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::query();

        if ($request->filled('event_type')) {
            $query->where('event_type', $request->event_type);
        }
        if ($request->filled('actor_type')) {
            $query->where('actor_type', $request->actor_type);
        }
        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('actor_name', 'like', "%{$search}%");
            });
        }
        if ($request->filled('from')) {
            $query->where('created_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->where('created_at', '<=', $request->to);
        }

        $logs = $query->latest('created_at')->paginate(30);

        return response()->json($logs);
    }

    /**
     * Aggregate counts for the analytics dashboard: totals by event type,
     * a 14-day activity trend, and the most active event types.
     */
    public function summary(): JsonResponse
    {
        $totalEvents = ActivityLog::count();
        $last24h     = ActivityLog::where('created_at', '>=', now()->subDay())->count();
        $last7d      = ActivityLog::where('created_at', '>=', now()->subDays(7))->count();

        $byType = ActivityLog::select('event_type', DB::raw('count(*) as total'))
            ->groupBy('event_type')
            ->orderByDesc('total')
            ->get();

        $trend = ActivityLog::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as total')
            )
            ->where('created_at', '>=', now()->subDays(14))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $activeUsers = ActivityLog::where('actor_type', 'user')
            ->select('actor_id', 'actor_name', DB::raw('count(*) as total'))
            ->whereNotNull('actor_id')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('actor_id', 'actor_name')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        return response()->json([
            'total_events' => $totalEvents,
            'last_24h'     => $last24h,
            'last_7d'      => $last7d,
            'by_type'      => $byType,
            'trend'        => $trend,
            'active_users' => $activeUsers,
        ]);
    }
}
