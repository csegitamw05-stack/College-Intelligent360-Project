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
git commit -m "feat: Connect Neon PostgreSQL database and configure Render production settings

- backend/.env and render.yaml: Configured Neon PostgreSQL connection
- config.py: Neon URL sanitization (channel_binding and postgresql schema normalization)
- main.py: HEAD health check support and favicon handler
- modules.py: Lab model import fix
- seed_demo.py: Section and Subject schema alignment with database"

echo.
echo [3] Pushing to main...
git push origin main

echo.
echo ============================================
echo  Done! Check Render dashboard for build log.
echo ============================================
pause
