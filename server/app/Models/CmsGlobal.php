<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CmsGlobal extends Model
{
    protected $fillable = ['key', 'data', 'updated_by'];

    protected $casts = ['data' => 'array'];

    /** Keep in sync with frontend/lib/cms/globals.ts. */
    public const KEYS = ['navbar', 'footer', 'scholarship'];
}
