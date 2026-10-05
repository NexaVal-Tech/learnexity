<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

/**
 * Admin-customised text for one transactional email. See
 * App\Support\EmailTemplateRegistry for the list of emails, their
 * placeholders and default text, and App\Mail\Concerns\UsesEmailTemplate
 * for how a mailable applies it.
 */
class EmailTemplate extends Model
{
    protected $fillable = ['key', 'subject', 'customize_body', 'heading', 'body', 'button_label', 'updated_by'];

    protected $casts = ['customize_body' => 'boolean'];

    /** @var array<string, array{0:int, 1:?EmailTemplate}> short per-process cache (queue workers live long) */
    private static array $cache = [];

    public static function forKey(string $key): ?self
    {
        $hit = self::$cache[$key] ?? null;
        if ($hit && $hit[0] > time() - 30) {
            return $hit[1];
        }
        try {
            $row = Schema::hasTable('email_templates') ? static::where('key', $key)->first() : null;
        } catch (\Throwable) {
            $row = null; // never let a CMS lookup stop an email from being sent
        }
        self::$cache[$key] = [time(), $row];
        return $row;
    }

    public static function flushCache(): void
    {
        self::$cache = [];
    }

    /** Replace {placeholders} in plain text (subjects, headings, button labels). */
    public static function fill(?string $text, array $vars): string
    {
        $text = (string) $text;
        return preg_replace_callback('/\{([a-z0-9_]+)\}/i', function ($m) use ($vars) {
            return array_key_exists($m[1], $vars) ? (string) $vars[$m[1]] : $m[0];
        }, $text);
    }

    /**
     * Body text → safe HTML paragraphs. Everything is escaped first, then
     * placeholders are filled with escaped values; **double asterisks**
     * make bold text, a blank line starts a new paragraph.
     */
    public static function paragraphs(?string $text, array $vars): string
    {
        $escaped = e((string) $text);
        $filled = preg_replace_callback('/\{([a-z0-9_]+)\}/i', function ($m) use ($vars) {
            return array_key_exists($m[1], $vars) ? e((string) $vars[$m[1]]) : $m[0];
        }, $escaped);
        $filled = preg_replace('/\*\*(.+?)\*\*/s', '<strong>$1</strong>', $filled);

        $blocks = preg_split("/\R{2,}/", trim($filled)) ?: [];
        return implode("\n", array_map(
            fn ($p) => '<p class="text">' . nl2br(trim($p), false) . '</p>',
            array_filter($blocks, fn ($p) => trim($p) !== '')
        ));
    }

    /** View data for emails/cms_template. */
    public static function viewData(
        ?string $heading,
        ?string $body,
        ?string $button,
        array $vars,
        ?string $buttonUrl = null,
        array $details = [],
    ): array {
        return [
            'heading'     => self::fill($heading, $vars),
            'bodyHtml'    => self::paragraphs($body, $vars),
            'buttonLabel' => trim(self::fill($button, $vars)),
            'buttonUrl'   => $buttonUrl,
            'details'     => array_filter($details, fn ($v) => $v !== null && $v !== ''),
        ];
    }
}
