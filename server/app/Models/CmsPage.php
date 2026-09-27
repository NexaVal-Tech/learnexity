<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CmsPage extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'is_system',
        'is_published',
        'seo',
        'sections',
        'updated_by',
    ];

    protected $casts = [
        // is_system / is_published / seo / sections: see accessors below.
        'seo'          => 'array',
        'sections'     => 'array',
    ];

    /**
     * Built-in pages: slug => [title, public path]. These already exist as
     * routes in the frontend, so they can't be deleted or re-slugged, and a
     * custom page can't take one of their slugs. Keep in sync with
     * frontend/lib/cms/pages.ts.
     */
    public const SYSTEM_PAGES = [
        'home'              => ['Homepage', '/'],
        'about'             => ['About Us', '/about'],
        'b2b'               => ['B2B', '/b2b'],
        'community'         => ['Community', '/community'],
        'contact'           => ['Contact Us', '/contact'],
        'our-team'          => ['Meet Our Team', '/our-team'],
        'kids'              => ['Kids', '/kids'],
        'refer-earn'        => ['Refer & Earn', '/refer&earn'],
        'privacy-policy'    => ['Privacy Policy', '/privacy-policy'],
        'terms-of-services' => ['Terms of Service', '/terms-of-services'],
        'refund-policy'     => ['Refund Policy', '/refund-policy'],
    ];

    /**
     * Slugs a custom page can never use, because a real route already
     * lives at /{slug} (a static route would shadow the custom page, and
     * the admin would be left wondering why their page never shows).
     */
    public const RESERVED_SLUGS = [
        'admin', 'api', 'user', 'users', 'instructors', 'instructor', 'courses',
        'course', 'consultation', 'flex', 'free-courses', 'intermediate', 'landing',
        'editor', 'certificate', 'attending', 'ref', 'refer&earn', 'refer-earn',
        'scholarships', 'kids', 'p', '_next', 'static', 'images', 'videos',
        'partners', 'icons', 'thumbnails', 'storage', 'sitemap', 'robots',
        'favicon.ico', '404', '500',
    ];

    /**
     * Built-in-ness comes from the slug, not only the stored flag, so rows
     * with a missing/NULL is_system (e.g. a cms_pages table that predates
     * this CMS) still behave correctly.
     */
    public function getIsSystemAttribute($value): bool
    {
        return isset(self::SYSTEM_PAGES[$this->attributes['slug'] ?? '']) || (bool) $value;
    }

    /** NULL (older rows) counts as published. */
    public function getIsPublishedAttribute($value): bool
    {
        return $value === null ? true : (bool) $value;
    }

    /** Always a list, whatever an older row stored. */
    public function getSectionsAttribute($value): array
    {
        $decoded = is_string($value) ? json_decode($value, true) : $value;
        return is_array($decoded) && array_is_list($decoded) ? $decoded : [];
    }

    /** Always an object-like array. */
    public function getSeoAttribute($value): array
    {
        $decoded = is_string($value) ? json_decode($value, true) : $value;
        return is_array($decoded) ? $decoded : [];
    }

    public static function pathFor(string $slug, ?bool $isSystem = null): string
    {
        $isSystem = $isSystem ?? isset(self::SYSTEM_PAGES[$slug]);
        if ($isSystem && isset(self::SYSTEM_PAGES[$slug])) {
            return self::SYSTEM_PAGES[$slug][1];
        }
        return '/' . $slug;
    }
}
