<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CertificateBadgeGenerator;
use App\Services\CertificateBadgeRenderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Public, unauthenticated endpoints behind a generator's shareable slug —
 * a visitor types their name and gets back a personalized badge/
 * certificate image. No login, no payment gate; this is a standalone
 * self-serve tool, not tied to real course enrollment.
 */
class CertificateBadgeGeneratorPublicController extends Controller
{
    public function __construct(private CertificateBadgeRenderService $renderService)
    {
    }

    public function show(string $slug): JsonResponse
    {
        $generator = CertificateBadgeGenerator::where('slug', $slug)->where('is_active', true)->first();

        if (! $generator) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json([
            'generator' => [
                'title' => $generator->title,
                'slug'  => $generator->slug,
                'has_badge' => (bool) $generator->badge_template_path,
                'has_certificate' => (bool) $generator->certificate_template_path,
                // Does either template actually have a field the visitor's
                // name gets dropped into? If not, there's nothing for the
                // public page to ask them to type.
                'needs_name' => collect(array_merge($generator->badge_fields ?? [], $generator->certificate_fields ?? []))
                    ->contains(fn ($f) => ($f['source'] ?? null) === 'visitor_name'),
            ],
        ]);
    }

    public function badge(Request $request, string $slug): Response
    {
        $generator = $this->findActiveOrFail($slug);

        try {
            return $this->streamPng($this->renderService->renderBadge($generator, $request->query('name')));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function certificate(Request $request, string $slug): Response
    {
        $generator = $this->findActiveOrFail($slug);

        try {
            return $this->streamPng($this->renderService->renderCertificate($generator, $request->query('name')));
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    private function findActiveOrFail(string $slug): CertificateBadgeGenerator
    {
        $generator = CertificateBadgeGenerator::where('slug', $slug)->where('is_active', true)->first();

        abort_if(! $generator, 404, 'Generator not found or inactive');

        return $generator;
    }

    private function streamPng(string $binary): Response
    {
        return response($binary, 200)->header('Content-Type', 'image/png');
    }
}
