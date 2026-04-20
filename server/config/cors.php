<?php

return [
    'paths' => ['api/*','sanctum/csrf-cookie','auth/*','stripe/webhook', 'courses/*', 'scholarships/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'https://learnexity.org',
        'https://www.learnexity.org',
        env('FRONTEND_URL', 'http://localhost:3000')
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => ['Authorization'],
    'max_age' => 0,
    'supports_credentials' => true,
];
