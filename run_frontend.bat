@echo off
cd /d "%~dp0\frontend"
echo Installing Node modules just in case...
call npm install
echo.
echo Starting the Frontend Server...
call npm run dev
pause
