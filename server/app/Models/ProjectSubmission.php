<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectSubmission extends Model
{
    protected $fillable = [
        'project_id',
        'user_id',
        'phase',
        'content',
        'file_path',
        'file_name',
        'status',
        'instructor_feedback',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(Instructor::class, 'reviewed_by');
    }
}