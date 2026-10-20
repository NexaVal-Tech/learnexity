<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TvRegistration;
use App\Models\TvWebinarSetting;
use App\Services\TvWebinarService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Admin → Learnexity TV (permission: tv).
 *
 *   GET    /api/admin/tv/settings
 *   PUT    /api/admin/tv/settings
 *   GET    /api/admin/tv/registrations          ?tier&payment&consultation&search&page
 *   GET    /api/admin/tv/registrations/export   (CSV, same filters)
 *   PUT    /api/admin/tv/registrations/{id}      consultation status / notes / mark paid manually
 *   DELETE /api/admin/tv/registrations/{id}
 *   POST   /api/admin/tv/send-join-link          { audience: all|free|premium, only_unsent, ids? }
 *   POST   /api/admin/tv/send-recording          { only_unsent, ids? }  (paid Premium only)
 */
class AdminTvController extends Controller
{
    public function getSettings(): JsonResponse
    {
        return response()->json(['settings' => $this->presentSettings(TvWebinarSetting::current())]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'             => 'required|string|max:255',
            'event_at'          => 'nullable|date',
            'event_time_label'  => 'nullable|string|max:120',
            'price_usd'         => 'required|numeric|min:0|max:100000',
            'price_ngn'         => 'nullable|numeric|min:0|max:100000000',
            'join_link'         => 'nullable|url:http,https|max:1000',
            'recording_link'    => 'nullable|url:http,https|max:1000',
            'whatsapp_number'   => 'nullable|string|max:30|regex:/^[0-9+()\-\s]*$/',
            'registration_open' => 'boolean',
            'premium_open'      => 'boolean',
            'premium_capacity'  => 'nullable|integer|min:1|max:100000',
        ]);

        $s = TvWebinarSetting::current();
        $s->update($data + [
            'price_ngn'        => $data['price_ngn'] ?? null,
            'premium_capacity' => $data['premium_capacity'] ?? null,
        ]);

        return response()->json(['message' => 'Settings saved', 'settings' => $this->presentSettings($s->fresh())]);
    }

    public function index(Request $request): JsonResponse
    {
        $page = $this->filtered($request)->orderByDesc('created_at')->paginate(25);

        $stats = [
            'total'            => TvRegistration::count(),
            'free'             => TvRegistration::where('tier', 'free')->count(),
            'premium_paid'     => TvRegistration::where('tier', 'premium')->where('payment_status', 'paid')->count(),
            'payment_pending'  => TvRegistration::where('payment_status', 'pending')->count(),
            'to_schedule'      => TvRegistration::where('consultation_status', 'to_schedule')->count(),
            'revenue_usd'      => (float) TvRegistration::where('payment_status', 'paid')->where('currency', 'USD')->sum('amount'),
            'revenue_ngn'      => (float) TvRegistration::where('payment_status', 'paid')->where('currency', 'NGN')->sum('amount'),
            'join_link_unsent' => TvRegistration::whereNull('join_link_sent_at')->count(),
        ];

        return response()->json([
            'registrations' => $page->items(),
            'pagination'    => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()],
            'stats'         => $stats,
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $rows = $this->filtered($request)->orderByDesc('created_at')->get();
        $filename = 'learnexity-tv-registrations-' . now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Name', 'Email', 'Phone', 'Tier', 'Payment', 'Amount', 'Currency', 'Paid with', 'Reference', 'Paid at',
                'Consultation focus', 'Consultation status', 'Consultation at', 'Learn about', 'Career concern', 'Heard from',
                'Join link sent', 'Recording sent', 'Notes', 'Registered at']);
            foreach ($rows as $r) {
                fputcsv($out, array_map([$this, 'csvSafe'], [
                    $r->full_name, $r->email, $r->phone, $r->tier, $r->payment_status, $r->amount, $r->currency,
                    $r->payment_method, $r->transaction_id, optional($r->paid_at)->toDateTimeString(),
                    $r->consultation_focus, $r->consultation_status, optional($r->consultation_at)->toDateTimeString(),
                    $r->learn_about, $r->career_concern, $r->heard_from,
                    optional($r->join_link_sent_at)->toDateTimeString(), optional($r->recording_sent_at)->toDateTimeString(),
                    $r->admin_notes, optional($r->created_at)->toDateTimeString(),
                ]));
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $reg = TvRegistration::findOrFail($id);
        $data = $request->validate([
            'consultation_status' => 'nullable|in:not_applicable,to_schedule,scheduled,done',
            'consultation_at'     => 'nullable|date',
            'admin_notes'         => 'nullable|string|max:5000',
            'phone'               => 'nullable|string|max:30',
            'mark_paid'           => 'nullable|boolean', // e.g. paid by bank transfer
        ]);

        if (!empty($data['mark_paid']) && !$reg->isPremiumPaid()) {
            $s = TvWebinarSetting::current();
            TvWebinarService::markPaid($reg, (float) ($reg->amount ?: $s->price_usd), 'MANUAL-' . $reg->id . '-' . time(), 'manual', $reg->currency ?: 'USD');
            $reg->refresh();
        }

        unset($data['mark_paid']);
        $reg->update(array_filter($data, fn ($v, $k) => $v !== null || in_array($k, ['admin_notes', 'consultation_at'], true), ARRAY_FILTER_USE_BOTH));

        return response()->json(['message' => 'Saved', 'registration' => $reg->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        TvRegistration::findOrFail($id)->delete();
        return response()->json(['message' => 'Registration deleted']);
    }

    public function sendJoinLink(Request $request): JsonResponse
    {
        $data = $request->validate([
            'audience'    => 'required|in:all,free,premium',
            'only_unsent' => 'boolean',
            'ids'         => 'nullable|array|max:5000',
            'ids.*'       => 'integer',
        ]);

        if (!TvWebinarSetting::current()->join_link) {
            return response()->json(['message' => 'Add the joining link in the settings first.'], 422);
        }

        $q = TvRegistration::query();
        if (!empty($data['ids'])) {
            $q->whereIn('id', $data['ids']);
        } else {
            if ($data['audience'] === 'free') $q->where('tier', 'free');
            if ($data['audience'] === 'premium') $q->where('tier', 'premium')->where('payment_status', 'paid');
            // Unpaid premium attempts still have free access.
            if ($data['audience'] === 'all') $q->where(fn ($w) => $w->where('tier', 'free')->orWhere('payment_status', 'paid'));
        }
        if ($request->boolean('only_unsent', true)) $q->whereNull('join_link_sent_at');

        $sent = 0;
        $q->orderBy('id')->chunkById(200, function ($chunk) use (&$sent) {
            foreach ($chunk as $reg) {
                if (TvWebinarService::send($reg, 'join_link')) {
                    $reg->forceFill(['join_link_sent_at' => now()])->save();
                    $sent++;
                }
            }
        });

        return response()->json(['message' => $sent ? "Joining link queued for {$sent} " . ($sent === 1 ? 'person' : 'people') . '.' : 'Nobody to send to.', 'sent' => $sent]);
    }

    public function sendRecording(Request $request): JsonResponse
    {
        $data = $request->validate([
            'only_unsent' => 'boolean',
            'ids'         => 'nullable|array|max:5000',
            'ids.*'       => 'integer',
        ]);

        if (!TvWebinarSetting::current()->recording_link) {
            return response()->json(['message' => 'Add the recording link in the settings first.'], 422);
        }

        $q = TvRegistration::where('tier', 'premium')->where('payment_status', 'paid');
        if (!empty($data['ids'])) $q->whereIn('id', $data['ids']);
        if ($request->boolean('only_unsent', true)) $q->whereNull('recording_sent_at');

        $sent = 0;
        $q->orderBy('id')->chunkById(200, function ($chunk) use (&$sent) {
            foreach ($chunk as $reg) {
                if (TvWebinarService::send($reg, 'recording')) {
                    $reg->forceFill(['recording_sent_at' => now()])->save();
                    $sent++;
                }
            }
        });

        return response()->json(['message' => $sent ? "Recording queued for {$sent} Premium " . ($sent === 1 ? 'member' : 'members') . '.' : 'Nobody to send to.', 'sent' => $sent]);
    }

    // ── helpers ─────────────────────────────────────────────────────────

    private function filtered(Request $request)
    {
        $request->validate([
            'tier'         => 'nullable|in:free,premium',
            'payment'      => 'nullable|in:none,pending,paid,failed',
            'consultation' => 'nullable|in:not_applicable,to_schedule,scheduled,done',
            'search'       => 'nullable|string|max:100',
        ]);

        $q = TvRegistration::query();
        if ($request->filled('tier')) $q->where('tier', $request->tier);
        if ($request->filled('payment')) $q->where('payment_status', $request->payment);
        if ($request->filled('consultation')) $q->where('consultation_status', $request->consultation);
        if ($request->filled('search')) {
            $term = '%' . addcslashes((string) $request->search, '%_\\') . '%';
            $q->where(fn ($w) => $w->where('full_name', 'like', $term)->orWhere('email', 'like', $term)->orWhere('phone', 'like', $term));
        }
        return $q;
    }

    /** Stop spreadsheet formula injection (=, +, -, @ at the start of a cell). */
    private function csvSafe($v): string
    {
        $v = (string) ($v ?? '');
        return preg_match('/^[=+\-@\t\r]/', $v) ? "'" . $v : $v;
    }

    private function presentSettings(TvWebinarSetting $s): array
    {
        return [
            'title'             => $s->title,
            'event_at'          => optional($s->event_at)->toIso8601String(),
            'event_time_label'  => $s->event_time_label,
            'price_usd'         => (float) $s->price_usd,
            'price_ngn'         => $s->price_ngn !== null ? (float) $s->price_ngn : null,
            'join_link'         => $s->join_link,
            'recording_link'    => $s->recording_link,
            'whatsapp_number'   => $s->whatsapp_number,
            'registration_open' => (bool) $s->registration_open,
            'premium_open'      => (bool) $s->premium_open,
            'premium_capacity'  => $s->premium_capacity,
            'premium_seats_left'=> $s->premiumSeatsLeft(),
            'page_url'          => config('app.tv_url'),
        ];
    }
}
