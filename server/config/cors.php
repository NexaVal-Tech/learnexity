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
        env('FRONTEND_URL', 'http://localhost:3000'),
        env('ADVISORY_URL', 'http://localhost:3010'),
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => ['Authorization'],
    'max_age' => 0,
    'supports_credentials' => true,
];
