<?php

namespace App\Services;

use App\Models\MaterialItem;
use App\Models\MaterialItemSubmission;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Sprint tasks: requirement config, safe intake of student responses
 * (written answer / link / file), automatic marking and manual grading.
 *
 * SECURITY MODEL — nothing a student submits is ever executed, rendered as
 * HTML, fetched by the server or served from a public URL:
 *  - Text: control characters and HTML tags stripped, length-capped, and
 *    only ever displayed as plain text.
 *  - Links: http(s) only, no credentials, no IP/localhost/internal hosts,
 *    length-capped. The server NEVER requests the URL (no SSRF).
 *  - Files: extension whitelist + magic-byte check of the real content
 *    (not the browser-supplied MIME type), dangerous content rejected
 *    (macros, PDF JavaScript/launch actions, script tags in text files,
 *    executables/scripts inside zips, zip bombs, path traversal), size
 *    capped, stored under a random name on the PRIVATE disk and only
 *    streamed back as an attachment to authorised users.
 */
class TaskSubmissionService
{
    public const DISK = 'local';
    public const HARD_MAX_MB = 20;
    public const TEXT_MAX_CHARS = 30000;
    public const LINK_MAX_CHARS = 2048;

    /** Extensions a task may accept → human label. */
    public const FILE_TYPES = [
        'pdf'  => 'PDF',
        'docx' => 'Word (.docx)',
        'xlsx' => 'Excel (.xlsx)',
        'pptx' => 'PowerPoint (.pptx)',
        'png'  => 'PNG image',
        'jpg'  => 'JPG image',
        'jpeg' => 'JPEG image',
        'webp' => 'WebP image',
        'txt'  => 'Text (.txt)',
        'md'   => 'Markdown (.md)',
        'csv'  => 'CSV',
        'zip'  => 'ZIP archive',
    ];

    private const DANGEROUS_IN_ZIP = [
        'php', 'php3', 'php4', 'php5', 'php7', 'php8', 'phtml', 'phar', 'pht', 'phps',
        'exe', 'dll', 'com', 'bat', 'cmd', 'sh', 'bash', 'ps1', 'psm1', 'vbs', 'vbe', 'js', 'jse',
        'wsf', 'wsh', 'msi', 'msp', 'scr', 'jar', 'hta', 'cpl', 'lnk', 'reg', 'html', 'htm',
        'xhtml', 'svg', 'shtml', 'asp', 'aspx', 'jsp', 'cgi', 'pl', 'py', 'rb', 'htaccess', 'apk', 'app', 'dmg',
    ];

    private const MODES = ['off', 'optional', 'required'];

    // ─────────────────────────────────────────────────────────────────────
    // Config
    // ─────────────────────────────────────────────────────────────────────

    /** Clean + clamp the requirements an admin/instructor sends. */
    public function normalizeConfig(array $in): array
    {
        $mode = fn ($v, $def = 'off') => in_array($v, self::MODES, true) ? $v : $def;
        $int = function ($v, int $min, int $max): ?int {
            if ($v === null || $v === '' || !is_numeric($v)) return null;
            return max($min, min($max, (int) $v));
        };
        $list = function ($v, int $maxItems, int $maxLen, ?callable $map = null): array {
            if (is_string($v)) $v = preg_split('/[\n,]+/', $v);
            if (!is_array($v)) return [];
            $out = [];
            foreach ($v as $x) {
                if (!is_scalar($x)) continue;
                $x = $this->cleanText((string) $x, $maxLen, false);
                if ($map) $x = $map($x);
                if ($x !== null && $x !== '' && !in_array($x, $out, true)) $out[] = $x;
                if (count($out) >= $maxItems) break;
            }
            return $out;
        };

        $text = is_array($in['text'] ?? null) ? $in['text'] : [];
        $link = is_array($in['link'] ?? null) ? $in['link'] : [];
        $file = is_array($in['file'] ?? null) ? $in['file'] : [];

        $minW = $int($text['min_words'] ?? null, 1, 5000);
        $maxW = $int($text['max_words'] ?? null, 1, 5000);
        if ($minW && $maxW && $maxW < $minW) $maxW = $minW;

        $types = array_values(array_intersect(
            array_map('strtolower', is_array($file['allowed_types'] ?? null) ? $file['allowed_types'] : []),
            array_keys(self::FILE_TYPES)
        ));
        if (in_array('jpg', $types, true) && !in_array('jpeg', $types, true)) $types[] = 'jpeg';

        $cfg = [
            'enabled'      => (bool) ($in['enabled'] ?? false),
            'instructions' => $this->cleanText((string) ($in['instructions'] ?? ''), 5000),
            'text' => [
                'mode'        => $mode($text['mode'] ?? null, 'required'),
                'min_words'   => $minW,
                'max_words'   => $maxW,
                'keywords'    => $list($text['keywords'] ?? [], 30, 60),
                'keyword_min' => $int($text['keyword_min'] ?? null, 1, 30),
            ],
            'link' => [
                'mode'            => $mode($link['mode'] ?? null),
                'allowed_domains' => $list($link['allowed_domains'] ?? [], 10, 100, function ($d) {
                    $d = strtolower(trim($d));
                    $d = preg_replace('#^https?://#', '', $d);
                    $d = preg_replace('#^www\.#', '', $d);
                    $d = explode('/', $d)[0];
                    return preg_match('/^[a-z0-9.-]+\.[a-z]{2,}$/', $d) ? $d : null;
                }),
            ],
            'file' => [
                'mode'          => $mode($file['mode'] ?? null),
                'allowed_types' => $types ?: ['pdf', 'docx', 'png', 'jpg', 'jpeg'],
                'max_size_mb'   => $int($file['max_size_mb'] ?? null, 1, self::HARD_MAX_MB) ?? 10,
            ],
            'auto_grade'   => array_key_exists('auto_grade', $in) ? (bool) $in['auto_grade'] : true,
            'pass_mark'    => $int($in['pass_mark'] ?? null, 0, 100),
            'max_attempts' => $int($in['max_attempts'] ?? null, 1, 20),
        ];

        if ($cfg['text']['keyword_min'] && $cfg['text']['keyword_min'] > count($cfg['text']['keywords'])) {
            $cfg['text']['keyword_min'] = count($cfg['text']['keywords']) ?: null;
        }

        if ($cfg['enabled'] && $cfg['text']['mode'] === 'off' && $cfg['link']['mode'] === 'off' && $cfg['file']['mode'] === 'off') {
            throw ValidationException::withMessages([
                'task_config' => ['Choose at least one way for students to respond (written answer, link or file).'],
            ]);
        }

        return $cfg;
    }

    /** What students are allowed to see (keywords stay hidden so the auto-mark can't be gamed). */
    public function publicConfig(?array $cfg): ?array
    {
        if (!$cfg || empty($cfg['enabled'])) return null;
        return [
            'instructions' => $cfg['instructions'] ?? '',
            'text' => [
                'mode'      => $cfg['text']['mode'] ?? 'off',
                'min_words' => $cfg['text']['min_words'] ?? null,
                'max_words' => $cfg['text']['max_words'] ?? null,
                'has_keywords' => !empty($cfg['text']['keywords']),
            ],
            'link' => [
                'mode'            => $cfg['link']['mode'] ?? 'off',
                'allowed_domains' => $cfg['link']['allowed_domains'] ?? [],
            ],
            'file' => [
                'mode'          => $cfg['file']['mode'] ?? 'off',
                'allowed_types' => $cfg['file']['allowed_types'] ?? [],
                'max_size_mb'   => $cfg['file']['max_size_mb'] ?? 10,
            ],
            'auto_grade'   => (bool) ($cfg['auto_grade'] ?? false),
            'pass_mark'    => $cfg['pass_mark'] ?? null,
            'max_attempts' => $cfg['max_attempts'] ?? null,
        ];
    }

    /** Task block for the student resources payload. */
    public function studentView(MaterialItem $item, int $userId): ?array
    {
        $public = $this->publicConfig($item->task_config);
        if (!$public) return null;

        $subs = MaterialItemSubmission::where('material_item_id', $item->id)
            ->where('user_id', $userId)
            ->orderByDesc('attempt')
            ->limit(20)
            ->get();

        $latest = $subs->first();
        $max = $public['max_attempts'];

        return [
            'config'       => $public,
            'attempts'     => $subs->count(),
            'can_submit'   => $this->canSubmit($item, $latest, $subs->count()),
            'latest'       => $latest ? $this->presentForStudent($latest) : null,
            'history'      => $subs->slice(1)->map(fn ($s) => $this->presentForStudent($s))->values(),
            'attempts_left' => $max ? max(0, $max - $subs->count()) : null,
        ];
    }

    public function canSubmit(MaterialItem $item, ?MaterialItemSubmission $latest, int $attempts): bool
    {
        $max = $item->task_config['max_attempts'] ?? null;
        if ($max && $attempts >= $max) return false;
        if (!$latest) return true;
        // Done once it has passed, or once a person has given it a final grade.
        // An automatic grade (no pass mark) can still be improved on.
        if ($latest->status === MaterialItemSubmission::STATUS_PASSED) return false;
        if ($latest->status === MaterialItemSubmission::STATUS_GRADED && $latest->graded_by_type !== 'auto') return false;
        return true;
    }

    public function presentForStudent(MaterialItemSubmission $s): array
    {
        return [
            'id'            => $s->id,
            'attempt'       => $s->attempt,
            'status'        => $s->status,
            'text_response' => $s->text_response,
            'link_url'      => $s->link_url,
            'file_name'     => $s->file_original_name,
            'file_size'     => $s->file_size,
            'has_file'      => (bool) $s->file_path,
            'score'         => $s->score,
            'auto_score'    => $s->auto_score,
            // Check labels only — never the hidden keyword list itself.
            'checks'        => collect($s->auto_checks ?? [])->map(fn ($c) => [
                'label'  => $c['label'] ?? '',
                'passed' => (bool) ($c['passed'] ?? false),
                'detail' => $c['student_detail'] ?? null,
            ])->values(),
            'feedback'      => $s->feedback,
            'graded_by'     => $s->graded_by_type,
            'graded_at'     => optional($s->graded_at)->toIso8601String(),
            'submitted_at'  => optional($s->created_at)->toIso8601String(),
        ];
    }

    public function presentForGrader(MaterialItemSubmission $s): array
    {
        return array_merge($this->presentForStudent($s), [
            'checks'       => collect($s->auto_checks ?? [])->map(fn ($c) => [
                'label'  => $c['label'] ?? '',
                'passed' => (bool) ($c['passed'] ?? false),
                'detail' => $c['detail'] ?? null,
            ])->values(),
            'graded_by_name' => $s->graded_by_name,
            'student' => $s->relationLoaded('user') && $s->user ? [
                'id' => $s->user->id, 'name' => $s->user->name, 'email' => $s->user->email,
            ] : null,
            'item' => $s->relationLoaded('item') && $s->item ? [
                'id'     => $s->item->id,
                'title'  => $s->item->title,
                'sprint' => optional($s->item->courseMaterial)->sprint_name,
                'pass_mark' => $s->item->task_config['pass_mark'] ?? null,
            ] : null,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Intake
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Validate + store a student's attempt and auto-mark it.
     *
     * @return MaterialItemSubmission
     */
    public function submit(MaterialItem $item, int $userId, string $courseId, ?string $text, ?string $link, ?UploadedFile $file, ?string $ip): MaterialItemSubmission
    {
        $cfg = $item->task_config ?? [];
        $errors = [];

        // ── Written answer ──
        $textMode = $cfg['text']['mode'] ?? 'off';
        $cleanText = null;
        if ($textMode !== 'off' && $text !== null && trim($text) !== '') {
            if (mb_strlen($text) > self::TEXT_MAX_CHARS * 2) {
                $errors['text'][] = 'Your written answer is too long.';
            } else {
                // Kept verbatim (minus control chars) so code snippets like
                // `a < b` survive — it is only ever rendered as escaped text.
                $cleanText = $this->cleanText($text, self::TEXT_MAX_CHARS, true, false);
            }
        }
        if ($textMode === 'required' && ($cleanText === null || $cleanText === '')) {
            $errors['text'][] = 'A written answer is required for this task.';
        }

        // ── Link ──
        $linkMode = $cfg['link']['mode'] ?? 'off';
        $cleanLink = null;
        if ($linkMode !== 'off' && $link !== null && trim($link) !== '') {
            [$cleanLink, $linkError] = $this->validateLink($link, $cfg['link']['allowed_domains'] ?? []);
            if ($linkError) $errors['link'][] = $linkError;
        }
        if ($linkMode === 'required' && !$cleanLink && empty($errors['link'])) {
            $errors['link'][] = 'A link is required for this task.';
        }

        // ── File ──
        $fileMode = $cfg['file']['mode'] ?? 'off';
        $fileInfo = null;
        if ($fileMode !== 'off' && $file) {
            try {
                $fileInfo = $this->inspectFile($file, $cfg['file']['allowed_types'] ?? [], (int) ($cfg['file']['max_size_mb'] ?? 10));
            } catch (ValidationException $e) {
                $errors['file'] = array_merge($errors['file'] ?? [], $e->errors()['file'] ?? ['That file could not be accepted.']);
            }
        }
        if ($fileMode === 'required' && !$fileInfo && empty($errors['file'])) {
            $errors['file'][] = 'A file upload is required for this task.';
        }

        if (!$errors && !$cleanText && !$cleanLink && !$fileInfo) {
            $errors['text'][] = 'Please add your response before submitting.';
        }

        if ($errors) {
            throw ValidationException::withMessages($errors);
        }

        // Store the file only after everything else is valid.
        $stored = null;
        if ($fileInfo) {
            $dir = 'task-submissions/' . preg_replace('/[^A-Za-z0-9_-]/', '_', $courseId) . '/' . $userId;
            $name = Str::random(40) . '.' . $fileInfo['ext'];
            $stored = Storage::disk(self::DISK)->putFileAs($dir, $file, $name);
            if (!$stored) {
                throw new \RuntimeException('Could not store the uploaded file.');
            }
        }

        $attempt = (int) MaterialItemSubmission::where('material_item_id', $item->id)->where('user_id', $userId)->max('attempt') + 1;

        $submission = new MaterialItemSubmission([
            'material_item_id'   => $item->id,
            'user_id'            => $userId,
            'course_id'          => $courseId,
            'attempt'            => $attempt,
            'text_response'      => $cleanText ?: null,
            'link_url'           => $cleanLink,
            'file_path'          => $stored ?: null,
            'file_original_name' => $fileInfo['name'] ?? null,
            'file_ext'           => $fileInfo['ext'] ?? null,
            'file_size'          => $fileInfo['size'] ?? null,
            'status'             => MaterialItemSubmission::STATUS_SUBMITTED,
            'ip_address'         => $ip ? substr($ip, 0, 45) : null,
        ]);

        $this->autoMark($submission, $cfg);
        $submission->save();

        return $submission;
    }

    /** Apply the instructor's rules to the attempt. */
    public function autoMark(MaterialItemSubmission $s, array $cfg): void
    {
        if (empty($cfg['auto_grade'])) {
            $s->status = MaterialItemSubmission::STATUS_SUBMITTED;
            return;
        }

        $checks = [];
        $text = (string) $s->text_response;
        $words = $text === '' ? 0 : count(preg_split('/\s+/u', trim($text), -1, PREG_SPLIT_NO_EMPTY));

        $add = function (string $label, float $earned, float $weight, ?string $detail = null, ?string $studentDetail = null) use (&$checks) {
            $checks[] = [
                'label' => $label, 'earned' => round($earned, 4), 'weight' => $weight,
                'passed' => $earned >= $weight - 0.0001,
                'detail' => $detail, 'student_detail' => $studentDetail ?? $detail,
            ];
        };

        // Required responses are enforced at submission time (it can't be
        // handed in without them), so the score only measures the quality
        // rules below. No rules → requirements met → 100.
        if ($text !== '' || ($cfg['text']['mode'] ?? 'off') === 'required') {
            $min = $cfg['text']['min_words'] ?? null;
            $max = $cfg['text']['max_words'] ?? null;
            if ($min) {
                $add("At least {$min} words", $words >= $min ? 1 : min(0.99, $words / $min), 1, "{$words} words written");
            }
            if ($max) {
                $add("No more than {$max} words", $words <= $max ? 1 : 0, 1, "{$words} words written");
            }

            $keywords = $cfg['text']['keywords'] ?? [];
            if ($keywords) {
                $hay = ' ' . mb_strtolower(preg_replace('/\s+/u', ' ', $text)) . ' ';
                $found = [];
                $missing = [];
                foreach ($keywords as $kw) {
                    $needle = mb_strtolower(trim($kw));
                    if ($needle === '') continue;
                    $pattern = '/(?<![\p{L}\p{N}])' . preg_quote($needle, '/') . '(?![\p{L}\p{N}])/u';
                    (@preg_match($pattern, $hay) ? $found[] = $kw : $missing[] = $kw);
                }
                $need = $cfg['text']['keyword_min'] ?? count($keywords);
                $need = max(1, min($need, count($keywords)));
                $ratio = min(1, count($found) / $need);
                $add(
                    'Covers the key points',
                    $ratio * 3,
                    3,
                    count($found) . " of {$need} required key terms found" . ($missing ? ' (missing: ' . implode(', ', array_slice($missing, 0, 10)) . ')' : ''),
                    count($found) >= $need ? 'All key points covered' : 'Some key points are missing — review the task and expand your answer.'
                );
            }
        }

        $weight = array_sum(array_column($checks, 'weight'));
        $earned = array_sum(array_column($checks, 'earned'));
        $score = $weight > 0 ? round($earned / $weight * 100, 2) : 100.0;

        $s->auto_checks = $checks;
        $s->auto_score = $score;
        $s->score = $score;
        $s->graded_by_type = 'auto';
        $s->graded_at = now();

        $pass = $cfg['pass_mark'] ?? null;
        if ($pass !== null) {
            $s->status = $score >= $pass ? MaterialItemSubmission::STATUS_PASSED : MaterialItemSubmission::STATUS_NEEDS_REVISION;
        } else {
            $s->status = MaterialItemSubmission::STATUS_GRADED;
        }
    }

    /**
     * Manual review by an admin/instructor.
     * $action: 'grade' (score required) | 'request_revision'
     */
    public function grade(MaterialItemSubmission $s, string $action, ?float $score, ?string $feedback, string $byType, ?int $byId, ?string $byName): MaterialItemSubmission
    {
        $pass = $s->item->task_config['pass_mark'] ?? null;
        $feedback = $feedback !== null ? $this->cleanText($feedback, 5000) : null;

        if ($action === 'request_revision') {
            if ($score !== null) $s->score = round(max(0, min(100, $score)), 2);
            $s->status = MaterialItemSubmission::STATUS_NEEDS_REVISION;
        } else {
            if ($score === null) {
                throw ValidationException::withMessages(['score' => ['Enter a score between 0 and 100.']]);
            }
            $s->score = round(max(0, min(100, $score)), 2);
            $s->status = $pass !== null
                ? ($s->score >= $pass ? MaterialItemSubmission::STATUS_PASSED : MaterialItemSubmission::STATUS_NEEDS_REVISION)
                : MaterialItemSubmission::STATUS_GRADED;
        }

        $s->feedback = $feedback ?: null;
        $s->graded_by_type = $byType;
        $s->graded_by_id = $byId;
        $s->graded_by_name = $byName ? mb_substr($byName, 0, 150) : null;
        $s->graded_at = now();
        $s->save();

        return $s;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Security helpers
    // ─────────────────────────────────────────────────────────────────────

    /** Plain text only: no tags, no control characters, capped length. */
    public function cleanText(string $value, int $max, bool $keepNewlines = true, bool $stripTags = true): string
    {
        if (!mb_check_encoding($value, 'UTF-8')) {
            $value = mb_convert_encoding($value, 'UTF-8', 'UTF-8');
        }
        $value = str_replace("\0", '', $value);
        $value = str_replace(["\r\n", "\r"], "\n", $value);
        if ($stripTags) $value = strip_tags($value);
        // Remove control chars (keep \n and \t) and bidi override chars.
        $value = preg_replace('/[\x{0000}-\x{0008}\x{000B}\x{000C}\x{000E}-\x{001F}\x{007F}\x{202A}-\x{202E}\x{2066}-\x{2069}]/u', '', $value) ?? '';
        if (!$keepNewlines) $value = preg_replace('/\s+/u', ' ', $value) ?? '';
        $value = preg_replace("/\n{4,}/", "\n\n\n", $value) ?? '';
        return trim(mb_substr($value, 0, $max));
    }

    /** @return array{0: ?string, 1: ?string} [url, error] */
    public function validateLink(string $raw, array $allowedDomains): array
    {
        $url = trim($raw);
        if (mb_strlen($url) > self::LINK_MAX_CHARS) return [null, 'That link is too long.'];
        if (preg_match('/[\s\x00-\x1F\x7F<>"\'`\\\\]/', $url)) return [null, 'That link contains characters that are not allowed.'];
        if (!preg_match('#^https?://#i', $url)) $url = 'https://' . $url;

        $parts = parse_url($url);
        if (!$parts || empty($parts['host']) || !in_array(strtolower($parts['scheme'] ?? ''), ['http', 'https'], true)) {
            return [null, 'Enter a valid web link starting with https://'];
        }
        if (isset($parts['user']) || isset($parts['pass'])) {
            return [null, 'Links with usernames or passwords are not allowed.'];
        }
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return [null, 'Enter a valid web link starting with https://'];
        }

        $host = strtolower(rtrim($parts['host'], '.'));
        if (filter_var(trim($host, '[]'), FILTER_VALIDATE_IP)
            || $host === 'localhost'
            || !str_contains($host, '.')
            || preg_match('/\.(local|localhost|internal|lan|intranet|home|corp|test|invalid)$/', $host)) {
            return [null, 'Please submit a public web link (not an IP address or internal address).'];
        }
        if (!preg_match('/^[a-z0-9.-]+$/', $host) && !preg_match('/^xn--/', $host)) {
            // Non-ASCII hostnames are a common phishing trick (homographs).
            return [null, 'That link\'s address contains characters that are not allowed.'];
        }

        if ($allowedDomains) {
            $bare = preg_replace('/^www\./', '', $host);
            $ok = false;
            foreach ($allowedDomains as $d) {
                if ($bare === $d || str_ends_with($bare, '.' . $d)) { $ok = true; break; }
            }
            if (!$ok) {
                return [null, 'The link must be from: ' . implode(', ', $allowedDomains) . '.'];
            }
        }

        return [$url, null];
    }

    /**
     * Inspect an upload WITHOUT trusting the client: real size, extension
     * whitelist, magic bytes and content checks.
     *
     * @return array{ext: string, name: string, size: int}
     */
    public function inspectFile(UploadedFile $file, array $allowed, int $maxMb): array
    {
        $fail = fn (string $msg) => throw ValidationException::withMessages(['file' => [$msg]]);

        if (!$file->isValid()) $fail('The file failed to upload. Please try again.');

        $path = $file->getRealPath();
        if (!$path || !is_file($path)) $fail('The file failed to upload. Please try again.');

        $size = filesize($path) ?: 0;
        $maxMb = max(1, min(self::HARD_MAX_MB, $maxMb));
        if ($size <= 0) $fail('The file is empty.');
        if ($size > $maxMb * 1024 * 1024) $fail("The file must be {$maxMb} MB or smaller.");

        $original = (string) $file->getClientOriginalName();
        $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
        $allowed = array_values(array_intersect($allowed ?: [], array_keys(self::FILE_TYPES)));
        if (!$ext || !in_array($ext, $allowed, true)) {
            $fail('That file type is not accepted. Allowed: ' . strtoupper(implode(', ', array_unique(array_map(fn ($e) => $e === 'jpeg' ? 'jpg' : $e, $allowed)))) . '.');
        }

        // Reject double extensions that hide a script (e.g. report.php.pdf).
        $stem = strtolower(pathinfo($original, PATHINFO_FILENAME));
        foreach (explode('.', $stem) as $piece) {
            if (in_array($piece, self::DANGEROUS_IN_ZIP, true)) $fail('That file name is not allowed. Please rename the file and try again.');
        }

        $fh = fopen($path, 'rb');
        $head = $fh ? (string) fread($fh, 16) : '';
        if ($fh) fclose($fh);

        $is = fn (string $sig) => strncmp($head, $sig, strlen($sig)) === 0;
        $badContent = 'The file\'s contents don\'t match its type or contain something unsafe, so it was rejected.';

        switch ($ext) {
            case 'pdf':
                if (!$is('%PDF-')) $fail($badContent);
                $body = (string) file_get_contents($path);
                // Active content in PDFs: JavaScript, auto-launching programs, embedded files.
                if (preg_match('#/(JavaScript|JS|Launch|EmbeddedFile|RichMedia|XFA|OpenAction\s*<<[^>]*?/S\s*/JavaScript)\b#', $body)) {
                    $fail('PDFs with scripts, embedded files or auto-run actions are not accepted. Please export a plain PDF and try again.');
                }
                break;
            case 'png':
                if (!$is("\x89PNG\r\n\x1a\n") || !@getimagesize($path)) $fail($badContent);
                break;
            case 'jpg':
            case 'jpeg':
                if (!$is("\xFF\xD8\xFF") || !@getimagesize($path)) $fail($badContent);
                break;
            case 'webp':
                if (!$is('RIFF') || substr($head, 8, 4) !== 'WEBP') $fail($badContent);
                break;
            case 'txt':
            case 'md':
            case 'csv':
                $body = (string) file_get_contents($path);
                if (str_contains($body, "\0") || !mb_check_encoding($body, 'UTF-8')) $fail('Text files must be plain UTF-8 text.');
                if (preg_match('/<\?(php|=)|<script\b|<iframe\b|javascript:|<svg\b|<html\b/i', $body)) {
                    $fail('Text files can\'t contain code tags such as <script> or <?php. Share code with a link (for example GitHub) instead.');
                }
                break;
            case 'docx':
            case 'xlsx':
            case 'pptx':
            case 'zip':
                if (!$is("PK\x03\x04")) $fail($badContent);
                $this->inspectZip($path, $ext, $fail, $badContent);
                break;
            default:
                $fail('That file type is not accepted.');
        }

        // Image types: never let polyglot files carry script.
        if (in_array($ext, ['png', 'jpg', 'jpeg', 'webp'], true)) {
            $body = (string) file_get_contents($path);
            if (preg_match('/<\?php|<script\b|<\?=/i', $body)) $fail($badContent);
        }

        return ['ext' => $ext === 'jpeg' ? 'jpg' : $ext, 'name' => $this->safeFileName($original, $ext), 'size' => $size];
    }

    private function inspectZip(string $path, string $ext, callable $fail, string $badContent): void
    {
        if (!class_exists(\ZipArchive::class)) {
            // Can't look inside → only accept Office files (signature checked), not raw zips.
            if ($ext === 'zip') $fail('ZIP uploads are not available right now. Please upload the files individually.');
            return;
        }

        $zip = new \ZipArchive();
        if ($zip->open($path, \ZipArchive::RDONLY) !== true) $fail($badContent);

        try {
            $count = $zip->numFiles;
            if ($count < 1 || $count > 2000) $fail('The archive has too many files.');

            $total = 0;
            $hasContentTypes = false;
            for ($i = 0; $i < $count; $i++) {
                $st = $zip->statIndex($i);
                if (!$st) $fail($badContent);
                $name = (string) $st['name'];
                $lower = strtolower($name);

                if (str_contains($name, '..') || str_starts_with($name, '/') || str_starts_with($name, '\\') || preg_match('/^[a-z]:/i', $name) || str_contains($name, "\0")) {
                    $fail($badContent);
                }

                $total += (int) $st['size'];
                if ($total > 250 * 1024 * 1024) $fail('The archive is too large when unpacked.');
                if ((int) $st['comp_size'] > 0 && ((int) $st['size'] / (int) $st['comp_size']) > 200) {
                    $fail($badContent); // zip bomb pattern
                }
                if (((int) ($st['encryption_method'] ?? 0)) !== 0) $fail('Password-protected archives are not accepted.');

                if ($lower === '[content_types].xml') $hasContentTypes = true;

                // Office macros / ActiveX / embedded OLE objects.
                if ($ext !== 'zip' && preg_match('#(vbaproject\.bin|vbadata\.xml|/activex/|oleobject\d*\.bin|/embeddings/)#', $lower)) {
                    $fail('Office files with macros or embedded objects are not accepted. Please save a copy without macros.');
                }

                $innerExt = strtolower(pathinfo($lower, PATHINFO_EXTENSION));
                if ($innerExt && in_array($innerExt, self::DANGEROUS_IN_ZIP, true)) {
                    $fail('The archive contains files that are not allowed (scripts or programs).');
                }
            }

            if ($ext !== 'zip' && !$hasContentTypes) $fail($badContent);
        } finally {
            $zip->close();
        }
    }

    public function safeFileName(string $original, string $ext): string
    {
        $stem = pathinfo($original, PATHINFO_FILENAME);
        $stem = preg_replace('/[^\p{L}\p{N} _().-]/u', '', $stem) ?? '';
        $stem = trim(preg_replace('/\s+/', ' ', $stem) ?? '', ' .');
        $stem = mb_substr($stem !== '' ? $stem : 'submission', 0, 120);
        return $stem . '.' . ($ext === 'jpeg' ? 'jpg' : $ext);
    }

    /** Stream a stored file back safely (always as a download). */
    public function download(MaterialItemSubmission $s)
    {
        if (!$s->file_path || !Storage::disk(self::DISK)->exists($s->file_path)) {
            return response()->json(['message' => 'File not found.'], 404);
        }
        $name = $this->safeFileName((string) $s->file_original_name, (string) $s->file_ext);
        $ascii = preg_replace('/[^A-Za-z0-9 _().-]/', '_', $name);

        return Storage::disk(self::DISK)->download($s->file_path, $ascii, [
            'Content-Type'            => 'application/octet-stream',
            'X-Content-Type-Options'  => 'nosniff',
            'Content-Security-Policy' => "default-src 'none'; sandbox",
            'Cache-Control'           => 'private, no-store',
        ]);
    }
}
