@echo off
cd /d "%~dp0frontend"
echo Starting Frontend on http://localhost:3000 ...
call npx next dev -p 3000
pause
