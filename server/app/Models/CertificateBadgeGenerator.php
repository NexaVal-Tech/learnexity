<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * One reusable badge + certificate template pairing (e.g. "Legacy
 * Masterclass"). Admins can create as many of these as they like over
 * time, each with its own uploaded template images and editable text
 * overlays. See CertificateBadgeRenderService for how badge_fields /
 * certificate_fields get composited onto the template images.
 */
class CertificateBadgeGenerator extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'is_active',
        'badge_template_path',
        'certificate_template_path',
        'certificate_signature_path',
        'badge_fields',
        'certificate_fields',
    ];

    protected $casts = [
        'is_active'           => 'boolean',
        'badge_fields'        => 'array',
        'certificate_fields'  => 'array',
    ];

    protected $appends = ['badge_template_url', 'certificate_template_url', 'certificate_signature_url'];

    public function getBadgeTemplateUrlAttribute(): ?string
    {
        return $this->badge_template_path ? Storage::disk('public')->url($this->badge_template_path) : null;
    }

    public function getCertificateTemplateUrlAttribute(): ?string
    {
        return $this->certificate_template_path ? Storage::disk('public')->url($this->certificate_template_path) : null;
    }

    public function getCertificateSignatureUrlAttribute(): ?string
    {
        return $this->certificate_signature_path ? Storage::disk('public')->url($this->certificate_signature_path) : null;
    }

    public static function generateUniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'generator';
        $slug = $base;
        $i = 2;

        while (
            static::where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    /**
     * Default field layout seeded onto a brand-new generator — pre-tuned
     * to match the reference "Active Member" badge design (1080×1080
     * template). Admin can freely retitle/reposition/add/remove fields
     * afterward; this is just a sensible, non-empty starting point.
     */
    public static function defaultBadgeFields(): array
    {
        return [
            [
                'key' => 'headline', 'label' => 'Headline',
                'text' => 'ACTIVE MEMBER', 'source' => 'admin',
                'x_pct' => 50, 'y_pct' => 46, 'font' => 'sans-bold',
                'font_size' => 72, 'color' => '#FFFFFF', 'align' => 'center',
                'max_width_pct' => 85, 'line_height' => 1.1,
            ],
            [
                'key' => 'subtext', 'label' => 'Appreciation message',
                'text' => 'Thank you for being engaged, supportive and making an impact!',
                'source' => 'admin',
                'x_pct' => 50, 'y_pct' => 65, 'font' => 'sans-medium',
                'font_size' => 26, 'color' => '#FFFFFF', 'align' => 'center',
                'max_width_pct' => 65, 'line_height' => 1.3,
            ],
            [
                'key' => 'ribbon_text', 'label' => 'Ribbon tagline',
                'text' => 'ENGAGE • LEARN • INSPIRE', 'source' => 'admin',
                'x_pct' => 50, 'y_pct' => 83, 'font' => 'sans-bold',
                'font_size' => 32, 'color' => '#FFFFFF', 'align' => 'center',
                'max_width_pct' => 80, 'line_height' => 1.2,
            ],
        ];
    }

    /**
     * Pre-tuned to match the reference "Certificate of Participation"
     * design (1280×904 template). `recipient_name` is the only
     * visitor-sourced field — everything else is admin-fixed text.
     */
    public static function defaultCertificateFields(): array
    {
        return [
            [
                'key' => 'recipient_name', 'label' => "Recipient's name (from visitor)",
                'text' => 'Jane Doe', 'source' => 'visitor_name',
                'x_pct' => 50, 'y_pct' => 49, 'font' => 'serif-italic',
                'font_size' => 52, 'color' => '#1F2937', 'align' => 'center',
                'max_width_pct' => 75, 'line_height' => 1.2,
            ],
            [
                'key' => 'webinar_line', 'label' => 'Webinar / event line',
                'text' => 'For attending and participating on the Webinar "How to Communicate Like a Global Professional"',
                'source' => 'admin',
                'x_pct' => 50, 'y_pct' => 57, 'font' => 'sans-regular',
                'font_size' => 20, 'color' => '#374151', 'align' => 'center',
                'max_width_pct' => 85, 'line_height' => 1.3,
            ],
            [
                'key' => 'date_line', 'label' => 'Date line',
                'text' => 'On August 28, 2026', 'source' => 'admin',
                'x_pct' => 50, 'y_pct' => 60, 'font' => 'sans-regular',
                'font_size' => 20, 'color' => '#374151', 'align' => 'center',
                'max_width_pct' => 85, 'line_height' => 1.3,
            ],
            [
                'key' => 'body_text', 'label' => 'Body paragraph',
                'text' => 'This certifies that you have taken a bold step toward mastering communication skills that open doors to global opportunities, leadership, and career growth.',
                'source' => 'admin',
                'x_pct' => 50, 'y_pct' => 65, 'font' => 'sans-regular',
                'font_size' => 18, 'color' => '#374151', 'align' => 'center',
                'max_width_pct' => 80, 'line_height' => 1.4,
            ],
            [
                'key' => 'signer_name', 'label' => 'Signer name',
                'text' => 'MARY EZE', 'source' => 'admin',
                'x_pct' => 72, 'y_pct' => 82, 'font' => 'sans-bold',
                'font_size' => 18, 'color' => '#1F2937', 'align' => 'center',
                'max_width_pct' => 24, 'line_height' => 1.2,
            ],
            [
                'key' => 'signer_role', 'label' => 'Signer role/title',
                'text' => 'Director', 'source' => 'admin',
                'x_pct' => 72, 'y_pct' => 85, 'font' => 'sans-regular',
                'font_size' => 15, 'color' => '#6B7280', 'align' => 'center',
                'max_width_pct' => 24, 'line_height' => 1.2,
            ],
        ];
    }
}
