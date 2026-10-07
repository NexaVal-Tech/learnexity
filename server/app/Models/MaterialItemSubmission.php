<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One attempt at a sprint task (see MaterialItem::task_config).
 * Files live on the PRIVATE disk and are only ever streamed back through
 * authenticated endpoints as downloads — never served from /storage.
 */
class MaterialItemSubmission extends Model
{
    public const STATUS_SUBMITTED      = 'submitted';      // waiting for review
    public const STATUS_PASSED         = 'passed';         // met the pass mark
    public const STATUS_NEEDS_REVISION = 'needs_revision'; // below pass mark / resubmission requested
    public const STATUS_GRADED         = 'graded';         // scored, no pass mark set

    protected $fillable = [
        'material_item_id', 'user_id', 'course_id', 'attempt',
        'text_response', 'link_url',
        'file_path', 'file_original_name', 'file_ext', 'file_size',
        'auto_score', 'auto_checks', 'score', 'status', 'feedback',
        'graded_by_type', 'graded_by_id', 'graded_by_name', 'graded_at',
        'ip_address',
    ];

    protected $hidden = ['file_path', 'ip_address'];

    protected $casts = [
        'auto_checks' => 'array',
        'auto_score'  => 'float',
        'score'       => 'float',
        'graded_at'   => 'datetime',
        'file_size'   => 'integer',
        'attempt'     => 'integer',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(MaterialItem::class, 'material_item_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Whether this attempt counts the task as done for progress tracking. */
    public function countsAsComplete(?float $passMark): bool
    {
        if ($this->status === self::STATUS_PASSED || $this->status === self::STATUS_GRADED) {
            return true;
        }
        // No pass mark → handing it in is enough.
        return $passMark === null && $this->status === self::STATUS_SUBMITTED;
    }
}
