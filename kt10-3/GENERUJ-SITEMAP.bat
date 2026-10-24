@echo off
chcp 65001 >nul
cd /d "%~dp0"
py tools/generate_sitemap.py
if errorlevel 1 python tools/generate_sitemap.py
if errorlevel 1 (
  echo.
  echo Nie udalo sie wygenerowac sitemap.xml. Sprawdz, czy Python jest zainstalowany.
  pause
  exit /b 1
)
echo.
echo Gotowe. Plik public\sitemap.xml zostal zaktualizowany.
pause
