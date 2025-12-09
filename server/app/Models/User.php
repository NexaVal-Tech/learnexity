<?php
namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;

class User extends Authenticatable implements JWTSubject, MustVerifyEmail
{
    use Notifiable, MustVerifyEmailTrait;

    protected $fillable = ['name','email','password','google_id', 'referred_by_code',];
    protected $hidden = ['password','remember_token','twofa_secret'];

    // JWTSubject methods
    public function getJWTIdentifier() { return $this->getKey(); }
    public function getJWTCustomClaims() { return []; }

    // Relations
    public function purchases() { return $this->hasMany(Purchase::class); }

    public function courses()
    {
        return $this->belongsToMany(Course::class, 'purchases')
                    ->withTimestamps()
                    ->withPivot('purchased_at', 'stripe_session_id');
    }
}
