<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'course_id',
        'sprint_id',
        'created_by_instructor',
        'title',
        'brief',
        'expected_outcome',
        'deadline',
        'phase',
        'is_active',
    ];

    protected $casts = [
        'deadline'  => 'date',
        'is_active' => 'boolean',
    ];

    public function submissions()
    {
        return $this->hasMany(ProjectSubmission::class);
    }

    public function teamRoles()
    {
        return $this->hasMany(ProjectTeamRole::class);
    }

    public function checkins()
    {
        return $this->hasMany(ProjectCheckin::class);
    }

    public function instructor()
    {
        return $this->belongsTo(Instructor::class, 'created_by_instructor');
    }

    public function sprint()
    {
        return $this->belongsTo(CourseMaterial::class, 'sprint_id');
    }
}