@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo.
echo =======================================
echo SNORLAX x MUNCHLAX - PSA 10 MARKET ATLAS
echo =======================================
where node >nul 2>nul
if errorlevel 1 (
  echo CHUA CO NODE.JS. Cai Node.js 20+ tu https://nodejs.org/
  pause
  exit /b 1
)
if not exist .env (
  copy /Y .env.example .env >nul
  echo Da tao .env. Neu muon gia eBay LIVE, mo .env dien App ID va Cert ID cua eBay Developer.
)
echo Dang mo http://127.0.0.1:4173
start "" "http://127.0.0.1:4173"
node server.js
pause
