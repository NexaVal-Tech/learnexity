<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Tymon\JWTAuth\Contracts\JWTSubject;

class Instructor extends Authenticatable implements JWTSubject
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'bio',
        'specialisation',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = ['password'];

    protected $casts = [
        'is_active'     => 'boolean',
        'last_login_at' => 'datetime',
    ];

    // ── JWT interface ──────────────────────────────────────────────────────────

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [];
    }

    // ── Relationships ──────────────────────────────────────────────────────────

    /**
     * The course IDs this instructor is assigned to manage.
     */
    public function courses(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(
            Course::class,
            'instructor_courses',
            'instructor_id',
            'course_id',
            'id',
            'course_id'   // foreign key on courses table
        );
    }
}