<?php

namespace App\Services;

use DOMDocument;
use DOMElement;
use DOMNode;

/**
 * Turns what an admin writes in "Compose Message" into safe, email-ready
 * HTML.
 *
 *  - Rich text from the editor is cleaned against a short allowlist
 *    (paragraphs, headings, bold/italic, lists, links, buttons, dividers).
 *    Everything else — scripts, styles, images, forms, event handlers,
 *    javascript: links — is removed.
 *  - Plain text (older callers) becomes paragraphs: a blank line starts a
 *    new paragraph, a single line break stays a line break, and web
 *    addresses become links.
 *  - Inline styles are added here (email apps ignore most <style> rules),
 *    so the message looks the same in Gmail, Outlook, Yahoo and Apple Mail.
 *  - {first_name} / {name} are filled in per student by personalize().
 */
class StudentEmailContent
{
    public const MAX_LENGTH = 60000;

    private const TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'hr', 'blockquote'];

    /** Removed together with everything inside them. */
    private const DROP = [
        'script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select',
        'link', 'meta', 'base', 'svg', 'math', 'template', 'noscript', 'frame', 'frameset', 'applet',
        'img', 'video', 'audio', 'picture', 'source', 'head', 'title',
    ];

    /** Block wrappers that become paragraphs. */
    private const TO_PARAGRAPH = ['div', 'section', 'article', 'header', 'footer', 'h1', 'h4', 'h5', 'h6', 'pre', 'table', 'tr'];

    private const TEXT = 'font-size:16px;line-height:1.7;color:#374151;';

    private const STYLES = [
        'p'          => 'margin:0 0 16px;' . self::TEXT,
        'h2'         => 'margin:28px 0 12px;font-size:20px;line-height:1.35;font-weight:700;color:#0F172A;',
        'h3'         => 'margin:22px 0 10px;font-size:17px;line-height:1.4;font-weight:700;color:#0F172A;',
        'ul'         => 'margin:0 0 16px;padding-left:22px;' . self::TEXT,
        'ol'         => 'margin:0 0 16px;padding-left:22px;' . self::TEXT,
        'li'         => 'margin:0 0 6px;',
        'a'          => 'color:#4A3AFF;text-decoration:underline;font-weight:600;',
        'hr'         => 'border:none;border-top:1px solid #e5e7eb;margin:24px 0;',
        'blockquote' => 'margin:0 0 16px;padding:14px 18px;border-left:4px solid #4A3AFF;background:#F5F3FF;border-radius:0 8px 8px 0;' . self::TEXT,
        'strong'     => 'font-weight:700;color:#0F172A;',
        'b'          => 'font-weight:700;color:#0F172A;',
    ];

    private const BUTTON = 'display:inline-block;background:#4A3AFF;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:9999px;font-size:16px;line-height:1.2;font-weight:600;';

    /** Clean admin input (rich or plain) into email-ready HTML. */
    public function toHtml(string $input): string
    {
        $input = str_replace(["\r\n", "\r"], "\n", $input);
        $input = mb_substr($input, 0, self::MAX_LENGTH);

        if (!$this->looksLikeHtml($input)) {
            $input = $this->plainToHtml($input);
        }

        return $this->sanitize($input);
    }

    /** True when there is at least some readable text in the message. */
    public function hasText(string $html): bool
    {
        $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        return trim(str_replace("\u{00A0}", ' ', $text)) !== '';
    }

    /** Fill {first_name} and {name} for one student (values are escaped). */
    public function personalize(string $html, ?string $fullName): string
    {
        [$first, $full] = $this->names($fullName);
        return str_ireplace(
            ['{first_name}', '{firstname}', '{name}'],
            [e($first), e($first), e($full)],
            $html
        );
    }

    /** Same for the subject line (plain text, no line breaks). */
    public function personalizeSubject(string $subject, ?string $fullName): string
    {
        [$first, $full] = $this->names($fullName);
        $s = str_ireplace(['{first_name}', '{firstname}', '{name}'], [$first, $first, $full], $subject);
        return trim(preg_replace('/[\r\n\t]+/', ' ', $s) ?? '');
    }

    /** @return array{0:string,1:string} first name, full name */
    public function names(?string $fullName): array
    {
        $full = trim(preg_replace('/\s+/', ' ', strip_tags((string) $fullName)) ?? '');
        $first = $full !== '' ? explode(' ', $full)[0] : '';
        return [$first !== '' ? $first : 'there', $full !== '' ? $full : 'there'];
    }

    private function looksLikeHtml(string $s): bool
    {
        return (bool) preg_match('#<\s*/?\s*(p|br|div|h[1-6]|ul|ol|li|strong|b|em|i|u|a|hr|blockquote)\b#i', $s);
    }

    private function plainToHtml(string $text): string
    {
        $out = '';
        foreach (preg_split('/\n\s*\n+/', trim($text)) ?: [] as $para) {
            $para = trim($para);
            if ($para === '') continue;
            $escaped = e($para);
            // Web addresses → links (on the escaped text, so nothing new can be injected).
            $escaped = preg_replace(
                '#\bhttps?://[^\s<>"\']+[^\s<>"\'.,;:!?)\]]#i',
                '<a href="$0">$0</a>',
                $escaped
            ) ?? $escaped;
            $out .= '<p>' . nl2br($escaped, false) . '</p>';
        }
        return $out;
    }

    private function sanitize(string $html): string
    {
        if (trim($html) === '') return '';

        $doc = new DOMDocument('1.0', 'UTF-8');
        $prev = libxml_use_internal_errors(true);
        $doc->loadHTML(
            '<?xml encoding="UTF-8"><div id="__mail_root">' . $html . '</div>',
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NONET
        );
        libxml_clear_errors();
        libxml_use_internal_errors($prev);

        $found = (new \DOMXPath($doc))->query('//div[@id="__mail_root"]');
        $root = $found && $found->length ? $found->item(0) : null;
        if (!$root instanceof DOMElement) return '';

        $this->clean($root, $doc);
        $this->wrapLooseText($root, $doc);
        $this->dropEmptyParagraphs($root);

        $out = '';
        foreach (iterator_to_array($root->childNodes) as $child) {
            $out .= $doc->saveHTML($child);
        }
        return trim($out);
    }

    private function clean(DOMNode $node, DOMDocument $doc): void
    {
        foreach (iterator_to_array($node->childNodes) as $child) {
            if ($child->nodeType === XML_COMMENT_NODE || $child->nodeType === XML_PI_NODE || $child->nodeType === XML_CDATA_SECTION_NODE) {
                $node->removeChild($child);
                continue;
            }
            if (!$child instanceof DOMElement) continue;

            $tag = strtolower($child->tagName);

            if (in_array($tag, self::DROP, true)) {
                $node->removeChild($child);
                continue;
            }

            if (in_array($tag, self::TO_PARAGRAPH, true)) {
                $child = $this->rename($child, 'p', $doc);
                $tag = 'p';
            }

            if (!in_array($tag, self::TAGS, true)) {
                // Harmless wrappers (span, font, td …): keep the text, drop the tag.
                $this->clean($child, $doc);
                while ($child->firstChild) {
                    $node->insertBefore($child->firstChild, $child);
                }
                $node->removeChild($child);
                continue;
            }

            $isButton = $tag === 'a' && preg_match('/\bemail-btn\b/', (string) $child->getAttribute('class'));
            $href = $tag === 'a' ? $this->safeHref((string) $child->getAttribute('href')) : '';

            foreach (iterator_to_array($child->attributes) as $attr) {
                $child->removeAttribute($attr->name);
            }

            if ($tag === 'a') {
                if ($href === '') {
                    // A link without a safe address is just text.
                    $this->clean($child, $doc);
                    while ($child->firstChild) {
                        $node->insertBefore($child->firstChild, $child);
                    }
                    $node->removeChild($child);
                    continue;
                }
                $child->setAttribute('href', $href);
                $child->setAttribute('target', '_blank');
                $child->setAttribute('rel', 'noopener');
                $child->setAttribute('style', $isButton ? self::BUTTON : self::STYLES['a']);
                if ($isButton && $node instanceof DOMElement && strtolower($node->tagName) === 'p') {
                    $node->setAttribute('style', 'margin:24px 0;');
                }
            } elseif (isset(self::STYLES[$tag])) {
                $child->setAttribute('style', self::STYLES[$tag]);
            }

            $this->clean($child, $doc);
        }
    }

    private function rename(DOMElement $el, string $tag, DOMDocument $doc): DOMElement
    {
        $new = $doc->createElement($tag);
        while ($el->firstChild) {
            $new->appendChild($el->firstChild);
        }
        $el->parentNode->replaceChild($new, $el);
        return $new;
    }

    /** Text or inline tags sitting directly in the root get their own paragraph. */
    private function wrapLooseText(DOMElement $root, DOMDocument $doc): void
    {
        $blocks = ['p', 'h2', 'h3', 'ul', 'ol', 'hr', 'blockquote'];
        $current = null;
        foreach (iterator_to_array($root->childNodes) as $child) {
            $isBlock = $child instanceof DOMElement && in_array(strtolower($child->tagName), $blocks, true);
            if ($isBlock) {
                $current = null;
                continue;
            }
            if ($child instanceof DOMElement && strtolower($child->tagName) === 'br') {
                // A <br> between blocks just ends the loose paragraph.
                $root->removeChild($child);
                $current = null;
                continue;
            }
            if ($child->nodeType === XML_TEXT_NODE && trim($child->textContent) === '' && !$current) {
                $root->removeChild($child);
                continue;
            }
            if (!$current) {
                $current = $doc->createElement('p');
                $current->setAttribute('style', self::STYLES['p']);
                $root->insertBefore($current, $child);
            }
            $current->appendChild($child);
        }
    }

    private function dropEmptyParagraphs(DOMElement $root): void
    {
        foreach (iterator_to_array($root->getElementsByTagName('p')) as $p) {
            $text = trim(str_replace("\u{00A0}", ' ', $p->textContent));
            $hasLink = $p->getElementsByTagName('a')->length > 0;
            if ($text === '' && !$hasLink && $p->parentNode) {
                $p->parentNode->removeChild($p);
            }
        }
    }

    private function safeHref(string $href): string
    {
        $h = trim(html_entity_decode($href, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        if ($h === '') return '';
        // Site paths → full address (email apps can't open "/courses").
        if (preg_match('#^/[^/]#', $h) || $h === '/') {
            $h = rtrim((string) config('app.frontend_url', 'https://learnexity.org'), '/') . $h;
        }
        if (preg_match('#^mailto:[^\s<>"]+@[^\s<>"]+$#i', $h)) return mb_substr($h, 0, 300);
        if (preg_match('#^tel:\+?[0-9 ()\-]{4,25}$#i', $h)) return $h;
        if (!preg_match('#^https?://#i', $h)) {
            // "learnexity.org/x" or "www.site.com" typed without the scheme.
            if (preg_match('#^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(/|$|\?|\#)#i', $h)) {
                $h = 'https://' . $h;
            } else {
                return '';
            }
        }
        // "https//x" style typos are caught by the validator below.
        return filter_var($h, FILTER_VALIDATE_URL) ? mb_substr($h, 0, 1000) : '';
    }
}
