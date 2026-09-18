@echo off
setlocal
set "ROOT=%~dp0"

echo Starting Fastwork (Go + sqlite3 + React)

where go >nul 2>nul
if errorlevel 1 (
  echo [ERROR] go tidak ditemukan di PATH.
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm tidak ditemukan di PATH. Install Node.js dulu.
  exit /b 1
)

rem --- backend ---
if not exist "%ROOT%backend\fastwork-server.exe" (
  echo Building backend...
  pushd "%ROOT%backend"
  go build -o fastwork-server.exe ./cmd/server
  if errorlevel 1 (
    echo [ERROR] Build backend gagal.
    popd
    exit /b 1
  )
  popd
)

echo Starting backend on http://localhost:8080 ...
start "fastwork-backend" /D "%ROOT%backend" cmd /k "title fastwork-backend && set PORT=8080&& fastwork-server.exe || (echo [BACKEND EXITED ^/ CRASHED] && pause)"

rem --- frontend ---
if not exist "%ROOT%frontend\node_modules" (
  echo Installing frontend dependencies...
  pushd "%ROOT%frontend"
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install gagal.
    popd
    exit /b 1
  )
  popd
)

echo Starting frontend on http://localhost:3000 ...
start "fastwork-frontend" /D "%ROOT%frontend" cmd /k "title fastwork-frontend && npm run dev -- --host 0.0.0.0 --port 3000"

echo.
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:3000
echo.
echo Stop: tutup jendela fastwork-backend dan fastwork-frontend,
echo   atau: taskkill /FI "WINDOWTITLE eq fastwork-backend*" /T /F ^& taskkill /FI "WINDOWTITLE eq fastwork-frontend*" /T /F
endlocal
