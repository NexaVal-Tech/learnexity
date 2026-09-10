<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CertificateSignerSetting;
use App\Models\CourseCertificateTemplate;
use App\Services\DynamicTemplateRenderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

/**
 * The one platform-wide certificate design used for every course-completion
 * certificate — see CourseCertificateTemplate.
 */
class AdminCourseCertificateTemplateController extends Controller
{
    public function __construct(private DynamicTemplateRenderService $renderService)
    {
    }

    public function getSettings(): JsonResponse
    {
        return response()->json([
            'template'     => CourseCertificateTemplate::current(),
            'signer'       => CertificateSignerSetting::current(),
            'font_options' => $this->renderService->fontOptions(),
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'template_image'       => 'nullable|image|max:8192',
            'fields'                => 'nullable|string',
            'signature_x_pct'       => 'sometimes|numeric|min:0|max:100',
            'signature_y_pct'       => 'sometimes|numeric|min:0|max:100',
            'signature_width_pct'   => 'sometimes|numeric|min:1|max:100',
        ]);

        $template = CourseCertificateTemplate::current();

        foreach (['signature_x_pct', 'signature_y_pct', 'signature_width_pct'] as $key) {
            if (isset($validated[$key])) {
                $template->{$key} = $validated[$key];
            }
        }

        $fields = $this->decodeFields($request->input('fields'));
        if ($fields !== null) {
            $template->fields = $fields;
        }

        if ($request->hasFile('template_image')) {
            if ($template->template_image_path && Storage::disk('public')->exists($template->template_image_path)) {
                Storage::disk('public')->delete($template->template_image_path);
            }
            $template->template_image_path = $request->file('template_image')->store('course-certificate-template', 'public');
        }

        $template->save();

        return response()->json(['message' => 'Certificate template updated', 'template' => $template]);
    }

    /** Live preview — uses the last-saved template image + current (possibly unsaved) field edits. */
    public function previewCertificate(Request $request): Response|JsonResponse
    {
        $template = CourseCertificateTemplate::current();
        if (! $template->template_image_path) {
            return response()->json(['message' => 'Upload and save a template image first.'], 422);
        }

        $fields = $this->decodeFields($request->input('fields')) ?? ($template->fields ?? []);
        $signer = CertificateSignerSetting::current();

        $signature = null;
        if ($signer->signature_path) {
            $signature = [
                'x_pct'     => (float) $request->input('signature_x_pct', $template->signature_x_pct),
                'y_pct'     => (float) $request->input('signature_y_pct', $template->signature_y_pct),
                'width_pct' => (float) $request->input('signature_width_pct', $template->signature_width_pct),
                'dataUri'   => 'data:image/png;base64,' . base64_encode(Storage::disk('public')->get($signer->signature_path)),
            ];
        }

        try {
            $binary = $this->renderService->previewCertificate(
                $template->template_image_path,
                $fields,
                $signature,
                [
                    'recipient_name' => $request->input('preview_name') ?: 'Jane Doe',
                    'signer_name'    => $signer->signer_name ?: 'Signer Name',
                ]
            );

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
