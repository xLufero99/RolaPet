@echo off
chcp 65001 >nul
title RolaPet - Control de Servicios
color 0A
cd /d "C:\Users\Daniel\Desktop\RolaPet"

echo.
echo    ██████╗  ██████╗ ██╗      █████╗ ██████╗ ███████╗████████╗
echo    ██╔══██╗██╔═══██╗██║     ██╔══██╗██╔══██╗██╔════╝╚══██╔══╝
echo    ██████╔╝██║   ██║██║     ███████║██████╔╝█████╗     ██║   
echo    ██╔══██╗██║   ██║██║     ██╔══██║██╔════╗██╔══╝     ██║   
echo    ██║  ██║╚██████╔╝███████╗██║  ██║█║     ║███████╗   ██║   
echo    ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═   ╚══════╝   ╚═╝   
echo.
echo                           by lufero
echo    ========================================================
echo.

echo [1/3] Iniciando Auth Service (puerto 8081)...
start "Auth_Service" /B /MIN cmd /c "cd microservice-auth && mvn spring-boot:run"

timeout /t 10 >nul

echo [2/3] Iniciando User Service (puerto 8082)...
start "User_Service" /B /MIN cmd /c "cd microservice-user && mvn spring-boot:run"

timeout /t 10 >nul

echo [3/3] Iniciando Frontend (puerto 3000)...
start "Frontend" /B /MIN cmd /c "cd frontend\rolapet-frontend && npm start"

echo ========================================================
echo                    ✅ SERVICIOS INICIADOS
echo ========================================================
echo.
echo    📍 Endpoints disponibles:
echo       🔐 Auth:    http://localhost:8081
echo       👤 User:    http://localhost:8082  
echo       🖥️  Front:   http://localhost:3000
echo.
echo    📋 Esta ventana es solo de control
echo    ⚠️  Los servicios corren en segundo plano
echo    🛑 Para detener: Ejecuta 'detener-servicios.bat'
echo    📊 Para estado: Ejecuta 'ver-servicios.bat'
echo.
echo ========================================================
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul