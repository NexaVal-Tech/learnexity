<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * Singleton: the one director/signer whose name + signature image appears
 * on every course-completion certificate (and badge, if the badge template
 * includes a signature field). See CertificateSignerSetting::current().
 */
class CertificateSignerSetting extends Model
{
    protected $fillable = [
        'signer_name',
        'signer_title',
        'signature_path',
    ];

    protected $appends = ['signature_url'];

    public function getSignatureUrlAttribute(): ?string
    {
        return $this->signature_path ? Storage::disk('public')->url($this->signature_path) : null;
    }

    public static function current(): self
    {
        return static::query()->first() ?? static::create([
            'signer_name' => '',
        ]);
    }
}
