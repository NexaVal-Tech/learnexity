<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CmsGlobal;
use App\Models\CmsPage;
use App\Models\CmsRevision;
use App\Services\CmsContentSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Admin CMS: pages (built-in + page-builder), site globals (navbar/footer)
 * and revision history. Media lives in AdminCmsMediaController.
 *
 * Every write snapshots the previous state into cms_revisions first, so
 * any save — including "reset to defaults" and deleting a custom page —
 * can be rolled back from the editor.
 */
class AdminCmsController extends Controller
{
    private const MAX_SECTIONS = 100;
    private const MAX_PAYLOAD_BYTES = 2_000_000;

    public function __construct(private CmsContentSanitizer $sanitizer) {}

    // ─── Pages ────────────────────────────────────────────────────────────────

    // GET /api/admin/cms/pages
    public function index()
    {
        $rows = CmsPage::all()->keyBy('slug');

        $system = [];
        foreach (CmsPage::SYSTEM_PAGES as $slug => [$title, $path]) {
            $row = $rows[$slug] ?? null;
            $system[] = [
                'slug'           => $slug,
                'title'          => $title,
                'path'           => $path,
                'is_system'      => true,
                'is_published'   => true,
                'is_customized'  => (bool) $row,
                'section_count'  => $row ? count($row->sections ?? []) : null,
                'updated_at'     => $row?->updated_at,
            ];
        }

        $custom = $rows->filter(fn ($p) => !$p->is_system)->values()->map(fn ($p) => [
            'slug'          => $p->slug,
            'title'         => $p->title,
            'path'          => CmsPage::pathFor($p->slug, false),
            'is_system'     => false,
            'is_published'  => $p->is_published,
            'is_customized' => true,
            'section_count' => count($p->sections ?? []),
            'updated_at'    => $p->updated_at,
        ]);

        return response()->json([
            'system_pages' => $system,
            'custom_pages' => $custom,
            'globals'      => CmsGlobal::whereIn('key', CmsGlobal::KEYS)->get(['key', 'updated_at']),
        ]);
    }

    // GET /api/admin/cms/pages/{slug}
    public function show(string $slug)
    {
        $page = CmsPage::where('slug', $slug)->first();

        if (!$page && !isset(CmsPage::SYSTEM_PAGES[$slug])) {
            return response()->json(['message' => 'Page not found.'], 404);
        }

        return response()->json([
            // null page for a built-in page = never edited; the editor
            // loads that page's defaults from the frontend.
            'page' => $page ? $this->presentPage($page) : null,
            'meta' => $this->pageMeta($slug, $page),
        ]);
    }

    // POST /api/admin/cms/pages — create a page-builder page
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'slug'  => ['required', 'string', 'max:120', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'sections' => 'nullable|array',
        ]);

        if ($error = $this->slugError($validated['slug'])) {
            return response()->json(['message' => $error, 'errors' => ['slug' => [$error]]], 422);
        }

        $sections = $this->validatedSections($request->input('sections', []));
        if (is_string($sections)) {
            return response()->json(['message' => $sections], 422);
        }

        $page = CmsPage::create([
            'slug'         => $validated['slug'],
            'title'        => $validated['title'],
            'is_system'    => false,
            'is_published' => false, // drafts until the admin publishes
            'seo'          => ['title' => $validated['title']],
            'sections'     => $sections,
            'updated_by'   => $request->user()->id,
        ]);

        return response()->json(['page' => $this->presentPage($page), 'meta' => $this->pageMeta($page->slug, $page)], 201);
    }

    // PUT /api/admin/cms/pages/{slug} — save content/settings (upserts built-in pages)
    public function update(Request $request, string $slug)
    {
        $page = CmsPage::where('slug', $slug)->first();
        $isSystem = isset(CmsPage::SYSTEM_PAGES[$slug]);

        if (!$page && !$isSystem) {
            return response()->json(['message' => 'Page not found.'], 404);
        }

        $request->validate([
            'title'           => 'sometimes|string|max:200',
            'is_published'    => 'sometimes|boolean',
            'new_slug'        => ['sometimes', 'string', 'max:120', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'seo'             => 'sometimes|nullable|array',
            'seo.title'       => 'nullable|string|max:200',
            'seo.description' => 'nullable|string|max:500',
            'seo.og_image'    => 'nullable|string|max:500',
            'sections'        => 'sometimes|array',
            // Optimistic concurrency: the editor sends the updated_at it
            // loaded; if someone else saved in between, refuse rather than
            // silently overwrite their work.
            'base_updated_at' => 'sometimes|nullable|string',
        ]);

        if ($page && $request->filled('base_updated_at')
            && optional($page->updated_at)->toISOString() !== $request->input('base_updated_at')) {
            return response()->json([
                'message' => 'This page was changed by someone else since you opened it. Reload to see their changes before saving.',
                'conflict' => true,
            ], 409);
        }

        $data = [];

        if ($request->has('sections')) {
            $sections = $this->validatedSections($request->input('sections'));
            if (is_string($sections)) {
                return response()->json(['message' => $sections], 422);
            }
            $data['sections'] = $sections;
        }

        if ($request->has('seo')) {
            $data['seo'] = $this->sanitizer->sanitize($request->input('seo') ?? []);
        }

        if (!$isSystem) {
            if ($request->has('title')) {
                $data['title'] = $request->input('title');
            }
            if ($request->has('is_published')) {
                $data['is_published'] = $request->boolean('is_published');
            }
            if ($request->filled('new_slug') && $request->input('new_slug') !== $slug) {
                if ($error = $this->slugError($request->input('new_slug'))) {
                    return response()->json(['message' => $error, 'errors' => ['new_slug' => [$error]]], 422);
                }
                $data['slug'] = $request->input('new_slug');
            }
        }

        $adminId = $request->user()->id;

        $page = DB::transaction(function () use ($page, $slug, $isSystem, $data, $adminId) {
            if ($page) {
                CmsRevision::record('page', $slug, $this->snapshotPage($page), $adminId);
                $page->fill($data + ['updated_by' => $adminId])->save();
                return $page->fresh();
            }

            return CmsPage::create($data + [
                'slug'         => $slug,
                'title'        => CmsPage::SYSTEM_PAGES[$slug][0],
                'is_system'    => true,
                'is_published' => true,
                'sections'     => $data['sections'] ?? [],
                'updated_by'   => $adminId,
            ]);
        });

        return response()->json([
            'message'  => 'Saved.',
            'page'     => $this->presentPage($page),
            'meta'     => $this->pageMeta($page->slug, $page),
            // Old path too, if a custom page was re-slugged, so the
            // frontend can revalidate (and thereby 404) the old URL.
            'old_path' => $slug !== $page->slug ? CmsPage::pathFor($slug, false) : null,
        ]);
    }

    // DELETE /api/admin/cms/pages/{slug}
    // Custom page: deletes it. Built-in page: resets it to its defaults.
    public function destroy(Request $request, string $slug)
    {
        $page = CmsPage::where('slug', $slug)->first();
        if (!$page) {
            return response()->json(['message' => 'Nothing to delete — this page is already using its defaults.'], 404);
        }

        CmsRevision::record('page', $slug, $this->snapshotPage($page), $request->user()->id);
        $path = CmsPage::pathFor($page->slug, $page->is_system);
        $page->delete();

        return response()->json([
            'message' => $page->is_system ? 'Page reset to its default content.' : 'Page deleted.',
            'path'    => $path,
        ]);
    }

    // ─── Globals (navbar, footer) ────────────────────────────────────────────

    // GET /api/admin/cms/globals/{key}
    public function showGlobal(string $key)
    {
        abort_unless(in_array($key, CmsGlobal::KEYS, true), 404);
        $row = CmsGlobal::where('key', $key)->first();

        return response()->json([
            'key'        => $key,
            'data'       => $row?->data, // null = still on defaults
            'updated_at' => $row?->updated_at,
        ]);
    }

    // PUT /api/admin/cms/globals/{key}
    public function updateGlobal(Request $request, string $key)
    {
        abort_unless(in_array($key, CmsGlobal::KEYS, true), 404);

        $request->validate([
            'data'            => 'required|array',
            'base_updated_at' => 'sometimes|nullable|string',
        ]);

        if (strlen(json_encode($request->input('data'))) > self::MAX_PAYLOAD_BYTES) {
            return response()->json(['message' => 'Content is too large to save.'], 422);
        }

        $row = CmsGlobal::where('key', $key)->first();

        if ($row && $request->filled('base_updated_at')
            && optional($row->updated_at)->toISOString() !== $request->input('base_updated_at')) {
            return response()->json([
                'message' => 'This was changed by someone else since you opened it. Reload before saving.',
                'conflict' => true,
            ], 409);
        }

        $adminId = $request->user()->id;
        $clean = $this->sanitizer->sanitize($request->input('data'));

        $row = DB::transaction(function () use ($row, $key, $clean, $adminId) {
            if ($row) {
                CmsRevision::record('global', $key, ['data' => $row->data], $adminId);
                $row->update(['data' => $clean, 'updated_by' => $adminId]);
                return $row->fresh();
            }
            return CmsGlobal::create(['key' => $key, 'data' => $clean, 'updated_by' => $adminId]);
        });

        return response()->json(['message' => 'Saved.', 'key' => $key, 'data' => $row->data, 'updated_at' => $row->updated_at]);
    }

    // DELETE /api/admin/cms/globals/{key} — reset to defaults
    public function resetGlobal(Request $request, string $key)
    {
        abort_unless(in_array($key, CmsGlobal::KEYS, true), 404);
        $row = CmsGlobal::where('key', $key)->first();
        if ($row) {
            CmsRevision::record('global', $key, ['data' => $row->data], $request->user()->id);
            $row->delete();
        }
        return response()->json(['message' => 'Reset to defaults.']);
    }

    // ─── Revisions ────────────────────────────────────────────────────────────

    // GET /api/admin/cms/revisions?type=page|global&key=home
    public function revisions(Request $request)
    {
        $request->validate([
            'type' => ['required', Rule::in(['page', 'global'])],
            'key'  => 'required|string|max:120',
        ]);

        $revisions = CmsRevision::with('admin:id,name,email')
            ->where('subject_type', $request->type)
            ->where('subject_key', $request->key)
            ->orderByDesc('id')
            ->get(['id', 'subject_type', 'subject_key', 'admin_id', 'created_at']);

        return response()->json(['revisions' => $revisions]);
    }

    // GET /api/admin/cms/revisions/{id} — full snapshot, for preview/restore
    public function revision(int $id)
    {
        return response()->json(['revision' => CmsRevision::with('admin:id,name,email')->findOrFail($id)]);
    }

    // POST /api/admin/cms/revisions/{id}/restore
    public function restore(Request $request, int $id)
    {
        $rev = CmsRevision::findOrFail($id);
        $adminId = $request->user()->id;
        $snap = $rev->snapshot;

        if ($rev->subject_type === 'global') {
            abort_unless(in_array($rev->subject_key, CmsGlobal::KEYS, true), 404);
            $row = CmsGlobal::firstOrNew(['key' => $rev->subject_key]);
            if ($row->exists) {
                CmsRevision::record('global', $rev->subject_key, ['data' => $row->data], $adminId);
            }
            $row->fill(['data' => $snap['data'] ?? null, 'updated_by' => $adminId])->save();

            return response()->json(['message' => 'Restored.', 'type' => 'global', 'key' => $rev->subject_key]);
        }

        $slug = $rev->subject_key;
        $page = CmsPage::where('slug', $slug)->first();

        // A deleted custom page whose slug has since been taken by another
        // page can't be restored in place.
        if (!$page && !isset(CmsPage::SYSTEM_PAGES[$slug]) && $this->slugError($slug)) {
            return response()->json(['message' => 'That page\'s URL is now used by another page, so it can\'t be restored.'], 422);
        }

        if ($page) {
            CmsRevision::record('page', $slug, $this->snapshotPage($page), $adminId);
        } else {
            $page = new CmsPage(['slug' => $slug, 'is_system' => isset(CmsPage::SYSTEM_PAGES[$slug])]);
        }

        $page->fill([
            'title'        => $snap['title'] ?? ($page->title ?: (CmsPage::SYSTEM_PAGES[$slug][0] ?? $slug)),
            'is_published' => $page->is_system ? true : ($snap['is_published'] ?? false),
            'seo'          => $snap['seo'] ?? null,
            'sections'     => $snap['sections'] ?? [],
            'updated_by'   => $adminId,
        ])->save();

        return response()->json([
            'message' => 'Restored.',
            'type'    => 'page',
            'page'    => $this->presentPage($page->fresh()),
        ]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /** @return array|string sanitized sections, or an error message */
    private function validatedSections(mixed $sections): array|string
    {
        if (!is_array($sections) || !array_is_list($sections)) {
            return 'Sections must be a list.';
        }
        if (count($sections) > self::MAX_SECTIONS) {
            return 'A page can have at most ' . self::MAX_SECTIONS . ' sections.';
        }
        if (strlen(json_encode($sections)) > self::MAX_PAYLOAD_BYTES) {
            return 'This page\'s content is too large to save. Try splitting it into more pages.';
        }

        $clean = [];
        $seen = [];
        foreach ($sections as $i => $s) {
            if (!is_array($s) || !isset($s['id'], $s['type']) || !is_string($s['id']) || !is_string($s['type'])) {
                return 'Section #' . ($i + 1) . ' is malformed.';
            }
            if (strlen($s['id']) > 64 || strlen($s['type']) > 80 || !preg_match('/^[a-zA-Z0-9._-]+$/', $s['type'])) {
                return 'Section #' . ($i + 1) . ' has an invalid id or type.';
            }
            if (isset($seen[$s['id']])) {
                return 'Two sections share the same id — reload the editor and try again.';
            }
            $seen[$s['id']] = true;

            // Optional in-page anchor ("/#faqs" links) — letters, digits, dashes.
            $anchor = is_string($s['anchor'] ?? null)
                ? substr(preg_replace('/[^a-z0-9-]+/', '-', strtolower(trim($s['anchor']))), 0, 60)
                : '';

            $clean[] = array_filter([
                'id'     => $s['id'],
                'type'   => $s['type'],
                'hidden' => (bool) ($s['hidden'] ?? false),
                'anchor' => trim($anchor, '-') ?: null,
                'data'   => $this->sanitizer->sanitize(is_array($s['data'] ?? null) ? $s['data'] : []),
            ], fn ($v) => $v !== null);
        }

        return $clean;
    }

    private function slugError(string $slug): ?string
    {
        if (isset(CmsPage::SYSTEM_PAGES[$slug]) || in_array($slug, CmsPage::RESERVED_SLUGS, true)) {
            return "\"/{$slug}\" is already used by a built-in page. Choose a different URL.";
        }
        if (CmsPage::where('slug', $slug)->exists()) {
            return "A page at \"/{$slug}\" already exists.";
        }
        return null;
    }

    private function snapshotPage(CmsPage $page): array
    {
        return [
            'title'        => $page->title,
            'is_published' => $page->is_published,
            'seo'          => $page->seo,
            'sections'     => $page->sections,
        ];
    }

    private function presentPage(CmsPage $page): array
    {
        return [
            'slug'         => $page->slug,
            'title'        => $page->title,
            'is_system'    => $page->is_system,
            'is_published' => $page->is_published,
            'path'         => CmsPage::pathFor($page->slug, $page->is_system),
            'seo'          => $page->seo ?? (object) [],
            'sections'     => $page->sections ?? [],
            'updated_at'   => $page->updated_at?->toISOString(),
        ];
    }

    private function pageMeta(string $slug, ?CmsPage $page): array
    {
        $isSystem = isset(CmsPage::SYSTEM_PAGES[$slug]);
        return [
            'slug'          => $slug,
            'is_system'     => $isSystem,
            'is_customized' => (bool) $page,
            'title'         => $page?->title ?? ($isSystem ? CmsPage::SYSTEM_PAGES[$slug][0] : $slug),
            'path'          => CmsPage::pathFor($slug, $isSystem),
        ];
    }
}
