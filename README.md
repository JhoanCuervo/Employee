# Employee & Leave API

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white)
![Webpack](https://img.shields.io/badge/Webpack-8DD6F9?logo=webpack&logoColor=black)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?logo=googlesheets&logoColor=white)

API HTTP para administrar empleados y solicitudes de permiso, construida con **Google Apps Script**, **TypeScript**, **Webpack** y **Google Sheets** como base de datos mediante **ORMN**.

El proyecto está pensado como demo backend de portafolio: incluye CRUD, relaciones entre tablas, validaciones, manejo de errores, colección de Postman y despliegue real.

> **Demo pública con datos ficticios.** No se debe usar con información real o sensible.

## Demo

| Recurso | Enlace |
| --- | --- |
| API desplegada | [Abrir endpoint](https://script.google.com/macros/s/AKfycbwkN2EvivHVhBzhHDTF7FuZPQfPy3p9xWFdKUsVeIYKVg7DeYTf52zGhNcsmPr-7mPJ/exec) |
| Código en Apps Script (solo lectura) | [Ver proyecto](https://script.google.com/u/0/home/projects/1w_I19cg1VdDx1MQ9v0XtdQPBUrxiPUAjE2MfZjjXN6ptYIiav3nbPPIV/edit) |
| Base de datos (Google Sheet) | [Ver hoja](https://docs.google.com/spreadsheets/d/1ryIXX7BHizUcqVQPnQqLT-0CPy8mL2S2M5FMWmS5TL8/edit?usp=sharing) |
| Colección Postman | [`API.postman_collection.json`](./API.postman_collection.json) |

El proyecto de Apps Script está en modo **solo lectura** y contiene únicamente `server/code.js`, el bundle empaquetado y minificado que genera Webpack. Así se reduce el tamaño y el tiempo de carga, y no se publica el código fuente TypeScript original.

### Alcance de la demo

Esta API es una **demo de portafolio** y no está pensada para producción:

- El Web App se publica con `executeAs: USER_DEPLOYING` y acceso `ANYONE_ANONYMOUS`: cualquiera que tenga la URL puede leer, crear, editar y eliminar registros de la hoja.
- No tiene autenticación ni autorización. Es una decisión deliberada para que se pueda probar sin credenciales.
- Los datos son ficticios. No cargues información real o sensible.

Para un entorno real haría falta autenticación, una base de datos separada de la demo y permisos más restrictivos en el Web App.

## Funcionalidades

- CRUD de empleados y solicitudes de permiso.
- Consulta de solicitudes por empleado (`employeeId`).
- Respuestas con datos relacionados: cargo, departamento, líder, empleado, revisor y tipo de permiso.
- Validación de campos, fechas, teléfonos y tipos de contrato.
- Generación automática de IDs y estado inicial `PENDING` en solicitudes.
- Aprobación o rechazo de solicitudes pendientes (`PENDING → APPROVED/REJECTED`).
- Cambio de estado de empleados (`ACTIVE`, `RETIRED` u `ON_LEAVE`).
- Fechas normalizadas a `YYYY-MM-DD`.
- Respuestas JSON uniformes con `success`, `data`, `error`, `code`, `httpStatus` y `field`.

## Stack

- TypeScript estricto.
- Google Apps Script como runtime.
- Webpack + `ts-loader` + `gas-webpack-plugin`.
- Google Sheets como almacenamiento.
- ORMN v7 como capa de acceso a las hojas.
- ESLint y clasp.

## Arquitectura

```text
Index.ts (doGet / doPost)
        │
        ▼
Router.ts
        │
        ├── EmployeeController ──► EmployeeService ──► EmployeeRepository ─┐
        │                                                                  │
        └── LeaveRequestController ─► LeaveRequestService ─► LeaveRequestRepository
                                                                           │
                                                                           ▼
                                                                  ORMN ──► Google Sheets
```

Capas:

| Capa | Responsabilidad |
| --- | --- |
| `Index.ts` | Puntos de entrada `doGet` y `doPost`. |
| `routes/` | Lee `path`, `id` y `action`; delega al controlador. |
| `controllers/` | Recibe la operación y convierte “no encontrado” en error. |
| `services/` | Reglas de negocio, validaciones y armado de relaciones. |
| `repositories/` | Acceso a las tablas mediante ORMN. |
| `types/` | Contratos TypeScript. |
| `utils/` | Validadores y formateadores reutilizables. |

```text
src/
  controllers/   servicios HTTP
  services/      reglas de negocio
  repositories/  acceso a datos
  routes/        enrutamiento
  types/         contratos TypeScript
  utils/         validadores y formateadores
server/          configuración y bundle generado
```

## API

URL base:

```text
https://script.google.com/macros/s/AKfycbwkN2EvivHVhBzhHDTF7FuZPQfPy3p9xWFdKUsVeIYKVg7DeYTf52zGhNcsmPr-7mPJ/exec
```

Las lecturas usan `GET`; las escrituras usan `POST` con `action=create|update|delete|changeStatus`. Todos los `POST` requieren `Content-Type: application/json`. En la tabla, **Parámetros** son los de la URL y **Cuerpo** es el JSON que se envía en el `POST`.

| Operación | Método | Parámetros | Cuerpo |
| --- | --- | --- | --- |
| Listar empleados | `GET` | `path=employees` | — |
| Obtener empleado | `GET` | `path=employees&id={id}` | — |
| Crear empleado | `POST` | `path=employees&action=create` | `firstName`, `lastName`, `email`, `phone`, `hireDate`, `employmentType`, `positionId` (opcional) |
| Actualizar empleado | `POST` | `path=employees&action=update` | `id` + campos a actualizar |
| Cambiar estado de empleado | `POST` | `path=employees&action=changeStatus` | `id`, `status` (`ACTIVE`, `RETIRED` u `ON_LEAVE`) |
| Eliminar empleado | `POST` | `path=employees&action=delete` | `id` |
| Listar solicitudes | `GET` | `path=leaveRequests` | — |
| Obtener solicitud | `GET` | `path=leaveRequests&id={id}` | — |
| Listar por empleado | `GET` | `path=leaveRequests&employeeId={employeeId}` | — |
| Crear solicitud | `POST` | `path=leaveRequests&action=create` | `employeeId`, `leaveTypeId`, `startDate`, `endDate`, `daysRequested`, `reason`, `requestedAt`, `reviewedBy` (opcional) |
| Actualizar solicitud | `POST` | `path=leaveRequests&action=update` | `id` + campos a actualizar |
| Cambiar estado de solicitud | `POST` | `path=leaveRequests&action=changeStatus` | `id`, `status` (`APPROVED` o `REJECTED`), `reviewedBy` (opcional) |
| Eliminar solicitud | `POST` | `path=leaveRequests&action=delete` | `id` |

Las acciones `update`, `delete` y `changeStatus` requieren el `id` **exclusivamente en el cuerpo JSON**. Si llega en la URL, responden `400` con `code: "BAD_REQUEST"` y `field: "id"`. Las lecturas por `id` usan `GET` y lo reciben en la URL: si el `id` llega vacío responden `400`, y si no existe, `404`. Las acciones de escritura solo se aceptan por `POST`; por `GET` responden `405`.

### Formato de respuesta

Éxito:

```json
{
  "success": true,
  "data": { }
}
```

Error:

```json
{
  "success": false,
  "httpStatus": 404,
  "code": "NOT_FOUND",
  "error": "Empleado no encontrado"
}
```

Error de validación:

```json
{
  "success": false,
  "httpStatus": 400,
  "code": "VALIDATION_ERROR",
  "error": "El teléfono es obligatorio y debe enviarse como número de 10 dígitos",
  "field": "phone"
}
```

Apps Script no permite cambiar el status HTTP de la respuesta (siempre es `200`), así que el status lógico viaja en `httpStatus` y el cliente debe interpretarlo junto con `code`.

| code | httpStatus | Cuándo |
| --- | --- | --- |
| `VALIDATION_ERROR` | `400` | Un campo no cumple las reglas; `field` indica cuál. |
| `BAD_REQUEST` | `400` | JSON inválido, falta el `id`, `id`/`status` en la URL o parámetros ambiguos. |
| `METHOD_NOT_ALLOWED` | `405` | Una acción de escritura enviada por `GET`. |
| `NOT_FOUND` | `404` | Empleado, solicitud o ruta inexistente. |
| `CONFLICT` | `409` | Correo duplicado o transición de estado inválida. |
| `UNSUPPORTED_MEDIA_TYPE` | `415` | `POST` sin `Content-Type: application/json`. |
| `INTERNAL_ERROR` | `500` | Error no controlado. |

### Cambiar estado

La acción `changeStatus` de solicitudes solo se permite cuando la solicitud está en `PENDING` y recibe todo el payload en el cuerpo:

```http
POST /exec?path=leaveRequests&action=changeStatus
Content-Type: application/json
```

```json
{
  "id": "LR-...",
  "status": "APPROVED",
  "reviewedBy": "EMP-..."
}
```

Para empleados acepta `ACTIVE`, `RETIRED` u `ON_LEAVE` y solo requiere `id` y `status`:

```http
POST /exec?path=employees&action=changeStatus
Content-Type: application/json
```

```json
{
  "id": "EMP-...",
  "status": "ON_LEAVE"
}
```

Eliminar responde `data: { "id": "EMP-...", "deleted": true }`. Si el registro no existe, la API responde `404` con `code: "NOT_FOUND"` en lugar de `data: false`.

### Ejemplo

```http
POST /exec?path=leaveRequests&action=create
Content-Type: application/json
```

```json
{
  "employeeId": "EMP-...",
  "leaveTypeId": "LT-...",
  "startDate": "2026-11-09",
  "endDate": "2026-11-13",
  "daysRequested": 5,
  "reason": "Vacaciones familiares",
  "reviewedBy": "EMP-...",
  "requestedAt": "2026-10-19"
}
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "id": "LR-...",
    "status": "PENDING",
    "employee": { "name": "Ana Gómez", "email": "...", "phone": "..." },
    "reviewer": { "name": "Carlos Ruiz", "email": "...", "phone": "..." },
    "name": "Vacaciones",
    "description": "Descanso remunerado"
  }
}
```

Los detalles completos de cada endpoint y sus validaciones están en la colección de Postman.

## Modelo de datos

- **Employees:** datos personales, contacto, contrato, estado y cargo.
- **LeaveRequests:** empleado, tipo de permiso, fechas, días, motivo, estado y revisor.
- **LeaveTypes:** nombre y descripción del tipo de permiso. No tiene API pública; se usa para completar las solicitudes.
- **Positions / Departments:** cargo, departamento y líder.

## Desarrollo local

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

| Comando | Descripción |
| --- | --- |
| `npm run typecheck` | Verifica tipos. |
| `npm run lint` | Ejecuta ESLint. |
| `npm run build` | Genera `server/code.js`. |
| `npm run push` | Compila y publica en Apps Script con clasp. |

## Despliegue

1. Instala y autentica [clasp](https://github.com/google/clasp).
2. Copia `.clasp.example.json` a `.clasp.json` en la raíz.
3. Reemplaza `scriptId` por el ID de tu proyecto de Apps Script.
4. Ejecuta `npm run push`.
5. Publica una nueva versión del Web App.

`.clasp.json` y `.env` están en `.gitignore`.

## Decisiones técnicas

- Google Apps Script + Sheets permiten publicar una API funcional sin infraestructura ni costo inicial.
- ORMN mantiene los repositorios enfocados en el dominio.
- La arquitectura por capas separa transporte, negocio y persistencia.
- TypeScript estricto mantiene contratos claros entre capas.
- Webpack genera un único bundle minificado para Apps Script.

## Licencia

ISC.
