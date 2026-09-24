@echo off
cd /d "%~dp0"
echo Uploading to GitHub...
git add -A
git commit -m "update %date% %time%"
git push
echo.
echo Done. Press any key to close.
pause >nul
