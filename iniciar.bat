@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0iniciar.ps1"
if %errorlevel% neq 0 (
    echo.
    echo Pressione qualquer tecla para fechar...
    pause >nul
)
