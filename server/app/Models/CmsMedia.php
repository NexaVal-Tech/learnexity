<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CmsMedia extends Model
{
    protected $table = 'cms_media';

    protected $fillable = [
        'type',
        'path',
        'url',
        'mime_type',
        'size',
        'original_name',
        'alt',
        'width',
        'height',
        'uploaded_by',
    ];

    protected $casts = [
        'size'   => 'integer',
        'width'  => 'integer',
        'height' => 'integer',
    ];
}
