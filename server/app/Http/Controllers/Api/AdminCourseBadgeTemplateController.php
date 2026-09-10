<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CourseBadgeTemplate;
use App\Services\DynamicTemplateRenderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

/**
 * The one platform-wide badge design used for every sprint/course
 * completion badge unlock — see CourseBadgeTemplate.
 */
class AdminCourseBadgeTemplateController extends Controller
{
    public function __construct(private DynamicTemplateRenderService $renderService)
    {
    }

    public function getSettings(): JsonResponse
    {
        return response()->json([
            'template'     => CourseBadgeTemplate::current(),
            'font_options' => $this->renderService->fontOptions(),
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'template_image' => 'nullable|image|max:8192',
            'fields'          => 'nullable|string',
        ]);

        $template = CourseBadgeTemplate::current();

        $fields = $this->decodeFields($request->input('fields'));
        if ($fields !== null) {
            $template->fields = $fields;
        }

        if ($request->hasFile('template_image')) {
            if ($template->template_image_path && Storage::disk('public')->exists($template->template_image_path)) {
                Storage::disk('public')->delete($template->template_image_path);
            }
            $template->template_image_path = $request->file('template_image')->store('course-badge-template', 'public');
        }

        $template->save();

        return response()->json(['message' => 'Badge template updated', 'template' => $template]);
    }

    public function previewBadge(Request $request): Response|JsonResponse
    {
        $template = CourseBadgeTemplate::current();
        if (! $template->template_image_path) {
            return response()->json(['message' => 'Upload and save a template image first.'], 422);
        }

        $fields = $this->decodeFields($request->input('fields')) ?? ($template->fields ?? []);

        try {
            $binary = $this->renderService->previewBadge($template->template_image_path, $fields, [
                'recipient_name' => $request->input('preview_name') ?: 'Jane Doe',
            ]);

            return response($binary, 200)->header('Content-Type', 'application/pdf');
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
}
