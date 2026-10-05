<?php

namespace App\Mail\Concerns;

use App\Models\EmailTemplate;
use App\Support\EmailTemplateRegistry;
use Illuminate\Mail\Mailables\Content;

/**
 * Lets an admin edit a mailable's text in Website CMS → Emails.
 *
 *  - Subject: if the admin set one, it replaces the original subject.
 *  - Content: only when the admin switched on "Customise the content" is
 *    the email sent with their heading / body / button, in the branded
 *    layout (emails/cms_template). Otherwise the original designed email
 *    is sent untouched.
 *
 * A mailable provides:
 *   emailTemplateKey()       — key in App\Support\EmailTemplateRegistry
 *   emailTemplateVars()      — values for the {placeholders}
 *   emailTemplateButtonUrl() — where the button goes (optional)
 *   emailTemplateDetails()   — label => value rows shown under the text (optional)
 */
trait UsesEmailTemplate
{
    abstract protected function emailTemplateKey(): string;

    protected function emailTemplateVars(): array
    {
        return [];
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        return null;
    }

    protected function emailTemplateDetails(): array
    {
        return [];
    }

    protected function templatedSubject(string $default): string
    {
        $row = EmailTemplate::forKey($this->emailTemplateKey());
        $subject = trim((string) $row?->subject);

        return $subject !== '' ? EmailTemplate::fill($subject, $this->emailTemplateVars()) : $default;
    }

    /** True when the admin replaced the designed body with their own text. */
    protected function hasCustomEmailBody(): bool
    {
        return (bool) EmailTemplate::forKey($this->emailTemplateKey())?->customize_body;
    }

    /** View data for emails/cms_template (only meaningful when hasCustomEmailBody()). */
    protected function customEmailViewData(): array
    {
        $key  = $this->emailTemplateKey();
        $row  = EmailTemplate::forKey($key);
        $def  = EmailTemplateRegistry::get($key)['defaults'] ?? ['heading' => '', 'body' => '', 'button' => ''];
        $vars = $this->emailTemplateVars();

        return EmailTemplate::viewData(
            heading: $row?->heading ?: $def['heading'],
            body: $row?->body ?: $def['body'],
            button: $row?->button_label ?? $def['button'],
            vars: $vars,
            buttonUrl: $this->emailTemplateButtonUrl(),
            details: $this->emailTemplateDetails(),
        );
    }

    protected function templatedContent(Content $default): Content
    {
        if (!$this->hasCustomEmailBody()) {
            return $default;
        }

        return new Content(view: 'emails.cms_template', with: $this->customEmailViewData());
    }
}
