<?php

namespace App\Models;

use App\Support\LandingPageDefaults;
use Illuminate\Database\Eloquent\Model;

/** Single row holding the marketing landing page content. */
class LandingPageSetting extends Model
{
    protected $fillable = ['content', 'meta_pixel_id', 'updated_by'];

    protected $casts = ['content' => 'array'];

    public static function current(): self
    {
        return static::query()->first() ?? static::create(['content' => null]);
    }

    /** Saved content laid over the defaults (so new fields always exist). */
    public function mergedContent(): array
    {
        return LandingPageDefaults::merge(LandingPageDefaults::content(), is_array($this->content) ? $this->content : []);
    }
}
