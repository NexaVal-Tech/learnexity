<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CertificateBadgeGenerator;
use App\Services\CertificateBadgeRenderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class AdminCertificateBadgeGeneratorController extends Controller
{
    public function __construct(private CertificateBadgeRenderService $renderService)
    {
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'generators' => CertificateBadgeGenerator::orderByDesc('created_at')->get(),
            'font_options' => $this->renderService->fontOptions(),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json([
            'generator' => CertificateBadgeGenerator::findOrFail($id),
            'font_options' => $this->renderService->fontOptions(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'                      => 'required|string|max:255',
            'is_active'                  => 'sometimes|boolean',
            'badge_template'             => 'nullable|image|max:8192',
            'certificate_template'       => 'nullable|image|max:8192',
            'certificate_signature'      => 'nullable|image|max:4096',
            'badge_fields'               => 'nullable|string',
            'certificate_fields'         => 'nullable|string',
        ]);

        $generator = new CertificateBadgeGenerator();
        $generator->title = $validated['title'];
        $generator->slug = CertificateBadgeGenerator::generateUniqueSlug($validated['title']);
        $generator->is_active = $request->boolean('is_active', true);
        $generator->badge_fields = $this->decodeFields($request->input('badge_fields'))
            ?? CertificateBadgeGenerator::defaultBadgeFields();
        $generator->certificate_fields = $this->decodeFields($request->input('certificate_fields'))
            ?? CertificateBadgeGenerator::defaultCertificateFields();

        if ($request->hasFile('badge_template')) {
            $generator->badge_template_path = $request->file('badge_template')->store('certificate-badge-generators', 'public');
        }
        if ($request->hasFile('certificate_template')) {
            $generator->certificate_template_path = $request->file('certificate_template')->store('certificate-badge-generators', 'public');
        }
        if ($request->hasFile('certificate_signature')) {
            $generator->certificate_signature_path = $request->file('certificate_signature')->store('certificate-badge-generators', 'public');
        }

        $generator->save();

        return response()->json(['message' => 'Generator created', 'generator' => $generator], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $generator = CertificateBadgeGenerator::findOrFail($id);

        $validated = $request->validate([
            'title'                      => 'sometimes|required|string|max:255',
            'is_active'                  => 'sometimes|boolean',
            'badge_template'             => 'nullable|image|max:8192',
            'certificate_template'       => 'nullable|image|max:8192',
            'certificate_signature'      => 'nullable|image|max:4096',
            'badge_fields'               => 'nullable|string',
            'certificate_fields'         => 'nullable|string',
            'remove_certificate_signature' => 'sometimes|boolean',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $generator->title) {
            $generator->title = $validated['title'];
            $generator->slug = CertificateBadgeGenerator::generateUniqueSlug($validated['title'], $generator->id);
        }

        if ($request->has('is_active')) {
            $generator->is_active = $request->boolean('is_active');
        }

        $badgeFields = $this->decodeFields($request->input('badge_fields'));
        if ($badgeFields !== null) {
            $generator->badge_fields = $badgeFields;
        }

        $certificateFields = $this->decodeFields($request->input('certificate_fields'));
        if ($certificateFields !== null) {
            $generator->certificate_fields = $certificateFields;
        }

        if ($request->hasFile('badge_template')) {
            $this->deleteIfExists($generator->badge_template_path);
            $generator->badge_template_path = $request->file('badge_template')->store('certificate-badge-generators', 'public');
        }
        if ($request->hasFile('certificate_template')) {
            $this->deleteIfExists($generator->certificate_template_path);
            $generator->certificate_template_path = $request->file('certificate_template')->store('certificate-badge-generators', 'public');
        }
        if ($request->hasFile('certificate_signature')) {
            $this->deleteIfExists($generator->certificate_signature_path);
            $generator->certificate_signature_path = $request->file('certificate_signature')->store('certificate-badge-generators', 'public');
        } elseif ($request->boolean('remove_certificate_signature')) {
            $this->deleteIfExists($generator->certificate_signature_path);
            $generator->certificate_signature_path = null;
        }

        $generator->save();

        return response()->json(['message' => 'Generator updated', 'generator' => $generator]);
    }

    public function destroy(int $id): JsonResponse
    {
        $generator = CertificateBadgeGenerator::findOrFail($id);

        $this->deleteIfExists($generator->badge_template_path);
        $this->deleteIfExists($generator->certificate_template_path);
        $this->deleteIfExists($generator->certificate_signature_path);

        $generator->delete();

        return response()->json(['message' => 'Generator deleted']);
    }

    /**
     * Live preview while editing — renders straight from the request
     * payload (not what's saved in the DB yet) so the admin can iterate
     * on field positions/text before committing. Falls back to the saved
     * generator's template if a new one hasn't been uploaded in this
     * request.
     */
    public function previewBadge(Request $request, int $id): Response
    {
        $generator = CertificateBadgeGenerator::findOrFail($id);
        $fields = $this->decodeFields($request->input('badge_fields'));
        if ($fields !== null) {
            $generator->badge_fields = $fields;
        }

        try {
            return $this->streamPng($this->renderService->renderBadge($generator, $request->input('preview_name')));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function previewCertificate(Request $request, int $id): Response
    {
        $generator = CertificateBadgeGenerator::findOrFail($id);
        $fields = $this->decodeFields($request->input('certificate_fields'));
        if ($fields !== null) {
            $generator->certificate_fields = $fields;
        }

        $name = $request->input('preview_name') ?: 'Jane Doe';

        try {
            return $this->streamPng($this->renderService->renderCertificate($generator, $name));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    private function decodeFields(?string $json): ?array
    {
        if ($json === null || $json === '') {
            return null;
        }

        $decoded = json_decode($json, true);

        return is_array($decoded) ? $decoded : null;
    }

    private function deleteIfExists(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    private function streamPng(string $binary): Response
    {
        return response($binary, 200)->header('Content-Type', 'image/png');
    }
}
