<?php

namespace App\Services;

use App\Models\AttendingFlyerSetting;
use App\Models\CertificateBadgeGenerator;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

/**
 * Composites admin-configured text fields onto an uploaded badge or
 * certificate template image using GD (no extra PHP extension beyond the
 * one virtually every PHP install already has, unlike Imagick). Chosen
 * over dompdf/HTML rendering because the deliverable here is a PNG image
 * matching an exact pre-designed template pixel-for-pixel, not a
 * generated document layout — this is the same category of problem as
 * "print a name onto an event badge template," which GD's TTF text
 * functions handle directly.
 */
class CertificateBadgeRenderService
{
    /** Bundled fonts — shipped in the repo so rendering is identical
     * regardless of what fonts happen to be installed on the server. */
    private const FONTS = [
        'sans-bold'     => 'Poppins-Bold.ttf',
        'sans-medium'   => 'Poppins-Medium.ttf',
        'sans-regular'  => 'Poppins-Regular.ttf',
        'serif'         => 'Lora-Regular.ttf',
        'serif-italic'  => 'Lora-Italic.ttf',
    ];

    public function fontOptions(): array
    {
        return array_keys(self::FONTS);
    }

    /**
     * Render the badge for this generator. $visitorName is only used by
     * fields with source === 'visitor_name' — the reference badge design
     * has none, but a future generator could add one.
     */
    public function renderBadge(CertificateBadgeGenerator $generator, ?string $visitorName = null): string
    {
        if (! $generator->badge_template_path) {
            throw new RuntimeException('This generator has no badge template uploaded yet.');
        }

        return $this->render($generator->badge_template_path, $generator->badge_fields ?? [], $visitorName);
    }

    public function renderCertificate(CertificateBadgeGenerator $generator, ?string $visitorName = null): string
    {
        if (! $generator->certificate_template_path) {
            throw new RuntimeException('This generator has no certificate template uploaded yet.');
        }

        return $this->render(
            $generator->certificate_template_path,
            $generator->certificate_fields ?? [],
            $visitorName,
            $generator->certificate_signature_path
        );
    }

    /**
     * The standalone "I will be attending" flyer (a one-off feature, not
     * part of the reusable generator system above). $photoAbsolutePath is
     * the visitor's uploaded photo — an actual filesystem path so this
     * works equally well with a freshly-uploaded file's tmp path (public
     * generation) or a stored path (not currently used, but keeps the
     * option open).
     */
    public function renderAttendingFlyer(AttendingFlyerSetting $setting, string $photoAbsolutePath, ?string $visitorName = null): string
    {
        if (! $setting->background_template_path) {
            throw new RuntimeException('The attending flyer has no background template uploaded yet.');
        }
        if (! is_file($photoAbsolutePath)) {
            throw new RuntimeException('Photo upload could not be read.');
        }

        $backgroundAbsolutePath = Storage::disk('public')->path($setting->background_template_path);
        if (! is_file($backgroundAbsolutePath)) {
            throw new RuntimeException('Background template image is missing on disk.');
        }

        $image = $this->loadImage($backgroundAbsolutePath);
        $width  = imagesx($image);
        $height = imagesy($image);

        $this->compositePhotoCover(
            $image,
            $photoAbsolutePath,
            (float) $setting->photo_x_pct,
            (float) $setting->photo_y_pct,
            (float) $setting->photo_width_pct,
            (float) $setting->photo_height_pct,
            $width,
            $height
        );

        if ($setting->foreground_template_path) {
            $foregroundAbsolutePath = Storage::disk('public')->path($setting->foreground_template_path);
            if (is_file($foregroundAbsolutePath)) {
                $this->overlayImage($image, $foregroundAbsolutePath, $width, $height);
            }
        }

        foreach ($setting->fields ?? [] as $field) {
            $this->drawField($image, $field, $width, $height, $visitorName);
        }

        ob_start();
        imagepng($image);
        $binary = ob_get_clean();
        imagedestroy($image);

        return $binary;
    }

    /**
     * Crops+scales the visitor's photo to fill the given rectangle
     * (percent-of-canvas) with "object-fit: cover" behavior — fills the
     * whole box without distortion, cropping whichever dimension
     * overflows, centered.
     */
    private function compositePhotoCover($canvas, string $photoPath, float $xPct, float $yPct, float $wPct, float $hPct, int $canvasW, int $canvasH): void
    {
        $photo = $this->loadImage($photoPath);
        $srcW = imagesx($photo);
        $srcH = imagesy($photo);

        $destX = (int) round($xPct / 100 * $canvasW);
        $destY = (int) round($yPct / 100 * $canvasH);
        $destW = (int) round($wPct / 100 * $canvasW);
        $destH = (int) round($hPct / 100 * $canvasH);

        $srcRatio = $srcW / max(1, $srcH);
        $destRatio = $destW / max(1, $destH);

        if ($srcRatio > $destRatio) {
            // source is wider than target box — crop left/right
            $cropH = $srcH;
            $cropW = (int) round($srcH * $destRatio);
            $cropX = (int) round(($srcW - $cropW) / 2);
            $cropY = 0;
        } else {
            // source is taller than target box — crop top/bottom
            $cropW = $srcW;
            $cropH = (int) round($srcW / max(0.0001, $destRatio));
            $cropX = 0;
            $cropY = (int) round(($srcH - $cropH) / 2);
        }

        imagecopyresampled($canvas, $photo, $destX, $destY, $cropX, $cropY, $destW, $destH, $cropW, $cropH);
        imagedestroy($photo);
    }

    /**
     * Overlays a full-canvas foreground image (e.g. a transparent PNG
     * carrying a photo-frame border) on top of whatever's already drawn.
     */
    private function overlayImage($canvas, string $overlayPath, int $canvasW, int $canvasH): void
    {
        $overlay = $this->loadImage($overlayPath);
        $srcW = imagesx($overlay);
        $srcH = imagesy($overlay);

        if ($srcW === $canvasW && $srcH === $canvasH) {
            imagecopy($canvas, $overlay, 0, 0, 0, 0, $srcW, $srcH);
        } else {
            imagecopyresampled($canvas, $overlay, 0, 0, 0, 0, $canvasW, $canvasH, $srcW, $srcH);
        }
        imagedestroy($overlay);
    }

    /**
     * Returns raw PNG binary data (ready to stream or save).
     */
    private function render(string $templatePath, array $fields, ?string $visitorName, ?string $signaturePath = null): string
    {
        $absolutePath = Storage::disk('public')->path($templatePath);
        if (! is_file($absolutePath)) {
            throw new RuntimeException('Template image is missing on disk.');
        }

        $image = $this->loadImage($absolutePath);
        $width  = imagesx($image);
        $height = imagesy($image);

        foreach ($fields as $field) {
            $this->drawField($image, $field, $width, $height, $visitorName);
        }

        if ($signaturePath) {
            $this->drawSignature($image, $signaturePath, $width, $height);
        }

        ob_start();
        imagepng($image);
        $binary = ob_get_clean();
        imagedestroy($image);

        return $binary;
    }

    /**
     * Optional signature image, composited at a fixed spot above the
     * signer name/role fields (matching the reference certificate
     * layout — signature sits just above "MARY EZE" / "Director" on the
     * right-hand side). Not independently repositionable in this first
     * version; swap/remove the upload if a template's signature block
     * sits somewhere very different.
     */
    private function drawSignature($image, string $signaturePath, int $canvasW, int $canvasH): void
    {
        $absolutePath = Storage::disk('public')->path($signaturePath);
        if (! is_file($absolutePath)) {
            return;
        }

        $info = @getimagesize($absolutePath);
        $mime = $info['mime'] ?? null;
        $sig = match ($mime) {
            'image/png'  => imagecreatefrompng($absolutePath),
            'image/jpeg' => imagecreatefromjpeg($absolutePath),
            'image/webp' => function_exists('imagecreatefromwebp') ? imagecreatefromwebp($absolutePath) : null,
            default      => null,
        };
        if (! $sig) {
            return;
        }
        imagesavealpha($sig, true);

        $srcW = imagesx($sig);
        $srcH = imagesy($sig);

        $targetW = (int) round(0.20 * $canvasW);
        $targetH = (int) round($targetW * ($srcH / max(1, $srcW)));

        $x = (int) round(0.72 * $canvasW - $targetW / 2);
        $y = (int) round(0.76 * $canvasH - $targetH);

        imagecopyresampled($image, $sig, $x, $y, 0, 0, $targetW, $targetH, $srcW, $srcH);
        imagedestroy($sig);
    }

    private function loadImage(string $path)
    {
        $info = @getimagesize($path);
        $mime = $info['mime'] ?? null;

        $image = match ($mime) {
            'image/png'  => imagecreatefrompng($path),
            'image/jpeg' => imagecreatefromjpeg($path),
            'image/webp' => function_exists('imagecreatefromwebp') ? imagecreatefromwebp($path) : null,
            default      => null,
        };

        if (! $image) {
            throw new RuntimeException('Unsupported or unreadable template image format.');
        }

        imagesavealpha($image, true);
        imagealphablending($image, true);

        return $image;
    }

    private function drawField($image, array $field, int $canvasW, int $canvasH, ?string $visitorName): void
    {
        $source = $field['source'] ?? 'admin';
        $text   = $source === 'visitor_name'
            ? (trim((string) $visitorName) !== '' ? trim($visitorName) : ($field['text'] ?? ''))
            : ($field['text'] ?? '');

        $text = trim((string) $text);
        if ($text === '') {
            return;
        }

        $fontKey   = $field['font'] ?? 'sans-regular';
        $fontFile  = resource_path('fonts/' . (self::FONTS[$fontKey] ?? self::FONTS['sans-regular']));
        $fontSize  = (float) ($field['font_size'] ?? 24);
        $align     = $field['align'] ?? 'center';
        $lineHeightMultiplier = (float) ($field['line_height'] ?? 1.2);
        $maxWidthPx = ($field['max_width_pct'] ?? 80) / 100 * $canvasW;

        $color = $this->allocateColor($image, $field['color'] ?? '#000000');

        $lines = $this->wrapText($fontFile, $fontSize, $maxWidthPx, $text);
        $lineHeightPx = $fontSize * $lineHeightMultiplier;

        $centerX = ($field['x_pct'] ?? 50) / 100 * $canvasW;
        $centerY = ($field['y_pct'] ?? 50) / 100 * $canvasH;

        $blockHeight = ($lines === [] ? 0 : (count($lines) - 1)) * $lineHeightPx;
        $startY = $centerY - $blockHeight / 2;

        foreach ($lines as $i => $line) {
            $bbox = imagettfbbox($fontSize, 0, $fontFile, $line);
            $lineWidth = abs($bbox[4] - $bbox[0]);

            $x = match ($align) {
                'left'  => $centerX,
                'right' => $centerX - $lineWidth,
                default => $centerX - $lineWidth / 2,
            };

            $y = $startY + ($i * $lineHeightPx);

            imagettftext($image, $fontSize, 0, (int) round($x), (int) round($y), $color, $fontFile, $line);
        }
    }

    /**
     * Greedy word-wrap using actual glyph measurements from the font
     * file, so wrapping is accurate regardless of font/size.
     */
    private function wrapText(string $fontFile, float $fontSize, float $maxWidthPx, string $text): array
    {
        $words = preg_split('/\s+/', $text) ?: [];
        $lines = [];
        $current = '';

        foreach ($words as $word) {
            $candidate = $current === '' ? $word : "{$current} {$word}";
            $bbox = imagettfbbox($fontSize, 0, $fontFile, $candidate);
            $width = abs($bbox[4] - $bbox[0]);

            if ($width > $maxWidthPx && $current !== '') {
                $lines[] = $current;
                $current = $word;
            } else {
                $current = $candidate;
            }
        }

        if ($current !== '') {
            $lines[] = $current;
        }

        return $lines === [] ? [$text] : $lines;
    }

    private function allocateColor($image, string $hex)
    {
        $hex = ltrim($hex, '#');
        if (strlen($hex) === 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }
        if (strlen($hex) !== 6) {
            $hex = '000000';
        }

        [$r, $g, $b] = [
            hexdec(substr($hex, 0, 2)),
            hexdec(substr($hex, 2, 2)),
            hexdec(substr($hex, 4, 2)),
        ];

        return imagecolorallocate($image, $r, $g, $b);
    }
}
