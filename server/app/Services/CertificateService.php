<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\User;
use App\Models\UserCourseStatistic;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Handles certificate issuance (auto + manual), PDF generation, and revocation.
 *
 * PDF generation uses barryvdh/laravel-dompdf. If the package isn't installed
 * yet (composer.json declares it, but `composer install` hasn't been run),
 * generation is skipped gracefully and the certificate record is still
 * created — download() will 503 with a clear message until the package is
 * installed and migrate has been run.
 */
class CertificateService
{
    /**
     * Auto-issue a certificate the moment a user hits 100% course progress.
     * Idempotent — safe to call repeatedly (unique user+course constraint).
     */
    public function autoIssueIfEligible(int $userId, string $courseId): ?Certificate
    {
        $existing = Certificate::where('user_id', $userId)->where('course_id', $courseId)->first();
        if ($existing) {
            return $existing;
        }

        $stats = UserCourseStatistic::where('user_id', $userId)->where('course_id', $courseId)->first();
        if (!$stats || (float) $stats->overall_progress < 100) {
            return null;
        }

        $user = User::find($userId);
        if (!$user) return null;

        return $this->issue($user, $courseId, issueType: 'auto');
    }

    /**
     * Manually issue a certificate (admin action) regardless of progress.
     */
    public function issueManually(User $user, string $courseId, ?int $adminId = null): Certificate
    {
        $existing = Certificate::where('user_id', $user->id)->where('course_id', $courseId)->first();
        if ($existing) {
            // Re-activate if it was revoked, otherwise just return it.
            if ($existing->revoked_at) {
                $existing->update(['revoked_at' => null, 'revoked_reason' => null]);
            }
            return $existing;
        }

        return $this->issue($user, $courseId, issueType: 'manual', adminId: $adminId);
    }

    private function issue(User $user, string $courseId, string $issueType, ?int $adminId = null): Certificate
    {
        $course = Course::where('course_id', $courseId)->firstOrFail();

        $certificate = Certificate::create([
            'certificate_uid'    => (string) Str::uuid(),
            'user_id'            => $user->id,
            'course_id'          => $courseId,
            'course_title'       => $course->title,
            'recipient_name'     => $user->name,
            'issue_type'         => $issueType,
            'issued_by_admin_id' => $adminId,
            'issued_at'          => now(),
        ]);

        $this->generatePdf($certificate);

        Log::info('🎓 Certificate issued', [
            'user_id' => $user->id, 'course_id' => $courseId, 'type' => $issueType,
        ]);

        \App\Services\ActivityLogger::log(
            $issueType === 'auto' ? 'certificate.auto_issued' : 'certificate.manually_issued',
            "{$user->name} was issued a certificate for {$course->title}",
            actorType: $issueType === 'auto' ? 'system' : 'admin',
            actorId: $adminId ?? $user->id,
            actorName: $issueType === 'auto' ? $user->name : null,
            metadata: ['certificate_id' => $certificate->id, 'recipient_id' => $user->id],
            courseId: $courseId
        );

        return $certificate->fresh();
    }

    public function generatePdf(Certificate $certificate): ?string
    {
        if (!class_exists(\Barryvdh\DomPDF\Facade\Pdf::class)) {
            Log::warning('Certificate PDF generation skipped — barryvdh/laravel-dompdf not installed. Run `composer require barryvdh/laravel-dompdf`.');
            return null;
        }

        try {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('certificates.template', [
                'recipientName' => $certificate->recipient_name,
                'courseTitle'   => $certificate->course_title,
                'issuedAt'      => $certificate->issued_at->format('F j, Y'),
                'certificateUid' => $certificate->certificate_uid,
            ])->setPaper('a4', 'landscape');

            // Stored on the 'local' (private, non-web-accessible) disk —
            // NOT 'public'. Certificates are payment-gated (see
            // CertificateController::download()), and the 'public' disk is
            // served directly by the web server via the storage:link
            // symlink with zero access control, which would let anyone who
            // knows/derives the certificate_uid fetch the PDF straight from
            // /storage/certificates/{uid}.pdf and skip the gate entirely.
            // Routing every read through the controller is what makes the
            // payment check actually enforceable.
            $path = "certificates/{$certificate->certificate_uid}.pdf";
            Storage::disk('local')->put($path, $pdf->output());

            $certificate->update(['pdf_path' => $path]);

            return $path;
        } catch (\Throwable $e) {
            Log::error('Certificate PDF generation failed', ['error' => $e->getMessage()]);
            return null;
        }
    }

    public function revoke(Certificate $certificate, ?string $reason = null): Certificate
    {
        $certificate->update([
            'revoked_at'     => now(),
            'revoked_reason' => $reason,
        ]);

        return $certificate->fresh();
    }
}
