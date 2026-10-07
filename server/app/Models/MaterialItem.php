<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class MaterialItem extends Model
{
    protected $fillable = [
        'course_material_id',
        'title',
        'type',
        'file_path',
        'file_url',
        'file_size',
        'text_content',
        'order',
        'task_config',
    ];

    protected $casts = [
        'task_config' => 'array',
    ];

    protected $appends = ['download_url'];

    public function submissions(): HasMany
    {
        return $this->hasMany(MaterialItemSubmission::class);
    }

    /** True when an admin/instructor has turned this item into a task. */
    public function isTask(): bool
    {
        return is_array($this->task_config) && !empty($this->task_config['enabled']);
    }

    public function courseMaterial(): BelongsTo
    {
        return $this->belongsTo(CourseMaterial::class);
    }

    public function progress(): HasMany
    {
        return $this->hasMany(MaterialItemProgress::class);
    }

    public function isCompletedBy($userId): bool
    {
        return $this->progress()
            ->where('user_id', $userId)
            ->where('is_completed', true)
            ->exists();
    }

    public function getDownloadUrlAttribute()
    {
        if ($this->file_path && Storage::disk('public')->exists($this->file_path)) {
            return Storage::url($this->file_path);
        }
        
        return $this->file_url;
    }

        /**
     * Check if file exists
     */
    public function fileExists(): bool
    {
        if (!$this->file_path) {
            return false;
        }
        
        return Storage::disk('public')->exists($this->file_path);
    }

}