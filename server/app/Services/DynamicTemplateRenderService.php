<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\CertificateSignerSetting;
use App\Models\CourseBadgeTemplate;
use App\Models\CourseCertificateTemplate;
use App\Models\UserBadge;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

/**
 * Renders course-completion certificates and sprint/course-completion
 * badges as PDFs, using an admin-uploaded template image with text fields
 * laid out in HTML/CSS (via dompdf) rather than drawn onto a raster image
 * with GD — this is deliberately a different rendering path than
 * CertificateBadgeRenderService (the one-off admin "generator" system):
 * dompdf is already a hard dependency of this app (the pre-existing plain
 * certificate template uses it) and needs no PHP extension beyond what's
 * already required, whereas GD may not be enabled in every environment.
 *
 * Field positions are TOP-anchored (x_pct/y_pct = top-left of the text
 * box) and text wrapping is left entirely to the browser/dompdf layout
 * engine — no manual glyph-measurement wrapping like the GD service needs,
 * since HTML naturally reflows text inside a width-constrained box.
 */
class DynamicTemplateRenderService
{
    private const FONTS = [
        'sans-bold'     => ['file' => 'Poppins-Bold.ttf',   'weight' => 'bold',   'style' => 'normal'],
        'sans-medium'   => ['file' => 'Poppins-Medium.ttf', 'weight' => '500',    'style' => 'normal'],
        'sans-regular'  => ['file' => 'Poppins-Regular.ttf','weight' => 'normal', 'style' => 'normal'],
        'serif'         => ['file' => 'Lora-Regular.ttf',   'weight' => 'normal', 'style' => 'normal'],
        'serif-italic'  => ['file' => 'Lora-Italic.ttf',    'weight' => 'normal', 'style' => 'italic'],
    ];

    public function fontOptions(): array
    {
        return array_keys(self::FONTS);
    }

    /**
     * Renders a course-completion certificate PDF. Returns null (caller
     * should fall back to the plain certificates.template view) if no
     * admin template image has been uploaded yet.
     */
    public function renderCertificatePdf(Certificate $certificate): ?string
    {
        $template = CourseCertificateTemplate::current();
        if (! $template->template_image_path) {
            return null;
        }

        $signer = CertificateSignerSetting::current();

        $resolved = [
            'recipient_name'   => $certificate->recipient_name,
            'course_title'     => $certificate->course_title,
            'issue_date'       => optional($certificate->issued_at)->format('F j, Y') ?? now()->format('F j, Y'),
            'reference_number' => $certificate->reference_number ?? '',
            'signer_name'      => $signer->signer_name ?: '',
        ];

        $signatureBlock = null;
        if ($signer->signature_path) {
            $signatureBlock = [
                'dataUri'  => $this->imageDataUri($signer->signature_path),
                'x_pct'    => (float) $template->signature_x_pct,
                'y_pct'    => (float) $template->signature_y_pct,
                'width_pct'=> (float) $template->signature_width_pct,
            ];
        }

        return $this->render($template->template_image_path, $template->fields ?? [], $resolved, $signatureBlock);
    }

    /**
     * Renders a badge-unlock PDF. Returns null if no admin badge template
     * image has been uploaded yet (caller leaves the badge un-rendered —
     * it still exists as a UserBadge record, just without a downloadable
     * file, same as before this feature existed).
     */
    public function renderBadgePdf(UserBadge $userBadge): ?string
    {
        $template = CourseBadgeTemplate::current();
        if (! $template->template_image_path) {
            return null;
        }

        $userBadge->loadMissing(['user', 'badge.course']);
        $badge = $userBadge->badge;
        $user  = $userBadge->user;

        $resolved = [
            'recipient_name'   => $user->name ?? '',
            'badge_name'       => $badge->name ?? '',
            'badge_description'=> $badge->description ?? '',
            'course_title'     => $badge?->course?->title ?? '',
            'issue_date'       => optional($userBadge->unlocked_at)->format('F j, Y') ?? now()->format('F j, Y'),
            'reference_number' => $userBadge->reference_number ?? '',
        ];

        return $this->render($template->template_image_path, $template->fields ?? [], $resolved, null);
    }

    /**
     * Assigns a reference number (if missing) and renders + persists the
     * badge PDF onto the private 'local' disk, mirroring how
     * CertificateService::generatePdf() stores certificates. Safe to call
     * repeatedly — re-renders in place rather than erroring if a PDF
     * already exists. Called from both the auto-unlock path
     * (CourseResourcesController::checkAndUnlockBadges) and the manual
     * admin-award path (AdminBadgeController::award).
     */
    public function issueBadgeArtifact(UserBadge $userBadge): void
    {
        if (! $userBadge->reference_number) {
            $userBadge->reference_number = 'LX-BADGE-' . str_pad((string) $userBadge->id, 6, '0', STR_PAD_LEFT);
        }

        try {
            $binary = $this->renderBadgePdf($userBadge);
            if ($binary !== null) {
                $path = "badges/{$userBadge->id}.pdf";
                Storage::disk('local')->put($path, $binary);
                $userBadge->pdf_path = $path;
                $userBadge->rendered_at = now();
            }
        } catch (\Throwable $e) {
            Log::error('Badge PDF render failed', ['user_badge_id' => $userBadge->id, 'error' => $e->getMessage()]);
        }

        $userBadge->save();
    }

    /**
     * Live preview for the admin settings pages — always renders against
     * whatever template image is already saved on disk (upload+save that
     * first), but applies the admin's current, possibly-unsaved field
     * edits directly, same UX convention as the ad-hoc generator's and
     * attending-flyer's preview buttons.
     */
    public function previewCertificate(string $templateImagePath, array $fields, ?array $signature, array $previewValues = []): string
    {
        $resolved = array_merge([
            'recipient_name'   => 'Jane Doe',
            'course_title'     => 'Sample Course',
            'issue_date'       => now()->format('F j, Y'),
            'reference_number' => 'LX-CERT-000000',
            'signer_name'      => 'Signer Name',
        ], $previewValues);

        return $this->render($templateImagePath, $fields, $resolved, $signature);
    }

    public function previewBadge(string $templateImagePath, array $fields, array $previewValues = []): string
    {
        $resolved = array_merge([
            'recipient_name'    => 'Jane Doe',
            'badge_name'        => 'ACTIVE MEMBER',
            'badge_description' => 'Thank you for being engaged, supportive and making an impact!',
            'course_title'      => 'Sample Course',
            'issue_date'        => now()->format('F j, Y'),
            'reference_number'  => 'LX-BADGE-000000',
        ], $previewValues);

        return $this->render($templateImagePath, $fields, $resolved, null);
    }

    private function render(string $templateImagePath, array $fields, array $resolved, ?array $signature): string
    {
        $absolutePath = Storage::disk('public')->path($templateImagePath);
        if (! is_file($absolutePath)) {
            throw new RuntimeException('Template image is missing on disk.');
        }

        // getimagesize() is core PHP — no GD extension required — so this
        // rendering path works even where the ad-hoc generator's GD-based
        // one doesn't.
        $info = @getimagesize($absolutePath);
        if (! $info) {
            throw new RuntimeException('Unable to read template image dimensions.');
        }
        [$widthPx, $heightPx] = $info;

        $imageDataUri = $this->imageDataUri($templateImagePath);

        $usedFontKeys = array_unique(array_map(fn ($f) => $f['font'] ?? 'sans-regular', $fields)) ?: ['sans-regular'];
        $fontFaces = [];
        foreach ($usedFontKeys as $key) {
            $font = self::FONTS[$key] ?? self::FONTS['sans-regular'];
            $fontPath = resource_path('fonts/' . $font['file']);
            if (! is_file($fontPath)) {
                continue;
            }
            $fontFaces[] = [
                'family'  => 'tf-' . $key,
                'weight'  => $font['weight'],
                'style'   => $font['style'],
                'dataUri' => 'data:font/ttf;base64,' . base64_encode(file_get_contents($fontPath)),
            ];
        }

        $renderFields = [];
        foreach ($fields as $field) {
            $source = $field['source'] ?? 'admin';
            $text = $source === 'admin' ? ($field['text'] ?? '') : ($resolved[$source] ?? '');
            $text = trim((string) $text);
            if ($text === '') {
                continue;
            }
            $align = $field['align'] ?? 'left';
            $renderFields[] = [
                'text'          => $text,
                'x_pct'         => (float) ($field['x_pct'] ?? 0),
                'y_pct'         => (float) ($field['y_pct'] ?? 0),
                'max_width_pct' => (float) ($field['max_width_pct'] ?? 80),
                'align'         => $align,
                'color'         => $field['color'] ?? '#000000',
                'font_family'   => 'tf-' . ($field['font'] ?? 'sans-regular'),
                // The PDF page is sized to exactly match the template
                // image's own pixel dimensions (see setPaper() below), so
                // a field's font_size (defined against that same pixel
                // space) maps 1:1 to CSS px here — no rescaling needed.
                'font_size_px'  => (float) ($field['font_size'] ?? 24),
                'line_height'   => (float) ($field['line_height'] ?? 1.2),
            ];
        }

        $signatureView = null;
        if ($signature && $signature['dataUri']) {
            $signatureView = $signature;
        }

        // 1px at 96dpi == 0.75pt — size the PDF page to match the
        // template image's own aspect ratio instead of forcing A4.
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('templates.dynamic_render', [
            'imageDataUri' => $imageDataUri,
            'widthPx'      => $widthPx,
            'heightPx'     => $heightPx,
            'fields'       => $renderFields,
            'fontFaces'    => $fontFaces,
            'signature'    => $signatureView,
        ])->setPaper([0, 0, $widthPx * 0.75, $heightPx * 0.75]);

        return $pdf->output();
    }

    private function imageDataUri(string $storagePath): string
    {
        $absolutePath = Storage::disk('public')->path($storagePath);
        $info = @getimagesize($absolutePath);
        $mime = $info['mime'] ?? 'image/png';

        return "data:{$mime};base64," . base64_encode(file_get_contents($absolutePath));
    }
}
