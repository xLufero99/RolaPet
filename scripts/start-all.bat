@echo off
echo Iniciando todos los microservicios RolaPet...

echo [1/3] Iniciando Auth Service (puerto 8081)...
start "Auth Service" cmd /k "cd ../microservice-auth && mvn spring-boot:run"

timeout /t 5

echo [2/3] Iniciando User Service (puerto 8082)...
start "User Service" cmd /k "cd ../microservice-user && mvn spring-boot:run"

timeout /t 5

echo [3/3] Iniciando Frontend (puerto 3000)...
start "Frontend" cmd /k "cd ../frontend-demo && python -m http.server 3000"

echo ¡Todos los servicios iniciados!
echo - Auth: http://localhost:8081
echo - User: http://localhost:8082  
echo - Frontend: http://localhost:3000