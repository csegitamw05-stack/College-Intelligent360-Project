@echo off
echo ============================================
echo  Committing and pushing to Render deploy...
echo ============================================

cd /d "%~dp0"

echo.
echo [1] Adding all changed files...
git add -f frontend/lib/
git add -A

echo.
echo [2] Committing...
git commit -m "feat(backend): Add /api/v1/seed-database endpoint and safe seeding logic

- main.py: Add public /api/v1/seed-database endpoint for on-demand table initialization
- seed_demo.py: Safe skipping when users exist, prevent foreign key issues"

echo.
echo [3] Pushing to main...
git push origin main

echo.
echo ============================================
echo  Done! Check Render dashboard for build log.
echo ============================================
pause
