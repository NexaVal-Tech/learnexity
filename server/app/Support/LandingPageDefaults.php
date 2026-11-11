<?php

namespace App\Support;

/**
 * Marketing landing page — default content and the sanitiser used when an
 * admin saves it. The saved JSON may only contain keys that exist here;
 * every string is plain text (tags stripped), links must be http(s) or a
 * site path, and images must be http(s), /storage/… or assets/….
 */
class LandingPageDefaults
{
    public const PATHWAYS = ['deeptech', 'accelerator', 'flex'];
    public const BUTTON_STYLES = ['primary', 'outline', 'ghost', 'light'];

    public static function content(): array
    {
        $main = 'https://learnexity.org';

        return [
            'seo' => [
                'title'       => 'Prepare for Remote Opportunities in the US and Beyond | Learnexity',
                'description' => 'Build high-demand tech skills, understand the US and global job markets, and position yourself for greater opportunities with Learnexity.',
            ],

            // The three buttons repeated through the page.
            'ctas' => [
                ['label' => 'Explore Courses',        'href' => $main . '/courses',             'style' => 'primary'],
                ['label' => 'Check Your Eligibility', 'href' => $main . '/user/auth/register',  'style' => 'outline'],
                ['label' => 'Get Expert Guidance',    'href' => $main . '/consultation',        'style' => 'ghost'],
            ],

            'hero' => [
                'show'       => true,
                'eyebrow'    => 'US-based EdTech · Remote-ready careers',
                'heading'    => 'Prepare for remote opportunities in the US and beyond.',
                'subheading' => 'Build high-demand tech skills. Understand the US and global job markets. Position yourself for greater opportunities.',
                'image'      => 'assets/hero.jpg',
                'show_ctas'  => true,
            ],

            'intro' => [
                'show'       => true,
                'paragraphs' => [
                    'The technology job market is evolving. Employers are looking for people who can demonstrate relevant skills, practical experience, and an understanding of workplace expectations.',
                    'Learnexity is a US-based EdTech institution preparing young professionals for the AI-driven economy through relevant technology education, practical experience, and career development.',
                ],
                'image' => 'assets/intro.jpg',
            ],

            'gain' => [
                'show'    => true,
                'eyebrow' => 'What you will gain',
                'heading' => 'Everything you need to compete for global roles',
                'image'   => 'assets/gain.jpg',
                'items'   => [
                    ['title' => 'In-Demand Technical Skills', 'text' => 'Develop practical, market-relevant skills aligned with the evolving technology landscape.'],
                    ['title' => 'USA Job Market Readiness', 'text' => 'Understand employer expectations, professional standards, and how to position your skills for US-based opportunities.'],
                    ['title' => 'Remote Career and Freelance Preparation', 'text' => 'Learn how to identify opportunities, strengthen your professional profile, and position yourself for remote roles, freelance projects, and global clients.'],
                    ['title' => 'USA Workplace Culture and Professional Etiquette', 'text' => 'Understand US workplace culture, communication, professional etiquette, and expectations.'],
                    ['title' => 'Microsoft/AWS Certification Guidance', 'text' => 'Get guidance toward relevant Microsoft and AWS certifications for eligible programs.'],
                ],
            ],

            'who' => [
                'show'      => true,
                'eyebrow'   => 'Who should apply?',
                'heading'   => 'Built for ambitious, globally-minded professionals',
                'text'      => 'Technology professionals, aspiring tech talent, career changers, and global professionals targeting US-based or international opportunities.',
                'image'     => 'assets/who.jpg',
                'show_ctas' => true,
            ],

            'how' => [
                'show'    => true,
                'eyebrow' => 'How it works',
                'heading' => 'Your path from screening to the right program',
                'image'   => 'assets/mentoring.jpg',
                'steps'   => [
                    ['title' => 'Take the Screening', 'text' => 'Complete our screening assessment to check your eligibility.'],
                    ['title' => 'Get Your Program Recommendation', 'text' => 'Receive expert guidance on the program best aligned with your background, experience, and career goals.'],
                    ['title' => 'Complete Your Registration', 'text' => 'Confirm your recommended program, pay the applicable registration fee, and receive your onboarding details.'],
                    ['title' => 'Understand the Shift and Opportunities', 'text' => 'Participate in our two-week Digital Economy and Career Transition Orientation to explore how AI and technology are changing industries, careers, and skill opportunities.'],
                    ['title' => 'Reassess Your Pathway', 'text' => 'Use the insights gained during orientation to review your initial program choice and make adjustments if necessary.'],
                ],
            ],

            'offer' => [
                'show'          => true,
                'eyebrow'       => 'Limited-time offer',
                'heading'       => 'Learnexity Black Friday Offer',
                'text'          => 'For a limited time, pay only the discounted registration fee to access selected programs.',
                'ends_at'       => '2026-11-15T23:59:59-05:00',
                'ends_label'    => 'Offer ends November 15, 2026.',
                'ended_heading' => 'Offer ended',
                'ended_text'    => 'Our Black Friday offer has ended. Stay tuned — new offers are coming soon. You can still explore our programs today.',
                'col_program'   => 'Program',
                'col_regular'   => 'Regular Tuition',
                'col_fee'       => 'Black Friday Registration Fee',
                'row_button'    => 'View programs',
                // Regular tuition is typed here; the registration fee comes
                // live from Admin → Course Settings → Registration fee.
                'rows' => [
                    ['pathway' => 'deeptech',    'label' => 'DeepTech',            'regular_usd' => 1170, 'regular_ngn' => null, 'href' => $main . '/courses/courses'],
                    ['pathway' => 'accelerator', 'label' => 'Career Accelerators', 'regular_usd' => 487,  'regular_ngn' => null, 'href' => $main . '/intermediate'],
                    ['pathway' => 'flex',        'label' => 'Flex Programs',       'regular_usd' => 99,   'regular_ngn' => null, 'href' => $main . '/flex'],
                ],
            ],

            'pathway' => [
                'show'       => true,
                'eyebrow'    => 'Find your Learnexity pathway',
                'heading'    => 'Not every learner needs the same skills or learning pathway.',
                'text'       => 'Take our screening assessment to help determine your eligibility and identify a suitable program.',
                'image'      => 'assets/screening.jpg',
                'show_ctas'  => true,
            ],

            'discover' => [
                'show'    => true,
                'eyebrow' => 'Discover more',
                'heading' => 'Discover More Learnexity Opportunities',
                'items'   => [
                    ['badge' => 'December 14', 'title' => 'Free Launch Webinar', 'text' => 'Explore opportunities in the evolving digital economy and learn how to position yourself to take advantage of them.', 'button' => 'Learn more', 'href' => '', 'image' => 'assets/webinar.jpg'],
                    ['badge' => 'November 14', 'title' => 'Learnexity TV', 'text' => 'Discover emerging opportunities in technology and the global digital economy.', 'button' => 'Register', 'href' => 'https://tv.learnexity.org', 'image' => 'assets/tv.jpg'],
                ],
            ],

            'instructors' => [
                'show'       => true,
                'eyebrow'    => 'Learn from practitioners',
                'heading'    => 'Meet Your Instructors',
                // Names from Meet Our Team to show (empty = everyone whose
                // role mentions instructor, tutor, engineer or coach).
                'names'      => [],
                'link_label' => 'Meet the full team',
                'link_href'  => $main . '/our-team',
            ],

            'closing' => [
                'show'            => true,
                'heading'         => 'Ready to take the next step?',
                'learn_more_label'=> 'Learn more: Learnexity.org',
                'learn_more_href' => $main,
                'disclaimer'      => 'Program admission and eligibility are subject to screening. Training and career preparation do not guarantee employment, relocation, or a job offer.',
                'show_ctas'       => true,
            ],
        ];
    }

    /** Deep-merge saved content over defaults (lists are replaced, not merged). */
    public static function merge(array $defaults, array $saved): array
    {
        $out = $defaults;
        foreach ($saved as $k => $v) {
            if (!array_key_exists($k, $defaults)) continue;
            $d = $defaults[$k];
            if (is_array($d) && !array_is_list($d) && is_array($v) && !array_is_list($v)) {
                $out[$k] = self::merge($d, $v);
            } else {
                $out[$k] = $v;
            }
        }
        return $out;
    }

    /** Clean admin input against the default shape. */
    public static function sanitize(array $input): array
    {
        return self::clean($input, self::content(), '');
    }

    private static function clean($value, $default, string $key)
    {
        // Associative object: only known keys.
        if (is_array($default) && !array_is_list($default)) {
            $value = is_array($value) ? $value : [];
            $out = [];
            foreach ($default as $k => $d) {
                $out[$k] = self::clean($value[$k] ?? $d, $d, (string) $k);
            }
            return $out;
        }

        // List.
        if (is_array($default)) {
            $value = is_array($value) ? array_values($value) : [];
            $template = $default[0] ?? '';
            $max = match ($key) { 'names' => 40, 'paragraphs' => 6, 'ctas' => 4, 'rows' => 6, 'steps' => 10, 'items' => 10, default => 12 };
            $out = [];
            foreach (array_slice($value, 0, $max) as $item) {
                $out[] = self::clean($item, $template, $key === 'names' || $key === 'paragraphs' ? 'text' : '');
            }
            return $out;
        }

        // Scalars by key name.
        if (in_array($key, ['show', 'show_ctas'], true)) {
            return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? (bool) $default;
        }
        if (in_array($key, ['regular_usd', 'regular_ngn'], true)) {
            if ($value === null || $value === '' || !is_numeric($value)) return null;
            return round(max(0, min(100000000, (float) $value)), 2);
        }
        if ($key === 'style') {
            return in_array($value, self::BUTTON_STYLES, true) ? $value : 'primary';
        }
        if ($key === 'pathway') {
            return in_array($value, self::PATHWAYS, true) ? $value : 'flex';
        }
        if ($key === 'ends_at') {
            if (!$value) return null;
            try {
                return \Carbon\Carbon::parse((string) $value)->toIso8601String();
            } catch (\Throwable $e) {
                return null;
            }
        }
        if (str_ends_with($key, 'href')) {
            return self::cleanUrl((string) ($value ?? ''));
        }
        if ($key === 'image') {
            return self::cleanImage((string) ($value ?? ''));
        }

        $max = in_array($key, ['text', 'description', 'disclaimer', 'subheading', 'ended_text'], true) ? 1200 : 300;
        $s = strip_tags((string) ($value ?? ''));
        $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '';
        return mb_substr(trim($s), 0, $max);
    }

    public static function cleanUrl(string $url): string
    {
        $url = trim($url);
        if ($url === '') return '';
        if (preg_match('#^/[^/]#', $url) || $url === '/') return mb_substr($url, 0, 500);
        if (preg_match('#^\#[\w-]+$#', $url)) return $url;
        if (preg_match('#^(mailto|tel):#i', $url)) return mb_substr($url, 0, 300);
        if (!preg_match('#^https?://#i', $url)) $url = 'https://' . ltrim($url, '/');
        return filter_var($url, FILTER_VALIDATE_URL) ? mb_substr($url, 0, 500) : '';
    }

    public static function cleanImage(string $src): string
    {
        $src = trim($src);
        if ($src === '') return '';
        if (preg_match('#^assets/[A-Za-z0-9._-]+$#', $src)) return $src;
        if (preg_match('#^/storage/[A-Za-z0-9/._-]+$#', $src) && !str_contains($src, '..')) return $src;
        if (preg_match('#^https://#i', $src) && filter_var($src, FILTER_VALIDATE_URL)) return mb_substr($src, 0, 500);
        return '';
    }
}
