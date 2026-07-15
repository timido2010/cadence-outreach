@echo off
setlocal
cd /d "%~dp0"

echo ===============================================
echo   Cadence - Save and publish your changes
echo ===============================================
echo.

git add -A

set /p MSG="Describe what changed (or just press Enter): "
if "%MSG%"=="" set MSG=Update

git commit -m "%MSG%"
if errorlevel 1 (
  echo.
  echo Nothing to commit - no changes were found in this folder.
  goto :end
)

echo.
echo Uploading to GitHub...
git push origin master
if errorlevel 1 (
  echo.
  echo Push failed. Check your internet connection, then try again.
  echo If it keeps failing, ask Claude for help.
  goto :end
)

echo.
echo Done! Your live site will update within about a minute:
echo https://timido2010.github.io/cadence-outreach/

:end
echo.
pause
