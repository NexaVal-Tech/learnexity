<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\CourseEnrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CertificateController extends Controller
{
    /**
     * The authenticated user's certificates, newest first.
     */
    public function mine(Request $request): JsonResponse
    {
        $certificates = Certificate::where('user_id', $request->user()->id)
            ->latest('issued_at')
            ->get();

        return response()->json(['certificates' => $certificates]);
    }

    /**
     * Public download by certificate UID — the link on the "download_url"
     * accessor. Deliberately unauthenticated so a learner can share/verify
     * their certificate, mirroring how most course platforms work.
     * Revoked certificates 410 instead of serving the file.
     *
     * Payment gate: even though a certificate can be auto-issued as soon as
     * course progress hits 100% (which can happen mid-installment-plan), the
     * actual PDF is only released once the student's payment for that course
     * is fully completed (payment_status === 'completed' — not just
     * has_access, which installment plans grant on partial payment). Admins
     * bypass this via AdminCertificateController::download(), which is
     * authenticated separately and doesn't hit this method.
     */
    public function download(string $uid)
    {
        $certificate = Certificate::where('certificate_uid', $uid)->firstOrFail();

        if ($certificate->revoked_at) {
            return response()->json(['message' => 'This certificate has been revoked.'], 410);
        }

        $enrollment = CourseEnrollment::where('user_id', $certificate->user_id)
            ->where('course_id', $certificate->course_id)
            ->first();

        if (!$enrollment || !$enrollment->isPaymentCompleted()) {
            return response()->json([
                'message' => 'Your certificate is ready, but your payment for this course must be fully completed before it can be downloaded.',
                'enrollment_id' => $enrollment?->id,
                'payment_status' => $enrollment?->payment_status ?? 'not_enrolled',
            ], 402);
        }

        $disk = $this->resolveDisk($certificate->pdf_path);
        if (!$disk) {
            return response()->json([
                'message' => 'Certificate PDF is not available yet. Please try again shortly or contact support.',
            ], 503);
        }

        return Storage::disk($disk)->response(
            $certificate->pdf_path,
            "certificate-{$certificate->course_id}.pdf"
        );
    }

    /**
     * New certificates are generated on the private 'local' disk (see
     * CertificateService::generatePdf). Older ones issued before that
     * change may still live on 'public' — check both so nothing already
     * issued breaks.
     */
    private function resolveDisk(?string $path): ?string
    {
        if (!$path) {
            return null;
        }
        if (Storage::disk('local')->exists($path)) {
            return 'local';
        }
        if (Storage::disk('public')->exists($path)) {
            return 'public';
        }
        return null;
    }
}
