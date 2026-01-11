<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class LocationService
{
    /**
     * Detect user's currency based on IP address
     */
    public static function detectCurrency(string $ipAddress = null): string
    {
        
        try {
            // Get the real IP address (handles proxies and local development)
            $ip = $ipAddress ?? self::getRealIpAddress();

            Log::info('Currency detection', ['ip' => $ip, 'request_ip' => request()->ip()]);

            // Skip detection for truly local IPs only
            if (self::isLocalIp($ip)) {
                Log::info('Local IP detected, checking alternative methods');
                // For local development, try to get real public IP
                $publicIp = self::getPublicIp();
                if ($publicIp && !self::isLocalIp($publicIp)) {
                    $ip = $publicIp;
                    Log::info('Using public IP', ['public_ip' => $ip]);
                } else {
                    Log::info('No public IP found, defaulting to USD');
                    return 'USD'; // Default for development
                }
            }

            // Cache the result for 24 hours per IP
            return Cache::remember("currency_{$ip}", 86400, function () use ($ip) {
                return self::getCurrencyFromIp($ip);
            });
        } catch (\Exception $e) {
            Log::error('Currency detection failed', ['error' => $e->getMessage()]);
            return 'USD'; // Fallback to USD
        }
    }

    /**
     * Get real IP address considering proxies and load balancers
     */
    private static function getRealIpAddress(): string
    {
        // Check common proxy headers in order of reliability
        $headers = [
            'HTTP_CF_CONNECTING_IP',    // Cloudflare
            'HTTP_X_REAL_IP',           // Nginx proxy
            'HTTP_X_FORWARDED_FOR',     // Standard proxy header
            'HTTP_CLIENT_IP',           // Proxy
            'HTTP_X_FORWARDED',         // Proxy
            'HTTP_X_CLUSTER_CLIENT_IP', // Proxy
            'HTTP_FORWARDED_FOR',       // Proxy
            'HTTP_FORWARDED',           // Proxy
            'REMOTE_ADDR',              // Direct connection
        ];

        foreach ($headers as $header) {
            if (isset($_SERVER[$header]) && !empty($_SERVER[$header])) {
                $ip = $_SERVER[$header];
                
                // X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2)
                // The first one is usually the real client IP
                if (strpos($ip, ',') !== false) {
                    $ips = explode(',', $ip);
                    $ip = trim($ips[0]);
                }
                
                // Validate IP address
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }

        // Fallback to request IP
        return request()->ip();
    }

    /**
     * Get public IP for local development
     * This helps developers test with their real location
     */
    private static function getPublicIp(): ?string
    {
        try {
            // Use multiple services for reliability
            $services = [
                'https://api.ipify.org?format=json',
                'https://api.myip.com',
                'https://ipapi.co/json',
            ];

            foreach ($services as $service) {
                try {
                    $response = Http::timeout(3)->get($service);
                    
                    if ($response->successful()) {
                        $data = $response->json();
                        
                        // Different services have different response formats
                        $ip = $data['ip'] ?? $data['query'] ?? null;
                        
                        if ($ip && filter_var($ip, FILTER_VALIDATE_IP)) {
                            Log::info('Public IP obtained', ['service' => $service, 'ip' => $ip]);
                            return $ip;
                        }
                    }
                } catch (\Exception $e) {
                    Log::debug('Public IP service failed', ['service' => $service, 'error' => $e->getMessage()]);
                    continue;
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to get public IP', ['error' => $e->getMessage()]);
        }

        return null;
    }

    /**
     * Get currency from IP address using geolocation API
     */
    private static function getCurrencyFromIp(string $ip): string
    {
        try {
            Log::info('Getting currency for IP', ['ip' => $ip]);

            // Try multiple geolocation services for reliability
            $services = [
                [
                    'url' => "http://ip-api.com/json/{$ip}",
                    'country_key' => 'countryCode'
                ],
                [
                    'url' => "https://ipapi.co/{$ip}/json/",
                    'country_key' => 'country_code'
                ],
            ];

            foreach ($services as $service) {
                try {
                    $response = Http::timeout(5)->get($service['url']);

                    if ($response->successful()) {
                        $data = $response->json();
                        $countryCode = $data[$service['country_key']] ?? null;

                        Log::info('Geolocation result', [
                            'service' => $service['url'],
                            'country_code' => $countryCode,
                            'country' => $data['country'] ?? 'Unknown'
                        ]);

                        if ($countryCode) {
                            // Nigeria -> NGN, all others -> USD
                            return strtoupper($countryCode) === 'NG' ? 'NGN' : 'USD';
                        }
                    }
                } catch (\Exception $e) {
                    Log::debug('Geolocation service failed', [
                        'service' => $service['url'],
                        'error' => $e->getMessage()
                    ]);
                    continue;
                }
            }
        } catch (\Exception $e) {
            Log::error('IP geolocation failed', ['error' => $e->getMessage()]);
        }

        return 'USD';
    }

    /**
     * Check if IP is local/private
     */
    private static function isLocalIp(string $ip): bool
    {
        // Check for localhost
        if (in_array($ip, ['127.0.0.1', '::1', 'localhost'])) {
            return true;
        }

        // Check for private/reserved IP ranges
        return filter_var(
            $ip, 
            FILTER_VALIDATE_IP, 
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        ) === false;
    }

    /**
     * Get currency symbol
     */
    public static function getCurrencySymbol(string $currency): string
    {
        return match (strtoupper($currency)) {
            'NGN' => '₦',
            'USD' => '$',
            default => '$',
        };
    }

    /**
     * Get detailed location information
     */
    public static function getLocationInfo(string $ipAddress = null): array
    {
        try {
            $ip = $ipAddress ?? self::getRealIpAddress();
            
            // For local development, get public IP
            if (self::isLocalIp($ip)) {
                $publicIp = self::getPublicIp();
                if ($publicIp) {
                    $ip = $publicIp;
                }
            }

            // Cache location info for 24 hours
            return Cache::remember("location_{$ip}", 86400, function () use ($ip) {
                if (self::isLocalIp($ip)) {
                    return [
                        'ip' => $ip,
                        'country' => 'Local Development',
                        'country_code' => 'LOCAL',
                        'currency' => 'USD',
                        'symbol' => '$'
                    ];
                }

                try {
                    $response = Http::timeout(5)->get("http://ip-api.com/json/{$ip}");
                    
                    if ($response->successful()) {
                        $data = $response->json();
                        $countryCode = $data['countryCode'] ?? null;
                        $currency = $countryCode === 'NG' ? 'NGN' : 'USD';
                        
                        return [
                            'ip' => $ip,
                            'country' => $data['country'] ?? 'Unknown',
                            'country_code' => $countryCode ?? 'Unknown',
                            'city' => $data['city'] ?? null,
                            'region' => $data['regionName'] ?? null,
                            'currency' => $currency,
                            'symbol' => self::getCurrencySymbol($currency)
                        ];
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to get location info', ['error' => $e->getMessage()]);
                }

                return [
                    'ip' => $ip,
                    'country' => 'Unknown',
                    'country_code' => 'Unknown',
                    'currency' => 'USD',
                    'symbol' => '$'
                ];
            });
        } catch (\Exception $e) {
            Log::error('Location info failed', ['error' => $e->getMessage()]);
            return [
                'ip' => 'Unknown',
                'country' => 'Unknown',
                'country_code' => 'Unknown',
                'currency' => 'USD',
                'symbol' => '$'
            ];
        }
    }
}