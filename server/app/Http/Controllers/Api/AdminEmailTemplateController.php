<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Support\EmailTemplateRegistry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

/**
 * Website CMS → Emails. Admins edit the subject and (optionally) the
 * heading / body / button of each transactional email. Placeholders like
 * {first_name} are filled when the email is sent.
 */
class AdminEmailTemplateController extends Controller
{
    private function viewData(string $key, array $input): array
    {
        $def = EmailTemplateRegistry::get($key)['defaults'];

        return EmailTemplate::viewData(
            heading: ($input['heading'] ?? '') !== '' ? $input['heading'] : $def['heading'],
            body: ($input['body'] ?? '') !== '' ? $input['body'] : $def['body'],
            button: array_key_exists('button_label', $input) && $input['button_label'] !== null ? $input['button_label'] : $def['button'],
            vars: EmailTemplateRegistry::sampleVars($key),
            buttonUrl: rtrim((string) config('app.frontend_url', 'https://learnexity.org'), '/'),
        );
    }

    // GET /api/admin/cms/emails
    public function index()
    {
        $rows = EmailTemplate::all()->keyBy('key');
        $list = [];
        foreach (EmailTemplateRegistry::all() as $key => $def) {
            $row = $rows[$key] ?? null;
            $list[] = [
                'key'         => $key,
                'label'       => $def['label'],
                'group'       => $def['group'],
                'description' => $def['description'],
                'customized'  => (bool) $row,
                'customize_body' => (bool) $row?->customize_body,
                'updated_at'  => $row?->updated_at,
            ];
        }
        return response()->json(['templates' => $list]);
    }

    // GET /api/admin/cms/emails/{key}
    public function show(string $key)
    {
        $def = EmailTemplateRegistry::get($key);
        abort_unless($def, 404);
        $row = EmailTemplate::where('key', $key)->first();

        return response()->json([
            'key'          => $key,
            'label'        => $def['label'],
            'description'  => $def['description'],
            'placeholders' => collect($def['placeholders'])->map(fn ($p, $name) => ['name' => $name, 'label' => $p[0], 'sample' => $p[1]])->values(),
            'defaults'     => $def['defaults'],
            'template'     => $row ? [
                'subject'        => $row->subject,
                'customize_body' => $row->customize_body,
                'heading'        => $row->heading,
                'body'           => $row->body,
                'button_label'   => $row->button_label,
                'updated_at'     => $row->updated_at,
            ] : null,
        ]);
    }

    // PUT /api/admin/cms/emails/{key}
    public function update(Request $request, string $key)
    {
        abort_unless(EmailTemplateRegistry::get($key), 404);

        $data = $request->validate([
            'subject'        => 'nullable|string|max:255',
            'customize_body' => 'boolean',
            'heading'        => 'nullable|string|max:255',
            'body'           => 'nullable|string|max:20000',
            'button_label'   => 'nullable|string|max:120',
        ]);

        $row = EmailTemplate::updateOrCreate(['key' => $key], [
            'subject'        => $data['subject'] ?? null,
            'customize_body' => (bool) ($data['customize_body'] ?? false),
            'heading'        => $data['heading'] ?? null,
            'body'           => $data['body'] ?? null,
            'button_label'   => $data['button_label'] ?? null,
            'updated_by'     => $request->user()?->id,
        ]);
        EmailTemplate::flushCache();

        return response()->json(['message' => 'Saved.', 'template' => $row]);
    }

    // DELETE /api/admin/cms/emails/{key} — back to the original email
    public function destroy(string $key)
    {
        abort_unless(EmailTemplateRegistry::get($key), 404);
        EmailTemplate::where('key', $key)->delete();
        EmailTemplate::flushCache();

        return response()->json(['message' => 'Reset to the original email.']);
    }

    // POST /api/admin/cms/emails/{key}/preview — HTML of the customised layout with sample values
    public function preview(Request $request, string $key)
    {
        abort_unless(EmailTemplateRegistry::get($key), 404);
        $input = $request->only(['subject', 'heading', 'body', 'button_label']);
        $vars = EmailTemplateRegistry::sampleVars($key);
        $def = EmailTemplateRegistry::get($key)['defaults'];

        return response()->json([
            'subject' => EmailTemplate::fill(($input['subject'] ?? '') !== '' ? $input['subject'] : $def['subject'], $vars),
            'html'    => view('emails.cms_template', $this->viewData($key, $input))->render(),
        ]);
    }

    // POST /api/admin/cms/emails/{key}/test — send the customised layout to the admin
    public function test(Request $request, string $key)
    {
        abort_unless(EmailTemplateRegistry::get($key), 404);
        $to = $request->user()?->email;
        abort_unless($to, 422, 'Your admin account has no email address.');

        $input = $request->only(['subject', 'heading', 'body', 'button_label']);
        $vars = EmailTemplateRegistry::sampleVars($key);
        $def = EmailTemplateRegistry::get($key)['defaults'];
        $subject = '[Test] ' . EmailTemplate::fill(($input['subject'] ?? '') !== '' ? $input['subject'] : $def['subject'], $vars);
        $html = view('emails.cms_template', $this->viewData($key, $input))->render();

        Mail::html($html, fn ($m) => $m->to($to)->subject($subject));

        return response()->json(['message' => "Test email sent to {$to}."]);
    }
}
