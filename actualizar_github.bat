@echo off
chcp 65001 > nul
title SOGNE - Sincronizador Automático de GitHub
color 0B

echo =======================================================
echo          SISTEMA SOGNE - SINCRONIZADOR GITHUB
echo =======================================================
echo.

cd /d "%~dp0"

echo [1/4] Comprobando estado del proyecto...
git status -s

echo.
set /p mensaje="Escribe un mensaje de cambio (Presiona ENTER para mensaje automático): "

if "%mensaje%"=="" (
    for /f "tokens=1-3 delims=/ " %%a in ('date /t') do (set mydate=%%a-%%b-%%c)
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do (set mytime=%%a:%%b)
    set mensaje=Actualización automática SOGNE %mydate% %mytime%
)

echo.
echo [2/4] Preparando archivos modificados...
git add .

echo.
echo [3/4] Creando punto de guardado (Commit)...
git commit -m "%mensaje%"

echo.
echo [4/4] Subiendo cambios a GitHub...
git pull origin main --rebase
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo =======================================================
    echo    ¡TODO ACTUALIZADO Y SUBIDO A GITHUB CON ÉXITO!
    echo =======================================================
) else (
    echo.
    echo =======================================================
    echo    Hubo un problema al subir los cambios. Revisa tu conexión.
    echo =======================================================
)

echo.
pause
