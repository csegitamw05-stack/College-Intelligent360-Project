@echo off
echo ============================================
echo  Committing and pushing to Render deploy...
echo ============================================

cd /d "%~dp0"

echo.
echo [1] Adding all changed files...
git add -A

echo.
echo [2] Committing...
git commit -m "fix: Render deployment - python-magic-bin, scripts __init__.py, render.yaml cleanup

- Replace python-magic with platform-conditional deps (python-magic-bin on Windows,
  python-magic on Linux/Render) to avoid libmagic binary dependency issue
- Add backend/scripts/__init__.py so 'from scripts.seed_demo import run_seed' works
- Fix render.yaml: remove unsupported 'transform' key, pin Python 3.11.9,
  hardcode backend URL for frontend NEXT_PUBLIC_API_URL
- Restore database.py to original (engine creation at runtime is fine on Render)"

echo.
echo [3] Pushing to main...
git push origin main

echo.
echo ============================================
echo  Done! Check Render dashboard for build log.
echo ============================================
pause
