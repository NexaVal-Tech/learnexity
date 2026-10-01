<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * For public, read-only JSON endpoints (course lists, CMS content):
 *
 *  - Short shared caching (Cache-Control) so repeat visits and CDNs/proxies
 *    can reuse the response instead of downloading it again.
 *  - ETag + 304 Not Modified: when nothing changed the browser gets an
 *    empty reply instead of the whole JSON again.
 *  - Gzip when the client accepts it and the web server hasn't already
 *    compressed the response — JSON shrinks ~70–90%, which matters most
 *    on slow connections.
 *
 * Usage in routes: ->middleware('public.cache:60') (seconds of freshness).
 */
class PublicApiCache
{
    public function handle(Request $request, Closure $next, string $maxAge = '60'): Response
    {
        $response = $next($request);

        if (!$request->isMethod('GET') || $response->getStatusCode() !== 200) {
            return $response;
        }
        // Never cache anything sent with credentials.
        if ($request->bearerToken()) {
            $response->headers->set('Cache-Control', 'private, no-store');
            return $response;
        }

        $content = $response->getContent();
        if ($content === false) {
            return $response;
        }

        $seconds = max(0, (int) $maxAge);
        $response->headers->set('Cache-Control', "public, max-age={$seconds}, stale-while-revalidate=" . ($seconds * 10));
        $response->headers->set('Vary', 'Accept-Encoding', false);

        // ETag on the uncompressed body.
        $etag = '"' . md5($content) . '"';
        $response->headers->set('ETag', $etag);
        $ifNoneMatch = array_map('trim', explode(',', (string) $request->headers->get('If-None-Match', '')));
        if (in_array($etag, $ifNoneMatch, true) || in_array('W/' . $etag, $ifNoneMatch, true)) {
            $response->setNotModified();
            return $response;
        }

        // Gzip (skip small bodies and already-encoded responses).
        $accepts = (string) $request->headers->get('Accept-Encoding', '');
        if (
            function_exists('gzencode')
            && strlen($content) > 1024
            && stripos($accepts, 'gzip') !== false
            && !$response->headers->has('Content-Encoding')
        ) {
            $gz = gzencode($content, 6);
            if ($gz !== false) {
                $response->setContent($gz);
                $response->headers->set('Content-Encoding', 'gzip');
                $response->headers->set('Content-Length', (string) strlen($gz));
            }
        }

        return $response;
    }
}
