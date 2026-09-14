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
git commit -m "fix: Render deployment - import fixes in modules.py, seed_demo.py, postgresql URL normalization

- modules.py: Import Lab from academics instead of org
- seed_demo.py: Remove non-existent Program and Batch models, fix Section and Subject fields
- config.py: Normalize postgres:// to postgresql:// for SQLAlchemy Render database URL
- Add backend/scripts/__init__.py so 'from scripts.seed_demo import run_seed' works
- Replace python-magic with platform-conditional dependencies
- render.yaml: remove unsupported transform key, hardcode backend API URL, pin Python 3.11.9"

echo.
echo [3] Pushing to main...
git push origin main

echo.
echo ============================================
echo  Done! Check Render dashboard for build log.
echo ============================================
pause
