<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class ConsultationAvailability extends Model
{
    protected $fillable = [
        'source',
        'weekday',
        'specific_date',
        'start_time',
        'end_time',
        'slot_interval_minutes',
        'is_recurring',
        'is_active',
        'label',
    ];

    protected $casts = [
        'is_recurring' => 'boolean',
        'is_active'    => 'boolean',
        'specific_date'=> 'date:Y-m-d',
        'weekday'      => 'integer',
        'slot_interval_minutes' => 'integer',
    ];

    const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    /** Historical hardcoded defaults, used when a source has no configured rows at all. */
    const DEFAULT_WEEKDAYS = [1, 2, 3, 4, 5]; // Mon–Fri
    const DEFAULT_START = '09:00';
    const DEFAULT_END = '16:30';
    const DEFAULT_INTERVAL = 30;

    /** Active rules that apply to a given source (source-specific rows first, then source-agnostic rows). */
    public static function forSource(?string $source)
    {
        return static::where('is_active', true)
            ->where(function ($q) use ($source) {
                $q->whereNull('source')->orWhere('source', $source);
            })
            ->get();
    }

    /**
     * Resolve the bookable window for one calendar date, given a source.
     * Returns null if that date is not available at all.
     */
    public static function windowForDate(string $date, ?string $source): ?array
    {
        $rules = static::forSource($source);

        if ($rules->isEmpty()) {
            // No admin configuration for this source — preserve legacy behavior.
            $carbon = Carbon::parse($date);
            if (in_array($carbon->dayOfWeek, self::DEFAULT_WEEKDAYS, true)) {
                return [
                    'start_time' => self::DEFAULT_START,
                    'end_time'   => self::DEFAULT_END,
                    'slot_interval_minutes' => self::DEFAULT_INTERVAL,
                ];
            }
            return null;
        }

        $carbon = Carbon::parse($date);

        // One-off specific-date rules take priority over recurring weekday rules.
        $oneOff = $rules->first(fn ($r) => !$r->is_recurring && $r->specific_date && $r->specific_date->format('Y-m-d') === $carbon->format('Y-m-d'));
        if ($oneOff) {
            return [
                'start_time' => substr($oneOff->start_time, 0, 5),
                'end_time'   => substr($oneOff->end_time, 0, 5),
                'slot_interval_minutes' => $oneOff->slot_interval_minutes,
            ];
        }

        $recurring = $rules->first(fn ($r) => $r->is_recurring && (int) $r->weekday === $carbon->dayOfWeek);
        if ($recurring) {
            return [
                'start_time' => substr($recurring->start_time, 0, 5),
                'end_time'   => substr($recurring->end_time, 0, 5),
                'slot_interval_minutes' => $recurring->slot_interval_minutes,
            ];
        }

        return null;
    }

    /** Generate "09:00 AM" style slot labels for a window. */
    public static function generateSlots(string $startTime, string $endTime, int $intervalMinutes): array
    {
        $slots = [];
        $cursor = Carbon::createFromFormat('H:i', substr($startTime, 0, 5));
        $end = Carbon::createFromFormat('H:i', substr($endTime, 0, 5));

        while ($cursor->lt($end)) {
            $slots[] = $cursor->format('h:i A');
            $cursor->addMinutes($intervalMinutes);
        }

        return $slots;
    }

    /** Human-readable weekly schedule summary + any upcoming one-off dates, for display to end users. */
    public static function summaryForSource(?string $source): array
    {
        $rules = static::forSource($source);

        if ($rules->isEmpty()) {
            return [
                'recurring' => [[
                    'days'  => 'Monday – Friday',
                    'hours' => self::formatRange(self::DEFAULT_START, self::DEFAULT_END),
                ]],
                'one_off' => [],
                'active_weekdays' => self::DEFAULT_WEEKDAYS,
                'text' => 'Available Monday – Friday, ' . self::formatRange(self::DEFAULT_START, self::DEFAULT_END),
            ];
        }

        $recurringByWindow = [];
        $activeWeekdays = [];
        foreach ($rules->where('is_recurring', true) as $r) {
            $key = substr($r->start_time, 0, 5) . '-' . substr($r->end_time, 0, 5);
            $recurringByWindow[$key]['hours'] = self::formatRange($r->start_time, $r->end_time);
            $recurringByWindow[$key]['weekdays'][] = (int) $r->weekday;
            $activeWeekdays[] = (int) $r->weekday;
        }
        $activeWeekdays = array_values(array_unique($activeWeekdays));

        $recurring = [];
        foreach ($recurringByWindow as $w) {
            $recurring[] = [
                'days'  => self::describeWeekdays($w['weekdays']),
                'hours' => $w['hours'],
            ];
        }

        $oneOff = $rules->where('is_recurring', false)
            ->filter(fn ($r) => $r->specific_date && $r->specific_date->isFuture())
            ->sortBy('specific_date')
            ->map(fn ($r) => [
                'date'  => $r->specific_date->format('Y-m-d'),
                'label' => $r->specific_date->format('D, M j'),
                'hours' => self::formatRange($r->start_time, $r->end_time),
            ])
            ->values()
            ->all();

        $text = collect($recurring)->map(fn ($r) => "{$r['days']}, {$r['hours']}")->implode(' · ');

        return [
            'recurring' => $recurring,
            'one_off'   => $oneOff,
            'active_weekdays' => $activeWeekdays,
            'text'      => $text ?: 'No recurring availability configured yet.',
        ];
    }

    private static function formatRange(string $start, string $end): string
    {
        $s = Carbon::createFromFormat('H:i', substr($start, 0, 5))->format('g:i A');
        $e = Carbon::createFromFormat('H:i', substr($end, 0, 5))->format('g:i A');
        return "{$s} – {$e}";
    }

    private static function describeWeekdays(array $weekdays): string
    {
        sort($weekdays);
        if ($weekdays === [1, 2, 3, 4, 5]) return 'Monday – Friday';
        if ($weekdays === [0, 6]) return 'Weekends';
        if ($weekdays === [0, 1, 2, 3, 4, 5, 6]) return 'Every day';
        return collect($weekdays)->map(fn ($d) => substr(self::WEEKDAY_NAMES[$d], 0, 3))->implode(', ');
    }
}
