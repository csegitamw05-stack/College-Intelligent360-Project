@echo off
cd /d "%~dp0backend"
echo ============================================
echo  Campus Intelligence 360 - Backend Startup
echo ============================================
echo.

echo Cleaning old Python cache...
del /s /q /f *.pyc >nul 2>&1
for /d /r . %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d" >nul 2>&1
echo Done.
echo.

if not exist "venv\Scripts\python.exe" (
    echo [0/3] Creating Python virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create venv. Ensure Python 3.10+ is installed and added to PATH.
        pause
        exit /b 1
    )
)

echo [1/3] Installing/Updating requirements...
call .\venv\Scripts\pip.exe install -r requirements.txt
if errorlevel 1 (
    echo ERROR: pip install failed. Check your Python environment.
    pause
    exit /b 1
)
echo Done.
echo.

echo [2/3] Seeding demo database...
call .\venv\Scripts\python.exe scripts\seed_demo.py
echo.

echo [3/3] Starting Backend Server on http://localhost:8000 ...
echo  - API Docs: http://localhost:8000/docs
echo  - Health:   http://localhost:8000/api/v1/health
echo.
call .\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
pause
