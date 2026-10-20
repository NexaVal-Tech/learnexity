<?php

namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;
use App\Models\TvRegistration;
use App\Models\TvWebinarSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * All emails to Learnexity TV webinar registrants.
 *
 *   kind = registered_free | registered_premium | join_link | recording
 *
 * Each kind is editable in Website CMS → Emails (keys tv_*).
 */
class TvWebinarMail extends Mailable
{
    use Queueable, SerializesModels, UsesEmailTemplate;

    public function __construct(
        public TvRegistration $registration,
        public string $kind,
    ) {}

    private function settings(): TvWebinarSetting
    {
        return TvWebinarSetting::current();
    }

    private function firstName(): string
    {
        return explode(' ', trim((string) $this->registration->full_name))[0] ?: 'there';
    }

    private function whatsappUrl(): ?string
    {
        $n = preg_replace('/\D+/', '', (string) $this->settings()->whatsapp_number);
        return $n ? "https://wa.me/{$n}" : null;
    }

    private function eventLabel(): string
    {
        $s = $this->settings();
        if ($s->event_time_label) return $s->event_time_label;
        return $s->event_at ? $s->event_at->format('l, F j, Y · g:i A') . ' (UTC)' : 'Date to be announced';
    }

    private function subjectDefault(): string
    {
        $title = $this->settings()->title;
        return match ($this->kind) {
            'registered_premium' => "Payment confirmed — your Premium Career Pass for \"{$title}\"",
            'join_link'          => "Your joining link: {$title}",
            'recording'          => "Your recording is ready: {$title}",
            default              => "You're registered: {$title}",
        };
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->templatedSubject($this->subjectDefault()));
    }

    public function content(): Content
    {
        $s = $this->settings();
        $r = $this->registration;
        $title = $s->title;

        [$heading, $paragraphs, $buttonUrl, $buttonLabel] = match ($this->kind) {
            'registered_premium' => [
                'Your Premium Career Pass is confirmed',
                [
                    "Thank you — your payment for \"{$title}\" was successful and your Premium Career Pass is active.",
                    'It includes live access, lifetime access to the recordings, the exclusive live Q&A with the speakers, VIP community access and a 1-hour private consultation. Our team will contact you to schedule your consultation.',
                    'Next step: chat with us on WhatsApp to join the community and receive your joining link.',
                ],
                $s->join_link ?: null,
                'Join the webinar',
            ],
            'join_link' => [
                'Here is your joining link',
                ["You're registered for \"{$title}\". Use the button below to join when we go live — we recommend joining a few minutes early."],
                $s->join_link ?: null,
                'Join the webinar',
            ],
            'recording' => [
                'Your recording is ready',
                ["Thank you for being part of \"{$title}\". As a Premium Career Pass holder you have lifetime access to the recording — watch it any time with the button below."],
                $s->recording_link ?: null,
                'Watch the recording',
            ],
            default => [
                "You're registered!",
                [
                    "Thank you for registering for \"{$title}\". Your free live access is reserved.",
                    'Next step: chat with us on WhatsApp to join the official community and receive your joining link.',
                ],
                $s->join_link ?: null,
                'Join the webinar',
            ],
        };

        $details = ['Webinar' => $title, 'When' => $this->eventLabel()];
        if ($this->kind === 'registered_premium' && $r->amount) {
            $details['Amount paid'] = ($r->currency === 'NGN' ? '₦' : '$') . number_format((float) $r->amount, 2);
            if ($r->transaction_id) $details['Reference'] = $r->transaction_id;
        }

        return $this->templatedContent(new Content(
            view: 'emails.tv.message',
            with: [
                'heading'     => $heading,
                'firstName'   => $this->firstName(),
                'paragraphs'  => $paragraphs,
                'details'     => $details,
                'buttonUrl'   => $buttonUrl,
                'buttonLabel' => $buttonLabel,
                'whatsappUrl' => in_array($this->kind, ['registered_free', 'registered_premium'], true) ? $this->whatsappUrl() : null,
            ],
        ));
    }

    // ── Website CMS → Emails ────────────────────────────────────────────
    protected function emailTemplateKey(): string
    {
        return 'tv_' . $this->kind;
    }

    protected function emailTemplateVars(): array
    {
        $s = $this->settings();
        return [
            'name'           => $this->registration->full_name,
            'first_name'     => $this->firstName(),
            'webinar'        => $s->title,
            'when'           => $this->eventLabel(),
            'join_link'      => (string) ($s->join_link ?? ''),
            'recording_link' => (string) ($s->recording_link ?? ''),
            'whatsapp'       => (string) ($this->whatsappUrl() ?? ''),
        ];
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        $s = $this->settings();
        return match ($this->kind) {
            'recording' => $s->recording_link ?: null,
            'join_link' => $s->join_link ?: null,
            default     => $s->join_link ?: $this->whatsappUrl(),
        };
    }

    protected function emailTemplateDetails(): array
    {
        return ['Webinar' => $this->settings()->title, 'When' => $this->eventLabel()];
    }
}
