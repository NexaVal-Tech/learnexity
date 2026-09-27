<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CmsGlobal;
use App\Models\CmsMedia;
use App\Models\CmsPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * CMS media library — images (logos, photos, icons) and videos (hero
 * backgrounds, testimonials), stored on the 'public' disk like the other
 * admin uploads in this app.
 *
 * NOTE for deployment: PHP's own upload limits must be at least as large as
 * the video limit below or big uploads fail before Laravel sees them —
 * set upload_max_filesize = 64M and post_max_size = 64M in php.ini (and
 * client_max_body_size 64m in nginx, if used).
 */
class AdminCmsMediaController extends Controller
{
    private const IMAGE_MAX_KB = 8 * 1024;   // 8 MB
    private const VIDEO_MAX_KB = 50 * 1024;  // 50 MB

    private const IMAGE_MIMES = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif', 'ico'];
    private const VIDEO_MIMES = ['mp4', 'webm', 'mov'];

    // GET /api/admin/cms/media?type=image|video&search=&page=
    public function index(Request $request)
    {
        $query = CmsMedia::orderByDesc('created_at');

        if (in_array($request->type, ['image', 'video'], true)) {
            $query->where('type', $request->type);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn ($q) => $q->where('original_name', 'like', "%{$s}%")->orWhere('alt', 'like', "%{$s}%"));
        }

        return response()->json($query->paginate(min((int) ($request->per_page ?? 40), 100)));
    }

    // POST /api/admin/cms/media  (multipart: file, alt?)
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file',
            'alt'  => 'nullable|string|max:255',
        ]);

        $file = $request->file('file');
        $ext = strtolower($file->getClientOriginalExtension() ?: $file->extension());
        $isVideo = in_array($ext, self::VIDEO_MIMES, true);
        $isImage = in_array($ext, self::IMAGE_MIMES, true);

        if (!$isVideo && !$isImage) {
            return response()->json([
                'message' => 'Unsupported file type. Images: ' . implode(', ', self::IMAGE_MIMES) . '. Videos: ' . implode(', ', self::VIDEO_MIMES) . '.',
            ], 422);
        }

        // Re-validate against the real content type, not just the extension.
        $request->validate([
            'file' => $isVideo
                ? 'mimetypes:video/mp4,video/webm,video/quicktime|max:' . self::VIDEO_MAX_KB
                : 'mimes:' . implode(',', self::IMAGE_MIMES) . '|max:' . self::IMAGE_MAX_KB,
        ], [
            'file.max' => $isVideo ? 'Videos must be 50 MB or smaller.' : 'Images must be 8 MB or smaller.',
        ]);

        // SVGs are XML and can carry script; they're only ever shown via
        // <img> on the site (where script can't run), but opening the file
        // URL directly would execute it on the API origin, so refuse any
        // SVG with active content.
        if ($ext === 'svg') {
            $svg = file_get_contents($file->getRealPath()) ?: '';
            if (preg_match('/<script|on[a-z]+\s*=|javascript:|<foreignObject|<iframe|<embed|<object/i', $svg)) {
                return response()->json(['message' => 'This SVG contains scripts or embedded content and can\'t be uploaded. Export a plain SVG or use PNG.'], 422);
            }
        }

        $folder = 'cms/' . ($isVideo ? 'videos' : 'images') . '/' . now()->format('Y/m');
        $name = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) ?: 'file';
        $path = $file->storeAs($folder, $name . '-' . Str::random(8) . '.' . $ext, 'public');

        $width = $height = null;
        if ($isImage && $ext !== 'svg') {
            $dims = @getimagesize($file->getRealPath());
            if ($dims) {
                [$width, $height] = $dims;
            }
        }

        $media = CmsMedia::create([
            'type'          => $isVideo ? 'video' : 'image',
            'path'          => $path,
            'url'           => Storage::disk('public')->url($path),
            'mime_type'     => $file->getMimeType() ?? 'application/octet-stream',
            'size'          => $file->getSize(),
            'original_name' => mb_substr($file->getClientOriginalName(), 0, 255),
            'alt'           => $request->alt,
            'width'         => $width,
            'height'        => $height,
            'uploaded_by'   => $request->user()->id,
        ]);

        return response()->json(['media' => $media], 201);
    }

    // PATCH /api/admin/cms/media/{id}
    public function update(Request $request, int $id)
    {
        $request->validate(['alt' => 'nullable|string|max:255']);
        $media = CmsMedia::findOrFail($id);
        $media->update(['alt' => $request->alt]);
        return response()->json(['media' => $media]);
    }

    // DELETE /api/admin/cms/media/{id}?force=1
    public function destroy(Request $request, int $id)
    {
        $media = CmsMedia::findOrFail($id);

        // Refuse to delete a file that's still used on a page/navbar/footer
        // (it would leave a broken image on the live site) unless forced.
        $usedIn = $this->usages($media->url);
        if ($usedIn && !$request->boolean('force')) {
            return response()->json([
                'message' => 'This file is still used on: ' . implode(', ', $usedIn) . '. Replace it there first, or delete anyway.',
                'used_in' => $usedIn,
            ], 409);
        }

        Storage::disk('public')->delete($media->path);
        $media->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    /** Titles of pages/globals whose saved content references this URL. */
    private function usages(string $url): array
    {
        $needle = json_encode($url);
        $needle = substr($needle, 1, -1); // JSON-escaped form, as stored

        $used = [];
        foreach (CmsPage::all(['slug', 'title', 'sections', 'seo']) as $p) {
            if (str_contains(json_encode([$p->sections, $p->seo]), $needle)) {
                $used[] = $p->title;
            }
        }
        foreach (CmsGlobal::all(['key', 'data']) as $g) {
            if (str_contains(json_encode($g->data), $needle)) {
                $used[] = ucfirst($g->key);
            }
        }
        return $used;
    }
}
