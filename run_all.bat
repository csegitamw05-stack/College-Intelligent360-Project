@echo off
cd /d "%~dp0"
echo ======================================================================
echo          Campus Intelligence 360 - 1-Click Starter
echo ======================================================================
echo.
echo [1/2] Starting Backend Server...
start "Campus 360 - Backend" run_backend.bat

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server...
start "Campus 360 - Frontend" fix_and_run_frontend.bat

echo.
echo ======================================================================
echo  Servers are starting in their respective terminal windows.
echo  Please check both windows to ensure they show "Ready" or "Uvicorn running".
echo.
echo  - Frontend Web App: http://localhost:3000
echo  - Backend API Docs: http://localhost:8000/docs
echo ======================================================================
timeout /t 5
