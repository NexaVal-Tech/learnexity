<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectCheckin extends Model
{
    protected $fillable = [
        'project_id',
        'user_id',
        'update',
        'blocker',
        'checkin_date',
    ];

    protected $casts = [
        'checkin_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}