<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Someone who registered for the free webinar from the landing page. */
class LandingWebinarRegistration extends Model
{
    protected $fillable = ['name', 'email', 'country', 'interest', 'heard_from', 'webinar_title', 'ip_hash'];

    protected $hidden = ['ip_hash'];
}
