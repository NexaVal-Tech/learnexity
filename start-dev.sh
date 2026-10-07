#!/usr/bin/env bash
# Learnexity - start backend (Laravel) + queue worker + frontend (Next.js).
# Usage: ./start-dev.sh   (Ctrl+C stops everything)
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

[ -d "$ROOT/server/vendor" ] || (cd "$ROOT/server" && composer install)
[ -d "$ROOT/frontend/node_modules" ] || (cd "$ROOT/frontend" && npm install)

pids=()
cleanup() { echo; echo "Stopping..."; kill "${pids[@]}" 2>/dev/null || true; }
trap cleanup INT TERM EXIT

(cd "$ROOT/server" && php artisan serve --host=127.0.0.1 --port=8000) & pids+=($!)
(cd "$ROOT/server" && php artisan queue:work --tries=3 --timeout=120) & pids+=($!)
(cd "$ROOT/frontend" && npm run dev) & pids+=($!)

echo "Backend : http://localhost:8000"
echo "Frontend: http://localhost:3000"
wait
