<?php
 
namespace App\Models;
 
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;
 
/**
 * Model: app/Models/PublicReferrer.php
 *
 * Implements JWTSubject so tymon/jwt-auth can issue tokens
 * for PublicReferrer just like it does for User.
 */
class PublicReferrer extends Authenticatable implements JWTSubject
{
    protected $fillable = [
        'email',
        'password',
        'referral_code',
        'total_referrals',
        'successful_referrals',
        'pending_referrals',
        'total_earnings',
    ];
 
    protected $hidden = ['password'];
 
    protected $casts = [
        'total_earnings' => 'decimal:2',
    ];
 
    // ── JWTSubject interface ───────────────────────────────────────────────────
 
    /**
     * Identifies the subject claim in the JWT payload.
     * Prefix with 're:' so we can distinguish from a regular User token.
     */
    public function getJWTIdentifier()
    {
        return 're:' . $this->getKey();
    }
 
    public function getJWTCustomClaims(): array
    {
        return [
            'guard' => 'public_referrer',
            'email' => $this->email,
        ];
    }
 
    // ── Relationships ─────────────────────────────────────────────────────────
 
    public function referralHistory()
    {
        return $this->hasMany(ReferralHistory::class, 'public_referrer_id');
    }
}
 