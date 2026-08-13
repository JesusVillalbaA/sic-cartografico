@echo off
chcp 65001 > nul
title SOGNE - Descargar Actualizaciones de GitHub
color 0A

echo =======================================================
echo     SISTEMA SOGNE - DESCARGAR ÚLTIMOS CAMBIOS
echo =======================================================
echo.

cd /d "%~dp0"

echo [1/2] Conectando con GitHub...
git pull origin main

if %errorlevel% equ 0 (
    echo.
    echo [2/2] Verificando dependencias...
    echo.
    echo =======================================================
    echo    ¡PROYECTO DESCARGADO Y AL DÍA CON EL REPOSITORIO!
    echo =======================================================
) else (
    echo.
    echo =======================================================
    echo    Hubo un error al descargar. Revisa tu conexión.
    echo =======================================================
)

echo.
pause
