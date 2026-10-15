<?php

namespace App\Services;

use App\Models\CmsPage;
use Illuminate\Support\Facades\Cache;

/**
 * Reads the people on the "Meet Our Team" page (Website CMS → Meet Our
 * Team → team.members block) so courses can use them as instructors.
 *
 * A course instructor that was picked from the team stores `team_member`
 * (the person's name). Whenever the course is read, that entry is filled
 * from the CURRENT team page — so editing someone's photo, role, bio or
 * LinkedIn on Meet Our Team updates every course they teach.
 */
class TeamDirectory
{
    private const CACHE_KEY = 'team-directory:members';
    private static ?array $memo = null;

    /** @return array<int, array{name:string, role:?string, image:?string, bio:?string, linkedin:?string, twitter:?string}> */
    public static function members(): array
    {
        if (self::$memo !== null) return self::$memo;
        return self::$memo = Cache::remember(self::CACHE_KEY, 60, function () {
            $page = CmsPage::where('slug', 'our-team')->first();
            if (!$page) return [];

            foreach ($page->sections as $section) {
                if (($section['type'] ?? null) !== 'team.members') continue;
                $list = $section['data']['members'] ?? [];
                if (!is_array($list)) return [];

                $out = [];
                foreach ($list as $m) {
                    if (!is_array($m) || trim((string) ($m['name'] ?? '')) === '') continue;
                    $out[] = [
                        'name'     => trim((string) $m['name']),
                        'role'     => isset($m['role']) ? trim((string) $m['role']) : null,
                        'image'    => $m['image'] ?? null,
                        'bio'      => $m['bio'] ?? null,
                        'linkedin' => $m['linkedin'] ?? null,
                        'twitter'  => $m['twitter'] ?? null,
                    ];
                }
                return $out;
            }
            return [];
        });
    }

    public static function forget(): void
    {
        self::$memo = null;
        Cache::forget(self::CACHE_KEY);
    }

    public static function key(string $name): string
    {
        return mb_strtolower(preg_replace('/\s+/u', ' ', trim($name)));
    }

    public static function find(?string $name): ?array
    {
        if (!$name) return null;
        $k = self::key($name);
        foreach (self::members() as $m) {
            if (self::key($m['name']) === $k) return $m;
        }
        return null;
    }

    /**
     * Fill team-linked instructors with the live team data. Manually typed
     * instructors are returned unchanged.
     */
    public static function resolveInstructors(array $list): array
    {
        $out = [];
        foreach ($list as $ins) {
            if (!is_array($ins)) continue;
            $member = !empty($ins['team_member']) ? self::find((string) $ins['team_member']) : null;
            if ($member) {
                $socials = [];
                if (!empty($member['linkedin'])) $socials[] = ['platform' => 'linkedin', 'url' => $member['linkedin']];
                if (!empty($member['twitter']))  $socials[] = ['platform' => 'x', 'url' => $member['twitter']];
                $ins = array_merge($ins, [
                    'name'        => $member['name'],
                    'role'        => $member['role'] ?: ($ins['role'] ?? ''),
                    'photo'       => $member['image'] ?: ($ins['photo'] ?? null),
                    'bio'         => $member['bio'] ?: ($ins['bio'] ?? null),
                    'socials'     => $socials ?: ($ins['socials'] ?? []),
                    'team_member' => $member['name'],
                    'synced'      => true,
                ]);
            } elseif (!empty($ins['team_member'])) {
                // The person was removed from / renamed on the team page — keep
                // the last saved copy so the course page doesn't lose them.
                $ins['synced'] = false;
            }
            $out[] = $ins;
        }
        return $out;
    }

    /**
     * name-key => [{course_id, title}] for every course that lists the
     * person (picked from the team or typed with the same name).
     */
    public static function coursesByMember(): array
    {
        return Cache::remember('team-directory:courses', 60, function () {
            $map = [];
            $courses = \App\Models\Course::query()
                ->where('is_active', true)
                ->whereNotNull('course_instructors')
                ->get(['course_id', 'title', 'course_instructors']);
            foreach ($courses as $c) {
                $raw = $c->getRawOriginal('course_instructors');
                $list = is_string($raw) ? json_decode($raw, true) : $raw;
                foreach ((is_array($list) ? $list : []) as $ins) {
                    $name = $ins['team_member'] ?? $ins['name'] ?? null;
                    if (!$name) continue;
                    $map[self::key((string) $name)][] = ['course_id' => $c->course_id, 'title' => $c->title];
                }
            }
            return $map;
        });
    }
}
