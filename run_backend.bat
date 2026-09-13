@echo off
cd /d "%~dp0\backend"
echo ============================================
echo  Campus Intelligence 360 - Backend Startup
echo ============================================
echo.
echo [1/3] Installing/Updating requirements...
call .\venv\Scripts\pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo ERROR: pip install failed. Check your venv and requirements.txt
    pause
    exit /b 1
)
echo Done.
echo.
echo [2/3] Seeding demo database (auto-skips if already seeded)...
call .\venv\Scripts\python scripts/seed_demo.py
echo.
echo [3/3] Starting Backend Server on http://localhost:8000 ...
echo  - API Docs: http://localhost:8000/docs
echo  - Health:   http://localhost:8000/api/v1/health
echo.
call .\venv\Scripts\uvicorn main:app --reload --port 8000
pause
