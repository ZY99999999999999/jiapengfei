@echo off
chcp 65001 >nul 2>&1
title 蒙古族纹样交互设计平台
cd /d "%~dp0"
set PORT=8766

echo.
echo   ✨ 蒙古族纹样交互设计平台
echo   ─────────────────────────────────

:: 优先使用 Node.js
where node >nul 2>&1
if %errorlevel%==0 (
  start "" "http://localhost:%PORT%"
  node server.js %PORT%
  goto :eof
)

:: 其次 Python（尝试 python3 和 python 两种命令）
where python3 >nul 2>&1
if %errorlevel%==0 (
  start "" "http://localhost:%PORT%"
  python3 server.py %PORT%
  goto :eof
)

where python >nul 2>&1
if %errorlevel%==0 (
  start "" "http://localhost:%PORT%"
  python server.py %PORT%
  goto :eof
)

:: 兜底：直接用浏览器打开
echo   ⚠️  未检测到 Node.js 或 Python
echo   正在直接用浏览器打开（手势识别等高级功能可能受限）
start "" "%~dp0index.html"
pause
