@echo off
setlocal
set "PAGE=%~dp0app\index.html"
if not exist "%PAGE%" (
  echo [X] app\index.html not found. Keep this cmd next to the app folder.
  pause
  exit /b 1
)
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
set "EDGE=%ProgramFiles(x86)%\Microsoftdge\Application\msedge.exe"
if exist "%ProgramFiles%\Microsoftdge\Application\msedge.exe" set "EDGE=%ProgramFiles%\Microsoftdge\Application\msedge.exe"
if exist "%CHROME%" (
  start "" "%CHROME%" "file:///%PAGE:\=/%"
  exit /b 0
)
if exist "%EDGE%" (
  start "" "%EDGE%" "file:///%PAGE:\=/%"
  exit /b 0
)
start "" "%PAGE%"
endlocal
