<?php

namespace App\Helpers;

use Illuminate\Support\Facades\URL;

class ImageHelper
{
    /**
     * Convert image path to full URL
     * Handles both relative paths and absolute URLs
     */
    public static function getImageUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        // If it's already a full URL, return as-is
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        // Generate full storage URL
        return URL::to('/storage/' . ltrim($path, '/'));
    }

    /**
     * Convert multiple image paths
     */
    public static function getImageUrls(array $paths): array
    {
        return array_map(fn($path) => self::getImageUrl($path), $paths);
    }
}
