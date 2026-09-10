<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class Admin extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    /**
     * Canonical list of permission keys — one per admin route-group
     * section, plus a couple of finer-grained action permissions that sit
     * within the "students" section (granting course access and sending
     * emails are gated independently of just viewing the student list).
     * Keep this in sync with the admin.permission middleware applied in
     * routes/api.php and the checkbox list on the Team management page.
     */
    public const PERMISSIONS = [
        'students'                      => 'View & search students',
        'grant_course_access'           => 'Grant/revoke a student\'s course access',
        'send_emails'                   => 'Send emails/messages to students',
        'kids'                          => 'Kids courses & enrollments',
        'referrals'                     => 'Referral history & stats',
        'scholarships'                  => 'Review scholarship applications',
        'registration_fee'              => 'Registration fee settings',
        'scholarship_countdown'         => 'Scholarship countdown banner settings',
        'instructors'                   => 'Manage instructors',
        'consultations'                 => 'Manage consultations',
        'course_groups'                 => 'Manage course groups',
        'courses'                       => 'Manage courses & course content',
        'badges'                        => 'Manage badges',
        'certificates'                  => 'Issue/revoke certificates',
        'certificate_badge_generators'  => 'Certificate/badge generators (ad-hoc)',
        'certificate_signer'            => 'Certificate signer settings',
        'course_certificate_template'   => 'Course certificate design',
        'course_badge_template'         => 'Course badge design',
        'attending_flyer'               => '"I Will Be Attending" flyer',
        'activity'                      => 'Activity log & analytics',
    ];

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_super_admin',
        'permissions',
        'created_by_admin_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_super_admin' => 'boolean',
        'permissions' => 'array',
    ];

    /** Super admins bypass all permission checks. */
    public function hasPermission(string $key): bool
    {
        if ($this->is_super_admin) {
            return true;
        }

        return in_array($key, $this->permissions ?? [], true);
    }

    // JWT Methods
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'type' => 'admin' // Identify this token as admin
        ];
    }
}