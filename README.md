# Proyecto Final de Desarrollo Web - Subgrupo 2 - Grupo 315
**Jóvenes a Programar 2025**

## Integrantes
- Jésica Bignoli
- Mauro Borgeaud
- Josué Sosa
- Patricia Pérez
- Ismael Olaza

---

## Descripción

Este proyecto implementa un e-Commerce completo con backend en Node.js/Express y frontend en JavaScript vanilla. Incluye autenticación mediante JWT y persistencia de datos en PostgreSQL.

## Requisitos previos

Antes de comenzar, asegúrese de tener instalado lo siguiente en su sistema:

- **Node.js** (versión 16 o superior)
- **PostgreSQL** (versión 12 o superior)
- **npm** (incluido con Node.js)

## Configuración del proyecto

### 1. Instalación de dependencias

Abra una terminal en el directorio `backend/` del proyecto y ejecute:

```bash
npm install
```

Esto instalará las siguientes dependencias:
- `express`: Framework web para Node.js
- `pg`: Cliente PostgreSQL para Node.js
- `jsonwebtoken`: Generación y verificación de tokens JWT
- `dotenv`: Gestión de variables de entorno
- `cors`: Habilitación de CORS para peticiones del frontend

### 2. Configuración de la base de datos

#### 2.1. Crear la base de datos y ejecutar el script SQL

Abra una terminal y ejecute los siguientes comandos:

```bash
psql -U postgres -c "CREATE DATABASE ecommerce;"
psql -U postgres -d ecommerce -f backend/e-commerce.sql
```

Esto creará la base de datos y todas las tablas necesarias:

- `users`: Usuarios del sistema
- `cart`: Carritos de compra
- `cart_item`: Ítems individuales en cada carrito
- `category`: Categorías de productos
- `product`: Productos disponibles
- `order_detail`: Detalles de las órdenes (método de pago, envío, dirección)

#### 2.2. Crear un usuario de prueba

Ahora creamos un usuario para poder probar el login:

```bash
psql -U postgres -d ecommerce -c "INSERT INTO users (first_name, last_name, email, password, address, phone) VALUES ('Juan', 'Pérez', 'usuario@ejemplo.com', 'mipassword123', 'Av. Italia 1234', '091234567');"
```

Verifique que el usuario fue creado:

```bash
psql -U postgres -d ecommerce -c "SELECT * FROM users;"
```

### 3. Configuración de variables de entorno

El proyecto incluye un archivo de ejemplo `backend/.env.example`. Debe crear su propio archivo `.env` a partir de este:

```bash
cd backend
cp .env.example .env
```

Luego edite el archivo `.env` y ajuste la contraseña de PostgreSQL:

```env
PORT=3000
JWT_SECRET=dw-grupo2-315

DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tu_password_postgres    # <- Cambie esto por su contraseña
DB_NAME=ecommerce
DB_PORT=5432
```

## Ejecución del servidor

### Modo desarrollo (con reinicio automático)

```bash
npm run dev
```

Este comando utiliza `nodemon`, que reinicia automáticamente el servidor cuando detecta cambios en los archivos.

### Modo producción

```bash
npm start
```

El servidor se iniciará en `http://localhost:3000`.

Deberá ver en la consola:

```
Server running at http://localhost:3000
Database connected
```

## Verificación del funcionamiento

### 1. Verificar que el backend sirve los archivos JSON

Abra un navegador y acceda a:

```
http://localhost:3000/json/cats/cat.json
```

Debería ver el contenido del archivo JSON con las categorías.

### 2. Probar el endpoint de login

#### Opción A: Usando el navegador

1. Abra `http://localhost:3000/login`
2. Ingrese las credenciales del usuario creado en el paso anterior:
   - **Usuario:** `usuario@ejemplo.com`
   - **Contraseña:** `mipassword123`
3. Si el login es exitoso, será redirigido a la página principal

#### Opción B: Usando curl (PowerShell)

```powershell
curl -Method POST -Uri "http://localhost:3000/login" -Headers @{"Content-Type"="application/json"} -Body '{"username":"usuario@ejemplo.com","password":"mipassword123"}'
```

La respuesta debe incluir un token JWT:

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "Juan",
    "email": "usuario@ejemplo.com"
  }
}
```

### 3. Probar el flujo completo del carrito

1. **Inicie sesión** en `http://localhost:3000/login` con el usuario creado
2. **Navegue a una categoría** de productos (por ejemplo, Autos)
3. **Agregue productos al carrito** haciendo click en "Añadir al carrito"
4. **Acceda al carrito** mediante el ícono en el encabezado
5. **Complete los datos de compra:**
   - Seleccione un tipo de envío (Premium/Express/Standard)
   - Complete la dirección (todos los campos obligatorios)
   - Seleccione un método de pago (Débito/Crédito o Transferencia bancaria)
   - Complete los datos del método de pago seleccionado
6. **Haga click en "Finalizar compra"**
7. Si todo es correcto, verá un modal de confirmación y será redirigido al inicio

### 4. Verificar los datos en la base de datos

Conéctese a PostgreSQL:

```bash
psql -U postgres -d ecommerce
```

Ejecute las siguientes consultas para verificar que los datos se guardaron:

```sql
-- Ver los carritos del usuario
SELECT * FROM cart WHERE user_id = 1;

-- Ver los ítems del carrito más reciente
SELECT * FROM cart_item WHERE cart_id = (SELECT MAX(cart_id) FROM cart);

-- Ver los detalles de la orden más reciente
SELECT * FROM order_detail WHERE cart_id = (SELECT MAX(cart_id) FROM cart);
```

Debería ver:
- En `cart`: Un registro con `status='ordered'`
- En `cart_item`: Los productos que agregó al carrito con sus cantidades
- En `order_detail`: El método de pago, tipo de envío y dirección que ingresó

## Estructura del proyecto

```
final-dw-g2/
├── backend/
│   ├── config/
│   │   └── database.js          # Configuración de PostgreSQL
│   ├── middleware/
│   │   └── authMiddleware.js    # Middleware de verificación JWT
│   ├── routes/
│   │   └── auth.js              # Rutas de autenticación
│   ├── json/                    # Archivos JSON del proyecto
│   ├── .env                     # Variables de entorno
│   ├── e-commerce.sql           # Script de creación de la BD
│   ├── package.json             # Dependencias del proyecto
│   └── server.js                # Punto de entrada del servidor
├── css/                         # Estilos del frontend
├── js/                          # Scripts del frontend
├── img/                         # Imágenes
├── index.html                   # Página principal
├── login.html                   # Página de login
├── cart.html                    # Página del carrito
└── ... (otras páginas HTML)
```

## Endpoints disponibles

### Públicos (sin autenticación)

- `POST /login` - Autenticación de usuarios
- `GET /json/*` - Acceso a archivos JSON estáticos

### Protegidos (requieren token JWT)

- `POST /cart` - Guardar carrito en la base de datos
- `GET /api/*` - Endpoints de API (ejemplo)

## Solución de problemas comunes

### Error: "Database connection failed"

- Verifique que PostgreSQL esté ejecutándose
- Confirme que las credenciales en `.env` sean correctas
- Asegúrese de que la base de datos `ecommerce` exista

### Error: "Cannot find module"

- Ejecute `npm install` en el directorio `backend/`

### Error: "Port 3000 already in use"

- Cambie el valor de `PORT` en el archivo `.env`
- O detenga el proceso que está usando el puerto 3000

### El login no funciona

- Verifique que el usuario existe en la base de datos
- Confirme que el email y la contraseña sean correctos
- Revise la consola del servidor para ver mensajes de error

### Los datos no se guardan en la base de datos

- Verifique que el token JWT sea válido (no expirado)
- Confirme que todos los campos obligatorios estén completos
- Revise la consola del servidor para ver el detalle del error

## Notas importantes

1. **Seguridad:** Este es un proyecto educativo, así que las contraseñas están en texto plano para simplificar. Si algún día fuera un proyecto en producción, habría que hashear las contraseñas con bcrypt o similar.

2. **Token JWT:** Los tokens vencen a las 24 horas. Después de eso, hay que volver a loguearse.

3. **CORS:** El servidor acepta peticiones desde cualquier origen. Está configurado así para facilitar las pruebas durante el desarrollo.

4. **Variables de entorno:** El `.env` no está en el repositorio (solo `.env.example`). Cada uno debe crear su propio `.env` con sus credenciales locales. Si fuera un proyecto en producción, tampoco debería estar en el repo por temas de seguridad.
