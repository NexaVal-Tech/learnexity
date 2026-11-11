<?php

return [
    'paths' => ['api/*','sanctum/csrf-cookie','auth/*','stripe/webhook', 'courses/*', 'scholarships/*', 'materials/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:3010',
        'https://learnexity.org',
        'https://www.learnexity.org',
        'https://advisory.learnexity.org',
        'https://tv.learnexity.org',
        'https://main.learnexity.org',
        env('TV_URL', 'https://tv.learnexity.org'),
        env('FRONTEND_URL', 'http://localhost:3000'),
        env('ADVISORY_URL', 'http://localhost:3010'),
    ],
    // Any https://<sub>.learnexity.org page (e.g. the marketing landing page).
    'allowed_origins_patterns' => ['#^https://[a-z0-9-]+\.learnexity\.org$#'],
    'allowed_headers' => ['*'],
    'exposed_headers' => ['Authorization'],
    'max_age' => 0,
    'supports_credentials' => true,
];
