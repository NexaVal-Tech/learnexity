<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\LandingWebinarMail;
use App\Models\LandingPageSetting;
use App\Models\LandingWebinarRegistration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Free webinar registrations from the landing page.
 *   POST   /api/landing/webinar-register                    public (rate limited)
 *   GET    /api/admin/landing/registrations                 admin (permission: landing)
 *   GET    /api/admin/landing/registrations/export          CSV
 *   DELETE /api/admin/landing/registrations/{id}
 */
class LandingWebinarController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        // Bots fill every field, including this hidden one — pretend it worked.
        if (trim((string) $request->input('website', '')) !== '') {
            return response()->json(['message' => 'Registered']);
        }

        $request->validate([
            'name'       => ['required', 'string', 'min:2', 'max:120', 'regex:/^[\p{L}\p{M}][\p{L}\p{M} .\'\-]*$/u'],
            'email'      => 'required|string|email:rfc|max:190',
            'country'    => ['required', 'string', 'max:80', 'regex:/^[\p{L}\p{M} .,\'()\-&]+$/u'],
            'interest'   => 'nullable|string|max:500',
            'heard_from' => 'nullable|string|max:300',
        ], [
            'name.regex'    => 'Please enter your name using letters only.',
            'country.regex' => 'Please choose your country from the list.',
        ]);

        $form = LandingPageSetting::current()->mergedContent()['webinar_form'] ?? [];
        $clean = fn ($v, int $max) => mb_substr(trim(preg_replace('/[\x00-\x1F\x7F]+/u', ' ', strip_tags((string) $v)) ?? ''), 0, $max);

        $email = mb_strtolower(trim((string) $request->input('email')));
        $title = $clean($form['webinar_title'] ?? 'Learnexity Free Webinar', 200);
        if ($clean($request->input('name'), 120) === '') {
            throw ValidationException::withMessages(['name' => ['Please enter your name.']]);
        }

        $existing = LandingWebinarRegistration::where('email', $email)->where('webinar_title', $title)->first();
        $reg = LandingWebinarRegistration::updateOrCreate(
            ['email' => $email, 'webinar_title' => $title],
            [
                'name'       => $clean($request->input('name'), 120),
                'country'    => $clean($request->input('country'), 80),
                'interest'   => $clean($request->input('interest'), 500) ?: null,
                'heard_from' => $clean($request->input('heard_from'), 300) ?: null,
                'ip_hash'    => hash('sha256', (string) $request->ip() . '|' . config('app.key')),
            ]
        );

        // Emails only for a new registration (re-submitting doesn't spam anyone).
        if (!$existing) {
            try {
                Mail::to($reg->email)->queue((new LandingWebinarMail($reg, $form))->onQueue('emails'));
                $notify = ($form['notify_email'] ?? '') ?: env('ADMIN_NOTIFICATION_EMAIL', env('MAIL_FROM_ADDRESS'));
                if ($notify && filter_var($notify, FILTER_VALIDATE_EMAIL)) {
                    Mail::to($notify)->queue((new LandingWebinarMail($reg, $form, true))->onQueue('emails'));
                }
            } catch (\Throwable $e) {
                Log::error('Landing webinar emails failed: ' . $e->getMessage());
            }
        }

        $digits = preg_replace('/\D+/', '', (string) ($form['whatsapp_number'] ?? '')) ?: '12762528415';
        $msg = (string) ($form['whatsapp_message'] ?? '');

        return response()->json([
            'message'       => 'Registered',
            'already'       => (bool) $existing,
            'whatsapp_url'  => 'https://wa.me/' . $digits . ($msg !== '' ? '?text=' . rawurlencode($msg) : ''),
        ], $existing ? 200 : 201);
    }

    // ── Admin ────────────────────────────────────────────────────────────────

    private function query(Request $request)
    {
        $q = LandingWebinarRegistration::query()->orderByDesc('created_at');
        $search = trim((string) $request->input('search', ''));
        if ($search !== '') {
            $like = '%' . str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], mb_substr($search, 0, 100)) . '%';
            $q->where(function ($w) use ($like) {
                $w->where('name', 'like', $like)->orWhere('email', 'like', $like)->orWhere('country', 'like', $like)
                  ->orWhere('interest', 'like', $like)->orWhere('heard_from', 'like', $like);
            });
        }
        $webinar = trim((string) $request->input('webinar', ''));
        if ($webinar !== '') $q->where('webinar_title', mb_substr($webinar, 0, 200));
        return $q;
    }

    public function index(Request $request): JsonResponse
    {
        $request->validate(['search' => 'nullable|string|max:100', 'webinar' => 'nullable|string|max:200', 'page' => 'nullable|integer|min:1']);
        $page = $this->query($request)->paginate(25);

        return response()->json([
            'registrations' => $page->items(),
            'pagination'    => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()],
            'webinars'      => LandingWebinarRegistration::query()->whereNotNull('webinar_title')->distinct()->orderBy('webinar_title')->pluck('webinar_title'),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $request->validate(['search' => 'nullable|string|max:100', 'webinar' => 'nullable|string|max:200']);
        $query = $this->query($request);

        // Spreadsheet apps run cells that start with = + - @ as formulas.
        $cell = function ($v): string {
            $v = (string) ($v ?? '');
            return preg_match('/^[=+\-@\t\r]/', $v) ? "'" . $v : $v;
        };

        return response()->streamDownload(function () use ($query, $cell) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // UTF-8 BOM for Excel
            fputcsv($out, ['Registered at', 'Name', 'Email', 'Location', 'What they want to learn', 'How they heard about us', 'Webinar']);
            $query->chunk(500, function ($rows) use ($out, $cell) {
                foreach ($rows as $r) {
                    fputcsv($out, array_map($cell, [
                        optional($r->created_at)->toDateTimeString(), $r->name, $r->email, $r->country, $r->interest, $r->heard_from, $r->webinar_title,
                    ]));
                }
            });
            fclose($out);
        }, 'webinar-registrations-' . now()->format('Y-m-d') . '.csv', [
            'Content-Type'  => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store',
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        LandingWebinarRegistration::findOrFail($id)->delete();
        return response()->json(['message' => 'Registration deleted']);
    }
}
