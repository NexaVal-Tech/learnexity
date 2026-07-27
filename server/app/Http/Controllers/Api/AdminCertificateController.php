<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\User;
use App\Services\CertificateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminCertificateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Certificate::with(['user:id,name,email', 'issuedByAdmin:id,name']);

        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('recipient_name', 'like', "%{$search}%")
                  ->orWhere('course_title', 'like', "%{$search}%")
                  ->orWhere('certificate_uid', 'like', "%{$search}%");
            });
        }
        if ($request->status === 'revoked') {
            $query->whereNotNull('revoked_at');
        } elseif ($request->status === 'active') {
            $query->whereNull('revoked_at');
        }

        $certificates = $query->latest('issued_at')->paginate(25);

        return response()->json($certificates);
    }

    public function statistics(): JsonResponse
    {
        return response()->json([
            'total'   => Certificate::count(),
            'active'  => Certificate::whereNull('revoked_at')->count(),
            'revoked' => Certificate::whereNotNull('revoked_at')->count(),
            'auto'    => Certificate::where('issue_type', 'auto')->count(),
            'manual'  => Certificate::where('issue_type', 'manual')->count(),
        ]);
    }

    public function issue(Request $request, CertificateService $service): JsonResponse
    {
        $validated = $request->validate([
            'user_id'   => 'required|integer|exists:users,id',
            'course_id' => 'required|string|exists:courses,course_id',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $adminId = $request->user()?->id;

        $certificate = $service->issueManually($user, $validated['course_id'], $adminId);

        return response()->json(['message' => 'Certificate issued', 'certificate' => $certificate], 201);
    }

    public function revoke(Request $request, int $id, CertificateService $service): JsonResponse
    {
        $certificate = Certificate::findOrFail($id);
        $service->revoke($certificate, $request->input('reason'));

        return response()->json(['message' => 'Certificate revoked']);
    }

    public function reinstate(int $id): JsonResponse
    {
        $certificate = Certificate::findOrFail($id);
        $certificate->update(['revoked_at' => null, 'revoked_reason' => null]);

        return response()->json(['message' => 'Certificate reinstated', 'certificate' => $certificate]);
    }

    public function regeneratePdf(int $id, CertificateService $service): JsonResponse
    {
        $certificate = Certificate::findOrFail($id);
        $path = $service->generatePdf($certificate);

        if (!$path) {
            return response()->json([
                'message' => 'PDF generation unavailable — install barryvdh/laravel-dompdf on the server (composer install) and try again.',
            ], 503);
        }

        return response()->json(['message' => 'PDF regenerated', 'certificate' => $certificate->fresh()]);
    }

    /**
     * Admin download/preview — bypasses the student payment gate on
     * CertificateController::download(). Admins manage and audit
     * certificates regardless of the student's payment status, so this is
     * a separate, admin.auth-protected route rather than reusing the
     * public download_url.
     */
    public function download(int $id)
    {
        $certificate = Certificate::findOrFail($id);

        $disk = null;
        if ($certificate->pdf_path) {
            if (Storage::disk('local')->exists($certificate->pdf_path)) {
                $disk = 'local';
            } elseif (Storage::disk('public')->exists($certificate->pdf_path)) {
                // Older certificates issued before PDFs moved to the
                // private 'local' disk (see CertificateService::generatePdf).
                $disk = 'public';
            }
        }

        if (!$disk) {
            return response()->json([
                'message' => 'Certificate PDF is not available yet. Try regenerating it.',
            ], 503);
        }

        return Storage::disk($disk)->response(
            $certificate->pdf_path,
            "certificate-{$certificate->course_id}.pdf"
        );
    }
}
