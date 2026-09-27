<?php

namespace App\Services;

use DOMDocument;
use DOMElement;
use DOMNode;

/**
 * Sanitizes CMS content at save time.
 *
 * The frontend renders rich-text CMS fields with dangerouslySetInnerHTML
 * (on the server, during pre-rendering, and in the browser), so whatever is
 * stored here reaches every visitor as-is. Cleaning it once, on the way in,
 * means the public pages never have to trust admin input and the rendered
 * HTML is identical on the server and the client (no hydration mismatch).
 *
 * Rules, applied recursively over the whole JSON structure:
 *   - Any value whose key is "html" or ends in "Html" (e.g. bodyHtml) is
 *     run through an allowlist HTML sanitizer. The frontend field schema
 *     uses that naming convention for every rich-text field.
 *   - Any string anywhere that is a javascript:/vbscript:/data:text URL is
 *     blanked, so link/button/image fields can't carry script URLs.
 */
class CmsContentSanitizer
{
    private const ALLOWED_TAGS = [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'span', 'div',
        'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'sub', 'sup', 'small',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'hr', 'img',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
    ];

    /** Elements removed together with everything inside them. */
    private const DROP_WITH_CONTENT = [
        'script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button',
        'textarea', 'select', 'link', 'meta', 'base', 'svg', 'math', 'template',
        'noscript', 'frame', 'frameset', 'applet',
    ];

    private const ALLOWED_ATTRS = [
        'a'   => ['href', 'title', 'target', 'rel'],
        'img' => ['src', 'alt', 'width', 'height', 'title'],
        'th'  => ['colspan', 'rowspan'],
        'td'  => ['colspan', 'rowspan'],
        'ol'  => ['start'],
    ];

    public function sanitize(mixed $value, ?string $key = null): mixed
    {
        if (is_array($value)) {
            $out = [];
            foreach ($value as $k => $v) {
                $out[$k] = $this->sanitize($v, is_string($k) ? $k : null);
            }
            return $out;
        }

        if (!is_string($value)) {
            return $value;
        }

        if ($key !== null && ($key === 'html' || str_ends_with($key, 'Html'))) {
            return $this->sanitizeHtml($value);
        }

        return $this->isDangerousUrl($value) ? '' : $value;
    }

    public function sanitizeHtml(string $html): string
    {
        if (trim($html) === '') {
            return '';
        }

        $doc = new DOMDocument('1.0', 'UTF-8');
        $previous = libxml_use_internal_errors(true);
        // The XML-encoding hint + wrapper div make DOMDocument treat the
        // fragment as UTF-8 and give us a single root to walk/serialize.
        $doc->loadHTML(
            '<?xml encoding="UTF-8"><div id="__cms_root">' . $html . '</div>',
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NONET
        );
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        $root = $doc->getElementById('__cms_root');
        if (!$root) {
            // getElementById depends on libxml treating "id" as an ID
            // attribute; fall back to XPath if this build doesn't.
            $found = (new \DOMXPath($doc))->query('//div[@id="__cms_root"]');
            $root = $found && $found->length ? $found->item(0) : null;
        }
        if (!$root) {
            return '';
        }

        $this->cleanChildren($root);

        $out = '';
        foreach (iterator_to_array($root->childNodes) as $child) {
            $out .= $doc->saveHTML($child);
        }
        return $out;
    }

    private function cleanChildren(DOMNode $node): void
    {
        // Copy first — we mutate the child list while iterating.
        foreach (iterator_to_array($node->childNodes) as $child) {
            if ($child->nodeType === XML_COMMENT_NODE || $child->nodeType === XML_PI_NODE) {
                $node->removeChild($child);
                continue;
            }

            if (!$child instanceof DOMElement) {
                continue; // text nodes are fine
            }

            $tag = strtolower($child->tagName);

            if (in_array($tag, self::DROP_WITH_CONTENT, true)) {
                $node->removeChild($child);
                continue;
            }

            if (!in_array($tag, self::ALLOWED_TAGS, true)) {
                // Unknown-but-harmless wrapper (e.g. <font>, <section>):
                // keep its text, drop the tag itself.
                $this->cleanChildren($child);
                while ($child->firstChild) {
                    $node->insertBefore($child->firstChild, $child);
                }
                $node->removeChild($child);
                continue;
            }

            $allowed = self::ALLOWED_ATTRS[$tag] ?? [];
            foreach (iterator_to_array($child->attributes) as $attr) {
                $name = strtolower($attr->name);
                if (!in_array($name, $allowed, true)) {
                    $child->removeAttribute($attr->name);
                    continue;
                }
                if (in_array($name, ['href', 'src'], true) && !$this->isSafeUrl($attr->value)) {
                    $child->removeAttribute($attr->name);
                }
            }

            if ($tag === 'a') {
                if ($child->getAttribute('target') === '_blank') {
                    $child->setAttribute('rel', 'noopener noreferrer');
                } else {
                    $child->removeAttribute('target');
                }
            }

            $this->cleanChildren($child);
        }
    }

    private function isSafeUrl(string $url): bool
    {
        $u = strtolower(trim($url));
        return $u === ''
            || str_starts_with($u, 'http://')
            || str_starts_with($u, 'https://')
            || str_starts_with($u, 'mailto:')
            || str_starts_with($u, 'tel:')
            || str_starts_with($u, '/')
            || str_starts_with($u, '#');
    }

    private function isDangerousUrl(string $value): bool
    {
        // Strip whitespace/control chars browsers ignore inside a scheme
        // ("java\tscript:" still executes).
        $u = strtolower(preg_replace('/[\x00-\x20]+/', '', $value) ?? '');
        return str_starts_with($u, 'javascript:')
            || str_starts_with($u, 'vbscript:')
            || str_starts_with($u, 'data:text/html')
            || str_starts_with($u, 'data:application');
    }
}
