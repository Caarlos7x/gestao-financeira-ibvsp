@echo off
setlocal
cd /d "%~dp0"
if /i "%~1"=="run" (
  call npm run %2 %3 %4 %5 %6 %7 %8 %9
  exit /b %ERRORLEVEL%
)
if /i "%~1"=="i" (
  call npm install %2 %3 %4 %5 %6 %7 %8 %9
  exit /b %ERRORLEVEL%
)
if /i "%~1"=="install" (
  call npm install %2 %3 %4 %5 %6 %7 %8 %9
  exit /b %ERRORLEVEL%
)
echo Usage:
echo   vp.cmd run ^<script^>     e.g. vp.cmd run dev
echo   vp.cmd i                 same as npm install
echo   vp.cmd install           same as npm install
echo.
echo In PowerShell use: .\vp.cmd ^<args^>
exit /b 1
