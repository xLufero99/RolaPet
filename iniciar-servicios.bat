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

echo [INFO] Verificando estructura del proyecto...

REM Verificar que estamos en la carpeta correcta o encontrar RolaPet
if exist "microservice-auth" (
    echo [OK] Estructura de RolaPet detectada.
) else (
    echo [ERROR] No se encontró la carpeta microservice-auth
    echo [INFO] Buscando estructura RolaPet en directorio padre...
    cd ..
    if exist "microservice-auth" (
        echo [OK] Estructura encontrada.
    ) else (
        echo [ERROR] No se puede encontrar la estructura de RolaPet.
        echo [INFO] Ejecuta este script desde la carpeta RolaPet.
        pause
        exit /b 1
    )
)

echo [1/4] Iniciando Auth Service (puerto 8081)...
start "Auth_Service" /B /MIN cmd /c "cd microservice-auth && mvn spring-boot:run"

timeout /t 10 >nul

echo [2/4] Iniciando User Service (puerto 8082)...
start "User_Service" /B /MIN cmd /c "cd microservice-user && mvn spring-boot:run"

timeout /t 10 >nul

echo [3/4] Iniciando E-commerce Service (puerto 8084)...
start "Ecommerce_Service" /B /MIN cmd /c "cd microservice-ecommerce && mvn spring-boot:run"

timeout /t 10 >nul

REM Verificar si existe frontend antes de iniciarlo
if exist "frontend\rolapet-frontend" (
    echo [4/4] Iniciando Frontend (puerto 3000)...
    start "Frontend" /B /MIN cmd /c "cd frontend\rolapet-frontend && npm start"
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
if exist "frontend\rolapet-frontend" (
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