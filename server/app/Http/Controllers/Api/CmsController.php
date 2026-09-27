<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CmsGlobal;
use App\Models\CmsPage;

/**
 * Public, read-only CMS endpoints used by the frontend's getStaticProps
 * (and by the navbar/footer's client-side fallback on non-CMS pages).
 *
 * A 404 for a built-in page is normal and just means "not edited yet —
 * render the defaults that ship with the frontend".
 */
class CmsController extends Controller
{
    // GET /api/cms/pages/{slug}
    public function page(string $slug)
    {
        $page = CmsPage::where('slug', $slug)->first();

        if (!$page || (!$page->is_system && !$page->is_published)) {
            return response()->json(['page' => null], 404);
        }

        return response()->json(['page' => $this->present($page)]);
    }

    // GET /api/cms/globals
    public function globals()
    {
        $rows = CmsGlobal::whereIn('key', CmsGlobal::KEYS)->get()->keyBy('key');

        $out = [];
        foreach (CmsGlobal::KEYS as $key) {
            $out[$key] = $rows[$key]->data ?? null;
        }

        return response()->json($out);
    }

    // GET /api/cms/custom-pages — published page-builder pages, for
    // getStaticPaths and sitemaps.
    public function customPages()
    {
        $pages = CmsPage::whereNotIn('slug', array_keys(CmsPage::SYSTEM_PAGES))
            ->orderBy('slug')
            ->get()
            ->filter(fn ($p) => !$p->is_system && $p->is_published)
            ->map(fn ($p) => ['slug' => $p->slug, 'title' => $p->title, 'updated_at' => $p->updated_at])
            ->values();

        return response()->json(['pages' => $pages]);
    }

    private function present(CmsPage $page): array
    {
        return [
            'slug'         => $page->slug,
            'title'        => $page->title,
            'is_system'    => $page->is_system,
            'is_published' => $page->is_published,
            'path'         => CmsPage::pathFor($page->slug, $page->is_system),
            'seo'          => $page->seo ?? (object) [],
            'sections'     => $page->sections ?? [],
            'updated_at'   => $page->updated_at,
        ];
    }
}
