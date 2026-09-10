<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * Singleton settings for the standalone "I will be attending" flyer — a
 * one-off feature (not part of the reusable certificate/badge generator
 * system). Visitors supply a photo + their name; every other piece of
 * text is fixed by the admin. See CertificateBadgeRenderService::
 * renderAttendingFlyer() for how this gets composited.
 */
class AttendingFlyerSetting extends Model
{
    protected $fillable = [
        'slug',
        'is_active',
        'page_heading',
        'background_template_path',
        'foreground_template_path',
        'photo_x_pct',
        'photo_y_pct',
        'photo_width_pct',
        'photo_height_pct',
        'fields',
    ];

    protected $casts = [
        'is_active'        => 'boolean',
        'photo_x_pct'      => 'float',
        'photo_y_pct'      => 'float',
        'photo_width_pct'  => 'float',
        'photo_height_pct' => 'float',
        'fields'           => 'array',
    ];

    protected $appends = ['background_template_url', 'foreground_template_url'];

    public function getBackgroundTemplateUrlAttribute(): ?string
    {
        return $this->background_template_path ? Storage::disk('public')->url($this->background_template_path) : null;
    }

    public function getForegroundTemplateUrlAttribute(): ?string
    {
        return $this->foreground_template_path ? Storage::disk('public')->url($this->foreground_template_path) : null;
    }

    public static function current(): self
    {
        return static::query()->first() ?? static::create([
            'slug' => 'attending',
            'fields' => static::defaultFields(),
        ]);
    }

    /**
     * Pre-tuned to match the reference "I Will Be Attending" flyer
     * (864×1080 template) — positions measured directly from that design.
     * The two-tone headline ("INSTANT RESPECT" / "SINGLE WORD") is split
     * into adjacent black + purple fields since each field is one color.
     */
    public static function defaultFields(): array
    {
        return [
            ['key' => 'script_command', 'label' => 'Script word above headline', 'text' => 'Command', 'source' => 'admin',
                'x_pct' => 5, 'y_pct' => 11, 'font' => 'serif-italic', 'font_size' => 48, 'color' => '#000000',
                'align' => 'left', 'max_width_pct' => 40, 'line_height' => 1.1],
            ['key' => 'headline1_black', 'label' => 'Headline line 1 (black part)', 'text' => 'Instant', 'source' => 'admin',
                'x_pct' => 5, 'y_pct' => 18, 'font' => 'sans-bold', 'font_size' => 42, 'color' => '#000000',
                'align' => 'left', 'max_width_pct' => 28, 'line_height' => 1.1],
            ['key' => 'headline1_purple', 'label' => 'Headline line 1 (purple part)', 'text' => 'Respect', 'source' => 'admin',
                'x_pct' => 32, 'y_pct' => 18, 'font' => 'sans-bold', 'font_size' => 42, 'color' => '#4A3AFF',
                'align' => 'left', 'max_width_pct' => 35, 'line_height' => 1.1],
            ['key' => 'headline2_black', 'label' => 'Headline line 2 (black part)', 'text' => 'Before you say a', 'source' => 'admin',
                'x_pct' => 5, 'y_pct' => 24, 'font' => 'sans-bold', 'font_size' => 26, 'color' => '#000000',
                'align' => 'left', 'max_width_pct' => 30, 'line_height' => 1.1],
            ['key' => 'headline2_purple', 'label' => 'Headline line 2 (purple part)', 'text' => 'Single word', 'source' => 'admin',
                'x_pct' => 34, 'y_pct' => 24, 'font' => 'sans-bold', 'font_size' => 32, 'color' => '#4A3AFF',
                'align' => 'left', 'max_width_pct' => 35, 'line_height' => 1.1],
            ['key' => 'quote', 'label' => 'Quote / subheading', 'text' => 'Master how to communicate like a global professional.', 'source' => 'admin',
                'x_pct' => 5, 'y_pct' => 30, 'font' => 'sans-medium', 'font_size' => 17, 'color' => '#000000',
                'align' => 'left', 'max_width_pct' => 45, 'line_height' => 1.4],
            ['key' => 'event_date', 'label' => 'Event date', 'text' => '28th August 2026', 'source' => 'admin',
                'x_pct' => 76, 'y_pct' => 39, 'font' => 'sans-bold', 'font_size' => 22, 'color' => '#000000',
                'align' => 'left', 'max_width_pct' => 24, 'line_height' => 1.2],
            ['key' => 'event_time', 'label' => 'Event time', 'text' => '4PM EDT (9PM WAT)', 'source' => 'admin',
                'x_pct' => 76, 'y_pct' => 42, 'font' => 'sans-bold', 'font_size' => 18, 'color' => '#000000',
                'align' => 'left', 'max_width_pct' => 24, 'line_height' => 1.2],
            ['key' => 'event_platform', 'label' => 'Event platform', 'text' => 'Google Meet', 'source' => 'admin',
                'x_pct' => 79, 'y_pct' => 45, 'font' => 'sans-medium', 'font_size' => 15, 'color' => '#000000',
                'align' => 'left', 'max_width_pct' => 20, 'line_height' => 1.2],
            ['key' => 'attending_label', 'label' => '"I will be attending" bar text', 'text' => 'I Will Be Attending', 'source' => 'admin',
                'x_pct' => 76, 'y_pct' => 55, 'font' => 'sans-bold', 'font_size' => 17, 'color' => '#FFFFFF',
                'align' => 'center', 'max_width_pct' => 28, 'line_height' => 1.2],
            ['key' => 'attendee_name', 'label' => "Attendee's name (from visitor)", 'text' => 'Jane Doe', 'source' => 'visitor_name',
                'x_pct' => 76, 'y_pct' => 82, 'font' => 'sans-bold', 'font_size' => 19, 'color' => '#FFFFFF',
                'align' => 'center', 'max_width_pct' => 26, 'line_height' => 1.2],
            ['key' => 'speaker_name', 'label' => 'Speaker name line', 'text' => 'With: Hannah Francis', 'source' => 'admin',
                'x_pct' => 4, 'y_pct' => 95, 'font' => 'sans-bold', 'font_size' => 16, 'color' => '#FFFFFF',
                'align' => 'left', 'max_width_pct' => 38, 'line_height' => 1.3],
            ['key' => 'speaker_title', 'label' => 'Speaker title/role', 'text' => 'Communications Specialist, English Language Educator', 'source' => 'admin',
                'x_pct' => 4, 'y_pct' => 98, 'font' => 'sans-regular', 'font_size' => 13, 'color' => '#FFFFFF',
                'align' => 'left', 'max_width_pct' => 38, 'line_height' => 1.3],
            ['key' => 'footer_tagline', 'label' => 'Right footer headline', 'text' => 'Learn From A Native American', 'source' => 'admin',
                'x_pct' => 58, 'y_pct' => 95, 'font' => 'sans-bold', 'font_size' => 15, 'color' => '#FFFFFF',
                'align' => 'left', 'max_width_pct' => 40, 'line_height' => 1.3],
            ['key' => 'footer_subtext', 'label' => 'Right footer bullet points', 'text' => 'Speak Confidently — Land your dream Role', 'source' => 'admin',
                'x_pct' => 58, 'y_pct' => 98, 'font' => 'sans-regular', 'font_size' => 13, 'color' => '#FFFFFF',
                'align' => 'left', 'max_width_pct' => 40, 'line_height' => 1.3],
        ];
    }
}
