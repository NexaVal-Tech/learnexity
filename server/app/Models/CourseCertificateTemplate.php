<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

/**
 * Singleton: the one visual design used for every course-completion
 * certificate. `fields` entries with source !== 'admin' are auto-resolved
 * at render time by DynamicTemplateRenderService — see the migration
 * comment for the list of available variables. Positions are top-anchored
 * (x_pct/y_pct = top-left of the text box).
 */
class CourseCertificateTemplate extends Model
{
    protected $fillable = [
        'template_image_path',
        'signature_x_pct',
        'signature_y_pct',
        'signature_width_pct',
        'fields',
    ];

    protected $casts = [
        'signature_x_pct'     => 'float',
        'signature_y_pct'     => 'float',
        'signature_width_pct' => 'float',
        'fields'              => 'array',
    ];

    protected $appends = ['template_image_url'];

    public function getTemplateImageUrlAttribute(): ?string
    {
        return $this->template_image_path ? Storage::disk('public')->url($this->template_image_path) : null;
    }

    /**
     * Auto-seeds from the bundled, text-free certificate shell (see
     * resources/images/course-certificate-shell.jpg — the exact design
     * originally uploaded for the ad-hoc generator, with the recipient
     * name/body copy/signature area cleanly removed) so a brand-new
     * install needs zero admin upload step to start issuing certificates
     * that match the original design exactly. Copies the bundled file
     * into public storage once, the first time this is called.
     */
    public static function current(): self
    {
        $existing = static::query()->first();
        if ($existing) {
            return $existing;
        }

        $bundledShell = resource_path('images/course-certificate-shell.jpg');
        $seededPath = null;
        if (File::exists($bundledShell)) {
            $seededPath = 'course-certificate-template/shell.jpg';
            Storage::disk('public')->put($seededPath, File::get($bundledShell));
        }

        return static::create([
            'template_image_path' => $seededPath,
            'fields'               => static::defaultFields(),
        ]);
    }

    /**
     * Positions measured directly against the bundled shell (1280×904) —
     * matches where the original design's text sat. Admin can freely drag
     * to reposition afterward.
     */
    public static function defaultFields(): array
    {
        return [
            ['key' => 'recipient_name', 'label' => "Recipient's name", 'text' => 'Jane Doe', 'source' => 'recipient_name',
                'x_pct' => 20, 'y_pct' => 45, 'font' => 'serif-italic', 'font_size' => 46, 'color' => '#1F2937',
                'align' => 'center', 'max_width_pct' => 60, 'line_height' => 1.2],
            ['key' => 'webinar_line', 'label' => 'Event / webinar line', 'text' => 'For completing the course', 'source' => 'admin',
                'x_pct' => 6, 'y_pct' => 55.5, 'font' => 'sans-regular', 'font_size' => 18, 'color' => '#374151',
                'align' => 'center', 'max_width_pct' => 88, 'line_height' => 1.3],
            ['key' => 'course_title', 'label' => 'Course title', 'text' => 'Course Title', 'source' => 'course_title',
                'x_pct' => 28, 'y_pct' => 59, 'font' => 'sans-bold', 'font_size' => 18, 'color' => '#374151',
                'align' => 'center', 'max_width_pct' => 44, 'line_height' => 1.3],
            ['key' => 'issue_date', 'label' => 'Issue date', 'text' => 'January 1, 2026', 'source' => 'issue_date',
                'x_pct' => 6, 'y_pct' => 62.5, 'font' => 'sans-regular', 'font_size' => 15, 'color' => '#6B7280',
                'align' => 'center', 'max_width_pct' => 88, 'line_height' => 1.3],
            ['key' => 'signer_name', 'label' => 'Signer name', 'text' => 'Director', 'source' => 'signer_name',
                'x_pct' => 60, 'y_pct' => 79, 'font' => 'sans-bold', 'font_size' => 16, 'color' => '#1F2937',
                'align' => 'center', 'max_width_pct' => 30, 'line_height' => 1.2],
            ['key' => 'reference_number', 'label' => 'Reference number', 'text' => 'LX-CERT-000000', 'source' => 'reference_number',
                'x_pct' => 18, 'y_pct' => 95.5, 'font' => 'sans-regular', 'font_size' => 10, 'color' => '#9CA3AF',
                'align' => 'left', 'max_width_pct' => 40, 'line_height' => 1.2],
        ];
    }
}
