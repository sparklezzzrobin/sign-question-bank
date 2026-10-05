@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
echo ================================================
echo   信号与系统刷题库 - 静态服务器
echo   关闭本窗口即停止服务
echo ================================================
where python >nul 2>nul
if errorlevel 1 (
  echo [X] 未找到 python,请先安装 Python 或改用其他部署方式。
  pause
  exit /b 1
)
echo.
echo 本机局域网地址(手机连同一 WiFi 时用这个访问):
ipconfig | findstr /i "IPv4"
echo.
echo 访问地址: http://<上面的IPv4地址>:8000/
echo.
python -m http.server 8000 --bind 0.0.0.0
endlocal
