<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    public $timestamps = false; // only created_at, set manually

    protected $fillable = [
        'event_type', 'actor_type', 'actor_id', 'actor_name', 'description',
        'course_id', 'metadata', 'ip_address', 'user_agent', 'created_at',
    ];

    protected $casts = [
        'metadata'   => 'array',
        'created_at' => 'datetime',
    ];
}
