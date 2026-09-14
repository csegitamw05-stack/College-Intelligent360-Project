@echo off
cd /d "%~dp0frontend"
echo =====================================================
echo  Campus Intelligence 360 - Frontend Startup
echo =====================================================
echo.

echo [1/3] Stopping any running node processes...
taskkill /f /im node.exe >nul 2>&1

echo [2/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing node modules...
    call npm install
)

echo [3/3] Starting Next.js Dev Server on http://localhost:3000 ...
call npx next dev -p 3000
pause
