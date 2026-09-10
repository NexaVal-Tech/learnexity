<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CertificateSignerSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * The one platform-wide "who signs certificates" setting — see
 * CertificateSignerSetting.
 */
class AdminCertificateSignerController extends Controller
{
    public function getSettings(): JsonResponse
    {
        return response()->json(['setting' => CertificateSignerSetting::current()]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'signer_name'  => 'sometimes|required|string|max:255',
            'signer_title' => 'nullable|string|max:255',
            'signature'    => 'nullable|image|max:4096',
        ]);

        $setting = CertificateSignerSetting::current();

        if (isset($validated['signer_name'])) {
            $setting->signer_name = $validated['signer_name'];
        }
        if ($request->has('signer_title')) {
            $setting->signer_title = $validated['signer_title'] ?? null;
        }
        if ($request->hasFile('signature')) {
            if ($setting->signature_path && Storage::disk('public')->exists($setting->signature_path)) {
                Storage::disk('public')->delete($setting->signature_path);
            }
            $setting->signature_path = $request->file('signature')->store('certificate-signer', 'public');
        }

        $setting->save();

        return response()->json(['message' => 'Signer settings updated', 'setting' => $setting]);
    }
}
