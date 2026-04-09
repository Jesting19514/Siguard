# Siguard

## About
**Siguard** es una aplicación de escritorio para el control de documentos mediante notificaiones y semaforos de prioridad de guarderias subrrogadas. Está construida con **Electron** para la interfaz de usuario y un **backend en Express** con persistencia en **MongoDB**, todo dentro del mismo proyecto.

El flujo principal permite autenticación por roles (administrador y usuario gerente), gestión de guarderías y manejo de documentos asociados.

---

## Descripción
El sistema inicia como aplicación de escritorio y, al mismo tiempo, levanta un servidor backend local. Esto permite trabajar con una arquitectura organizada por capas:

- **Frontend (Electron):** vistas HTML, estilos CSS y scripts de interacción.
- **Backend (Express):** API REST para autenticación, guarderías y documentos.
- **Base de datos (MongoDB):** almacenamiento de usuarios, guarderías y documentos.

Además, el backend incorpora:

- Cifrado de campos sensibles de guarderías.
- Hash seguro de contraseñas para usuarios.
- Datos iniciales (bootstrap) para facilitar el primer arranque.

---

## Tecnologías
Estas son las tecnologías principales del proyecto:

- **Node.js**
- **Electron**
- **Express**
- **MongoDB (driver oficial de Node.js)**
- **dotenv**
- **electron-builder**

---

## Features
Funcionalidades destacadas:

- Inicio de sesión con control por roles.
- Creación de usuario gerente al registrar una nueva guardería.
- CRUD de guarderías (crear, consultar, actualizar y eliminar).
- CRUD básico de documentos con validación de fechas.
- Cifrado de datos sensibles (`razon_social`, `num_guarderia`) en base de datos.
- Hash de contraseñas con `scrypt`.
- Notificaciones del sistema desde Electron.

---

## Proceso
Proceso general de funcionamiento:

1. **Arranque de la app:** Electron inicia y levanta el backend local.
2. **Conexión a MongoDB:** el backend valida variables de entorno y establece conexión.
3. **Bootstrap inicial:** se crean usuario admin y guardería de prueba si no existen.
4. **Autenticación:** el usuario inicia sesión desde la vista de login.
5. **Navegación por rol:**
   - Rol admin → menú administrativo.
   - Rol gerente → menú de usuario asociado a su guardería.
6. **Operaciones de negocio:** consumo de endpoints para guarderías y documentos.

---

## Como iniciar el proyecto
### 1) Clonar e instalar dependencias
```bash
git clone <URL_DEL_REPOSITORIO>
cd IndieCodeV3
npm install
```

### 2) Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto con, al menos:

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=siguard
BACKEND_PORT=3000
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=Admin123*
DATA_ENCRYPTION_KEY=tu_clave_segura
```

### 3) Ejecutar en desarrollo
```bash
npm start
```

### 4) Comandos disponibles
```bash
npm test
npm run dist
```

- `npm start`: ejecuta la aplicación Electron y backend local.
- `npm test`: validación básica definida en el proyecto.
- `npm run dist`: genera build instalable con `electron-builder`.

---

## Preview
Vista general esperada del flujo:

- Pantalla de login.
 ![Login](./assets/images/login.png)
- Menú principal de administrador.
 ![Admin](./assets/images/admin.png)
- Menú principal de usuario gerente.
 ![User](./assets/images/user.png)
- Gestión de guarderías y documentos.
 ![Documents](./assets/images/documents.png)


