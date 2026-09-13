@echo off
echo =====================================================
echo  Campus Intelligence 360 - Frontend Fix and Restart
echo =====================================================
echo.

echo [1/4] Stopping any running Node.js processes...
taskkill /f /im node.exe >nul 2>&1
echo Done.
echo.

echo [2/4] Deleting broken .next cache inside project (if any)...
if exist "%~dp0\frontend\.next" (
    rd /s /q "%~dp0\frontend\.next"
    echo Deleted old .next folder.
) else (
    echo No .next folder found, skipping.
)
echo.

echo [3/4] Clearing old temp build cache...
if exist "%TEMP%\campus-intel-360-build" (
    rd /s /q "%TEMP%\campus-intel-360-build"
    echo Cleared temp build cache.
) else (
    echo No temp build cache found.
)
echo.

echo [4/4] Starting Frontend Server...
echo  - Build cache: %TEMP%\campus-intel-360-build (outside OneDrive!)
echo  - App URL:     http://localhost:3000
echo.
cd /d "%~dp0\frontend"
call npm run dev
pause
