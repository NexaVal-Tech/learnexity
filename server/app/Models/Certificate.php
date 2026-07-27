<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certificate extends Model
{
    protected $fillable = [
        'certificate_uid',
        'user_id',
        'course_id',
        'course_title',
        'recipient_name',
        'issue_type',
        'issued_by_admin_id',
        'pdf_path',
        'issued_at',
        'revoked_at',
        'revoked_reason',
    ];

    protected $casts = [
        'issued_at'  => 'datetime',
        'revoked_at' => 'datetime',
    ];

    protected $appends = ['is_revoked', 'download_url'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    public function issuedByAdmin(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'issued_by_admin_id');
    }

    public function getIsRevokedAttribute(): bool
    {
        return $this->revoked_at !== null;
    }

    public function getDownloadUrlAttribute(): string
    {
        return url("/api/certificates/{$this->certificate_uid}/download");
    }
}
