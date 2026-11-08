# Backend Chasis Fastify Back

## Alcance

Este documento describe el comportamiento evidenciado por la implementación actual en TypeScript. El repositorio es un chasis reutilizable para backends Fastify e incluye flujos de ejemplo de `generic`, usuarios/autenticación, health e integración con Pokémon.

## Ejecución y puntos de entrada

- `src/main.ts` conecta Prisma con PostgreSQL antes de escuchar en `PORT` (por defecto `3000`). Por eso, aunque el controlador de health no consulta la base de datos, la aplicación no empieza a aceptar solicitudes si falla la conexión inicial. Desconecta Prisma durante `SIGINT` y `SIGTERM` y finaliza con código `1` si falla esa conexión.
- `src/server.ts` crea la aplicación Fastify, registra el scope Awilix por solicitud, Zod para validación/serialización, Swagger UI en `/docs` y los plugins `/chasis/health` y `/chasis/v1`.
- Las rutas desconocidas devuelven `{ "message": "Route not found", "code": 404 }`.

OpenAPI define el servidor como `http://localhost:3000`; las rutas publicadas incluyen el prefijo `/chasis`. La interfaz se sirve en `/docs` y el JSON en `/docs/json`.

## Arquitectura observada

El flujo de dependencias implementado es controller plugins HTTP → casos de uso de aplicación → interfaces/entidades/errores de dominio → repositorios/adaptadores de infraestructura. Awilix usa inyección clásica; `requestScopePlugin` adjunta un contenedor scoped a cada solicitud y los handlers resuelven desde allí los casos de uso registrados en `src/config/container.ts`.

```mermaid
flowchart LR
  CLIENTE[Cliente HTTP] --> APP[Fastify: plugins, hooks y DI]
  APP --> C[Controller plugins: endpoint + schema Zod]
  C --> Z[Validación Zod]
  Z -->|rutas protegidas| AUTH[Hooks JWT y scopes]
  AUTH --> H[Handler Fastify]
  Z -->|rutas sin autenticación| H
  H --> U[Casos de uso]
  U --> P[Puertos, entidades y errores de dominio]
  U --> PRISMA[UserPrismaRepository / ServiceClientPrismaRepository]
  PRISMA --> PG[(PostgreSQL)]
  U --> RAW[GenericRepository: pg Pool]
  RAW --> PG
  U --> EXT[Adaptador PokeApiAdapter + HttpClient]
  EXT --> POKEAPI[PokeAPI externa]
  AUTH --> JWT[JwtAuthService]
  U --> JWT
  APP --> DOCS[Swagger UI / OpenAPI]
```

Las etiquetas arquitectónicas de las guías del repositorio describen DDD/arquitectura hexagonal/Clean Architecture; el diagrama registra las relaciones confirmadas por imports y llamadas.

El HTML interactivo `docs/arquitectura.html` y sus recibos son un artefacto arquitectónico previo a esta migración, no la fuente vigente para la estructura HTTP. Para el estado Fastify, usa este documento y el código en `src/`.

Como ejemplo de uso del chasis, consulta la [arquitectura de referencia para recompensas y lealtad](architecture-reference/architecture.md). Es una propuesta separada del backend implementado y contiene vistas de componentes y alternativas de infraestructura AWS, Azure y Google Cloud.

## Índice de casos de uso de la API

### Health

- [Verificar salud](use-case/health-check.md) — `GET /chasis/health`

### Ejemplos genéricos

- [Consultar generic](use-case/get-generic.md) — `GET /chasis/v1/generic`
- [Crear generic](use-case/create-generic.md) — `POST /chasis/v1/generic`
- [Consultar generic por ID](use-case/get-generic-by-id.md) — `GET /chasis/v1/generic/:id`
- [Consultar Pokémon por nombre](use-case/get-pokemon-by-name.md) — `GET /chasis/v1/generic/pokemon/:name`
- [Actualizar generic](use-case/update-generic.md) — `PATCH /chasis/v1/generic/:id`

### Usuarios

- [Registrar usuario](use-case/register-user.md) — `POST /chasis/v1/users/register`
- [Iniciar sesión](use-case/login-user.md) — `POST /chasis/v1/auth/login`
- [Renovar tokens](use-case/refresh-tokens.md) — `POST /chasis/v1/auth/refresh`
- [Consultar usuario actual](use-case/get-current-user.md) — `GET /chasis/v1/users/me`
- [Listar usuarios](use-case/list-users.md) — `GET /chasis/v1/users`

### Clientes de servicio

- [Autenticación con credenciales de cliente](use-case/client-credentials.md) — `POST /chasis/v1/auth/client-credentials`
- [Crear cliente de servicio](use-case/create-service-client.md) — `POST /chasis/v1/auth/service-clients`
- [Rotar secreto de cliente](use-case/rotate-service-client-secret.md) — `POST /chasis/v1/auth/service-clients/:clientId/rotate-secret`
- [Deshabilitar cliente de servicio](use-case/disable-service-client.md) — `PATCH /chasis/v1/auth/service-clients/:clientId/disable`

## Autenticación y autorización

Los JWT se firman con HS256 usando `JWT_SECRET`, con valores predeterminados de `15m` para tokens de acceso y `30d` para tokens de renovación. `authenticateJWT` requiere `Authorization: Bearer <token>`, verifica el tipo de token y adjunta sus claims a la solicitud. `authorizeScopes` permite la solicitud cuando está presente cualquiera de los scopes requeridos. Las rutas de listado/usuario actual requieren `user`, la consulta genérica requiere `generic` y la administración de clientes requiere `service-clients:manage`.

Si no existe la variable de entorno, `JWT_SECRET` usa literalmente `secret`. La implementación no evidencia una validación obligatoria del secreto para producción.

## Validación y errores

Las rutas registran schemas Zod directamente en Fastify. Esto alimenta la validación, la inferencia de tipos, la serialización de respuestas y OpenAPI. Los datos inválidos en body, params o query devuelven HTTP `422` con `code: VALIDATION_ERROR`. Los JWT faltantes o inválidos devuelven HTTP `401`; los scopes ausentes o insuficientes devuelven `403/FORBIDDEN`.

`DomainException` es convertido por el error handler global a su estado HTTP y `{ code, message }`. Un JSON mal formado devuelve `400/INVALID_JSON`; los errores desconocidos devuelven `500/INTERNAL_SERVER_ERROR` sin detalles internos.

## Persistencia

Prisma 7 con `@prisma/adapter-pg` se conecta a PostgreSQL mediante `DATABASE_URL`. Los repositorios activos de usuarios y clientes de servicio usan modelos Prisma en el schema `test`. Los usuarios almacenan un hash bcrypt de la contraseña; los clientes de servicio almacenan un hash bcrypt del secreto, scopes y estado. `GenericRepository` usa un pool separado de `pg` y SQL parametrizado para `generics`, pero los casos de uso expuestos para crear/actualizar generic no lo llaman; solo la consulta por ID está conectada a ese repositorio.

El schema también define `addresses`, pero ninguna ruta o caso de uso actual lo utiliza. Las migraciones están en `prisma/migrations/`.

## Integración externa y logging

`GET /chasis/v1/generic/pokemon/:name` llama a `https://pokeapi.co/api/v2/pokemon/:name` mediante Axios, con timeout de 4 segundos, y transforma la respuesta a `name`, `height` y `weight`. Cualquier error del adaptador se convierte actualmente en `POKEMON_NOT_FOUND` con estado `404`.

Winston emite logs JSON en consola. Un hook Fastify registra método, ruta, código de respuesta y duración sin incluir query strings ni cuerpos; el cliente HTTP registra metadatos de solicitudes/respuestas y errores.

## Despliegue y verificación

El Dockerfile construye con Node 24, genera el cliente Prisma, compila TypeScript y ejecuta `dist/main.js` en el puerto `3000`. Docker Compose define los contenedores de la aplicación, PostgreSQL, Floci y SQS admin; no aplica migraciones automáticamente, que se ejecutan con `npm run prisma:deploy` cuando corresponda. El código actual no contiene clientes del AWS SDK ni consumidores de eventos/colas; por eso esos servicios de Compose son soporte de infraestructura y no integraciones de aplicación evidenciadas.

Las pruebas usan Vitest y `app.inject()` para HTTP; cubren rutas Fastify, validación, autenticación, scopes, errores, casos de uso, repositorios, JWT, cliente HTTP y adaptador de Pokémon. Los scripts incluyen `npm run build`, `npm run test:run` y comandos Prisma.

## Vacíos e inconsistencias de evidencia

- El controller de health devuelve una respuesta literal. `HealthService` está registrado en el contenedor, pero el controller no lo resuelve ni lo invoca.
- `GET /chasis/v1/users` devuelve un arreglo y OpenAPI documenta ese arreglo.
- `GET /chasis/v1/users/me` puede devolver `phone: null`; Zod refleja esa nulabilidad.
- Los flujos de creación y actualización de generic solo validan el nombre en la capa de aplicación y no persisten cambios. La consulta por ID puede devolver `200` con campos derivados de `null` cuando no existe un registro.
- Las respuestas de error de los endpoints se describen en OpenAPI con schemas compartidos.
