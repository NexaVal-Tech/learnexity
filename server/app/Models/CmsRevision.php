<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CmsRevision extends Model
{
    public const UPDATED_AT = null;

    /** How many snapshots to keep per page/global. */
    public const KEEP = 30;

    protected $fillable = ['subject_type', 'subject_key', 'snapshot', 'admin_id'];

    protected $casts = ['snapshot' => 'array'];

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id');
    }

    public static function record(string $type, string $key, array $snapshot, ?int $adminId): void
    {
        static::create([
            'subject_type' => $type,
            'subject_key'  => $key,
            'snapshot'     => $snapshot,
            'admin_id'     => $adminId,
        ]);

        $stale = static::where('subject_type', $type)
            ->where('subject_key', $key)
            ->orderByDesc('id')
            ->skip(self::KEEP)
            ->take(PHP_INT_MAX)
            ->pluck('id');

        if ($stale->isNotEmpty()) {
            static::whereIn('id', $stale)->delete();
        }
    }
}
