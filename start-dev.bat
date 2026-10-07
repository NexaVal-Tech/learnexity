@echo off
REM ------------------------------------------------------------------
REM  Learnexity - start backend (Laravel) + frontend (Next.js) at once.
REM  Double-click this file, or run `start-dev` from this folder.
REM  Opens three windows: API (port 8000), queue worker (emails/jobs),
REM  and the Next.js dev server (port 3000). Close a window to stop it.
REM ------------------------------------------------------------------
setlocal
set ROOT=%~dp0

where php >nul 2>nul || (echo [!] PHP not found on PATH. Install PHP or add it to PATH. & pause & exit /b 1)
where npm >nul 2>nul || (echo [!] Node/npm not found on PATH. Install Node.js. & pause & exit /b 1)

if not exist "%ROOT%server\vendor" (
  echo Installing backend dependencies...
  pushd "%ROOT%server" && call composer install && popd
)
if not exist "%ROOT%frontend\node_modules" (
  echo Installing frontend dependencies...
  pushd "%ROOT%frontend" && call npm install && popd
)

start "Learnexity API :8000" cmd /k "cd /d %ROOT%server && php artisan serve --host=127.0.0.1 --port=8000"
start "Learnexity Queue" cmd /k "cd /d %ROOT%server && php artisan queue:work --tries=3 --timeout=120"
start "Learnexity Frontend :3000" cmd /k "cd /d %ROOT%frontend && npm run dev"

echo.
echo  Backend : http://localhost:8000
echo  Frontend: http://localhost:3000
echo.
timeout /t 6 >nul
start "" http://localhost:3000
endlocal
