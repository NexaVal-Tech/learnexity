<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * Singleton: the one visual design used for every sprint/course-completion
 * badge unlock. Same auto-fill mechanism as CourseCertificateTemplate —
 * see the migration comment for available `source` variables.
 */
class CourseBadgeTemplate extends Model
{
    protected $fillable = [
        'template_image_path',
        'fields',
    ];

    protected $casts = [
        'fields' => 'array',
    ];

    protected $appends = ['template_image_url'];

    public function getTemplateImageUrlAttribute(): ?string
    {
        return $this->template_image_path ? Storage::disk('public')->url($this->template_image_path) : null;
    }

    public static function current(): self
    {
        return static::query()->first() ?? static::create([
            'fields' => static::defaultFields(),
        ]);
    }

    public static function defaultFields(): array
    {
        return [
            ['key' => 'badge_name', 'label' => 'Badge name', 'text' => 'ACTIVE MEMBER', 'source' => 'badge_name',
                'x_pct' => 10, 'y_pct' => 40, 'font' => 'sans-bold', 'font_size' => 48, 'color' => '#FFFFFF',
                'align' => 'left', 'max_width_pct' => 80, 'line_height' => 1.1],
            ['key' => 'recipient_name', 'label' => "Recipient's name", 'text' => 'Jane Doe', 'source' => 'recipient_name',
                'x_pct' => 10, 'y_pct' => 55, 'font' => 'sans-medium', 'font_size' => 24, 'color' => '#FFFFFF',
                'align' => 'left', 'max_width_pct' => 80, 'line_height' => 1.2],
            ['key' => 'course_title', 'label' => 'Course title', 'text' => 'Course Title', 'source' => 'course_title',
                'x_pct' => 10, 'y_pct' => 65, 'font' => 'sans-regular', 'font_size' => 18, 'color' => '#FFFFFF',
                'align' => 'left', 'max_width_pct' => 80, 'line_height' => 1.3],
            ['key' => 'reference_number', 'label' => 'Reference number', 'text' => 'LX-BADGE-000000', 'source' => 'reference_number',
                'x_pct' => 10, 'y_pct' => 90, 'font' => 'sans-regular', 'font_size' => 12, 'color' => '#FFFFFF',
                'align' => 'left', 'max_width_pct' => 60, 'line_height' => 1.2],
        ];
    }
}
