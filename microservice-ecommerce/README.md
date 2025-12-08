# Microservice Ecommerce - RolaPet

Microservicio de ecommerce para la gestión de productos, carrito de compras y transacciones.

## 🚀 Tecnologías

- Java 17
- Spring Boot 3.4.12
- Spring Data JPA
- Spring Security + JWT
- Azure SQL Database
- Lombok

## 🔧 Configuración

### Variables de Entorno

```properties
DB_URL=jdbc:sqlserver://...
DB_USERNAME=adminsql
DB_PASSWORD=Enano0301
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
```

### Puerto
- Puerto: `8084`

## 📦 Compilación

```bash
mvn clean package
```

## 🐳 Docker

```bash
# Construir imagen
docker build -t microservice-ecommerce .

# Ejecutar contenedor
docker run -p 8084:8084 \
  -e DB_URL="jdbc:sqlserver://..." \
  -e DB_USERNAME="adminsql" \
  -e DB_PASSWORD="password" \
  -e JWT_SECRET="secret" \
  microservice-ecommerce
```

## 📋 Endpoints

### Productos
- `POST /api/v1/ecommerce/products` - Crear producto (requiere auth)
- `GET /api/v1/ecommerce/products` - Listar productos (público)
- `GET /api/v1/ecommerce/products/{id}` - Ver detalle (público)
- `PUT /api/v1/ecommerce/products/{id}` - Actualizar producto (requiere auth)
- `DELETE /api/v1/ecommerce/products/{id}` - Eliminar producto (requiere auth)
- `POST /api/v1/ecommerce/products/{id}/purchase` - Compra directa (requiere auth)

### Carrito
- `GET /api/v1/ecommerce/cart` - Ver mi carrito (requiere auth)
- `POST /api/v1/ecommerce/cart/items` - Agregar item (requiere auth)
- `PUT /api/v1/ecommerce/cart/items/{id}` - Actualizar cantidad (requiere auth)
- `DELETE /api/v1/ecommerce/cart/items/{id}` - Quitar item (requiere auth)
- `POST /api/v1/ecommerce/cart/checkout` - Procesar compra (requiere auth)
- `DELETE /api/v1/ecommerce/cart/clear` - Vaciar carrito (requiere auth)

### Transacciones
- `GET /api/v1/ecommerce/transactions/my-purchases` - Mis compras (requiere auth)
- `GET /api/v1/ecommerce/transactions/my-sales` - Mis ventas (requiere auth)
- `GET /api/v1/ecommerce/transactions/last-purchase` - Última compra (requiere auth)
- `GET /api/v1/ecommerce/transactions/last-sale` - Última venta (requiere auth)

## 🔐 Autenticación

Todas las operaciones autenticadas requieren el header:
```
Authorization: Bearer <token>
```

El token debe ser generado por el microservicio de autenticación.

## 📊 Entidades

### Product
- Productos disponibles para venta
- Categorías: SERVICIO, INSUMO
- Estados: DISPONIBLE, AGOTADO, PAUSADO

### Transaction
- Registro de compras completadas
- Estados: COMPLETADA, PENDIENTE, CANCELADA

### Cart
- Carrito de compras por usuario
- Un carrito por usuario

### CartItem
- Items dentro del carrito
- Relaciona carrito con productos
