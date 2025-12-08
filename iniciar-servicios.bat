@echo off
chcp 65001 >nul
title RolaPet - Control de Servicios
color 0A

echo.
echo    ██████╗  ██████╗ ██╗      █████╗ ██████╗ ███████╗████████╗
echo    ██╔══██╗██╔═══██╗██║     ██╔══██╗██╔══██╗██╔════╝╚══██╔══╝
echo    ██████╔╝██║   ██║██║     ███████║██████╔╝█████╗     ██║   
echo    ██╔══██╗██║   ██║██║     ██╔══██║██╔═══╝ ██╔══╝     ██║   
echo    ██║  ██║╚██████╔╝███████╗██║  ██║█║     ║███████╗   ██║   
echo    ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═   ╚══════╝   ╚═╝   
echo.
echo                           by lufero
echo    ========================================================
echo.

REM Usar el directorio donde está este script como base
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

echo [INFO] Directorio base: %ROOT_DIR%

echo [1/4] Iniciando Auth Service (puerto 8081)...
start "Auth_Service" /B cmd /c "cd /d "%ROOT_DIR%microservice-auth" && mvn spring-boot:run"

timeout /t 10 >nul

echo [2/4] Iniciando User Service (puerto 8082)...
start "User_Service" /B cmd /c "cd /d "%ROOT_DIR%microservice-user" && mvn spring-boot:run"

timeout /t 10 >nul

echo [3/4] Iniciando E-commerce Service (puerto 8084)...
start "Ecommerce_Service" /B cmd /c "cd /d "%ROOT_DIR%microservice-ecommerce" && mvn spring-boot:run"

timeout /t 10 >nul

REM Verificar si existe frontend antes de iniciarlo
if exist "%ROOT_DIR%frontend\rolapet-frontend\package.json" (
    echo [4/4] Iniciando Frontend (puerto 3000)...
    start "Frontend" /B cmd /c "cd /d "%ROOT_DIR%frontend\rolapet-frontend" && npm start && pause"
) else (
    echo [INFO] Frontend no encontrado, omitiendo...
)

echo ========================================================
echo                    ✅ SERVICIOS INICIADOS
echo ========================================================
echo.
echo    📍 Endpoints disponibles:
echo       🔐 Auth:    http://localhost:8081
echo       👤 User:    http://localhost:8082  
echo       🛒 E-commerce: http://localhost:8084
if exist "%ROOT_DIR%frontend\rolapet-frontend\package.json" (
echo       🖥️  Front:   http://localhost:3000
)
echo.
echo    📋 Esta ventana es solo de control
echo    ⚠️  Los servicios corren en segundo plano
echo    🛑 Para detener: Ejecuta 'detener-servicios.bat'
echo    📊 Para estado: Ejecuta 'ver-servicios.bat'
echo.
echo ========================================================
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul