@echo off
echo Iniciando microservicios RolaPet...
echo.

echo 1. Iniciando Auth Service (Puerto 8081)...
start "Auth Service" cmd /k "docker run -p 8081:8081 microservice-auth"

timeout /t 3 /nobreak >nul

echo 2. Iniciando User Service (Puerto 8082)...
start "User Service" cmd /k "docker run -p 8082:8082 microservice-auth"

echo.
echo ¡Microservicios iniciados!
echo - Auth: http://localhost:8081
echo - User: http://localhost:8082
echo.
pause