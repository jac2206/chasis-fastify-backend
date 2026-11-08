# 🧱 Chasis Fastify Back

Backend base profesional construido con:

**Fastify 5 + TypeScript + Clean Architecture + DDD + Arquitectura Hexagonal + Prisma + PostgreSQL + Awilix + Zod + OpenAPI/Swagger + JWT + Winston + Vitest + Biome + Docker + Floci**

---

# 🏗️ Arquitectura

El proyecto combina **Clean Architecture, DDD y Arquitectura Hexagonal**, separando las reglas de negocio de los detalles de infraestructura.

Flujo general:

```text
HTTP
 ↓
Fastify server
 ↓
Controller plugin (endpoint + Zod schema)
 ↓
Validación Zod / hooks de ruta (cuando aplican)
 ↓
Handler del plugin → Caso de uso
 ↓
Reglas y puertos de dominio
 ↓
Adaptadores de infraestructura (Prisma, pg, HTTP)
 ↓
PostgreSQL / API externa
```

Los endpoints se declaran directamente en plugins controller Fastify; no existe una capa separada de archivos de rutas por recurso. El índice `src/infraestructure/controllers/v1/index.ts` agrupa plugins y aplica prefijos. Los hooks y plugins transversales viven en `infraestructure/hooks/` y `infraestructure/plugins/`.

### Estructura principal

```text
src/

├── application/
│   ├── dto/
│   └── use-cases/
├── config/
├── domain/
├── infraestructure/
│   ├── controllers/       # plugins Fastify; v1/index.ts los agrupa
│   ├── hooks/             # autenticación, errores
│   ├── plugins/           # scope y logging de solicitudes
│   ├── schemas/           # contratos Zod/OpenAPI
│   ├── database/          # Prisma, pool pg y repositorios
│   ├── adapters/          # integraciones externas
│   ├── http/http-client.ts
│   ├── logger/
│   ├── services/          # servicio de health aún no usado por el controller
│   └── security/
├── generated/prisma/      # Prisma Client generado; no editar
├── main.ts
└── server.ts
```

### Responsabilidad de cada capa

| Capa               | Responsabilidad                                     |
| ------------------ | --------------------------------------------------- |
| **Domain**         | Entidades, reglas y contratos                       |
| **Application**    | Casos de uso y DTOs                                 |
| **Infrastructure** | Fastify, Prisma, PostgreSQL, JWT, logger y adapters |
| **Config**         | Variables de entorno e inyección de dependencias    |

La regla principal es que el **Domain no depende de Infrastructure**.

---

# 📦 Instalación

Requisitos:

* Node.js 24+
* npm
* PostgreSQL
* Docker Desktop
* AWS CLI

Instalar dependencias:

```bash
npm install
```

### Compatibilidad entre sistemas

El repositorio usa UTF-8 y finales de línea LF para mantener el código consistente en Windows, macOS y Linux. Esta política está definida en `.gitattributes` y `.editorconfig`.

Si el repositorio ya tenía archivos con otro formato, normalízalos una sola vez:

```bash
git add --renormalize .
```

Configurar las variables de entorno:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
```

---

# 🗄️ Prisma + PostgreSQL

El proyecto utiliza **Prisma 7.10.0** para trabajar con PostgreSQL.

### Dependencias Prisma

```bash
npm install prisma@7.10.0 @prisma/client@7.10.0 @prisma/adapter-pg pg
```

Para TypeScript:

```bash
npm install -D @types/pg
```

### Configuración existente

```text
La configuración ya existe en `prisma.config.ts`; no es necesario ejecutar `npx prisma init`.
```

La estructura vigente de Prisma es:

```text
prisma/
├── schema.prisma
├── models/
└── migrations/

prisma.config.ts
```

### Generar Prisma Client

```bash
npm run prisma:generate
```

El cliente generado se encuentra en:

```text
src/generated/prisma/
```

---

# 🧬 Modelos Prisma

Los modelos se mantienen separados dentro de:

```text
prisma/

├── models/
├── migrations/
└── schema.prisma
```

Actualmente el esquema PostgreSQL utilizado por Prisma es:

```text
Database: la definida por `DATABASE_URL`
Schema: test
```

Estructura:

```text
test
├── users
├── addresses
├── service_clients
└── document_type (enum)
```

La configuración de Prisma se encuentra en:

```text
prisma.config.ts
```

---

# 🔄 Migraciones

Las migraciones permiten versionar los cambios realizados en la base de datos.

Los modelos se mantienen en `prisma/models/*.prisma` y `prisma/schema.prisma` es el punto de entrada. Después de cambiar un modelo, valida, crea la migración y regenera el cliente.

### Crear y aplicar una migración

```bash
npm run prisma:migrate -- --name nombre_migracion
```

### Crear sin aplicar

```bash
npm run prisma:migrate:create -- --name nombre_migracion
```

### Revisar estado

```bash
npm run prisma:status
```

### Producción

```bash
npm run prisma:deploy
```

```text
prisma:migrate → desarrollo
prisma:deploy  → producción
```

### Reset de desarrollo

```bash
npm run prisma:reset
```

**No utilizar en producción.**

### Prisma Studio

```bash
npm run prisma:studio
```

---

# ☁️ AWS Local con Floci

El proyecto utiliza **Floci** para simular servicios de AWS localmente.

El endpoint principal es:

```text
http://localhost:4566
```

El script `scripts/aws-init.sh` crea recursos locales de ejemplo en Floci:

* S3 bucket `chasis-local`
* SQS queue `chasis-local-queue`
* Secrets Manager secret `chasis-local`
* EventBridge bus `chasis-local`
* Parameter Store bajo `/chasis/local`
* DynamoDB table `chasis-users`

Estos recursos son para desarrollo local. El código actual no integra un AWS SDK ni consume esas colas o servicios.

Los recursos iniciales se crean automáticamente mediante:

```text
scripts/
└── aws-init.sh
```

### Inicializar el entorno

Levantar todos los servicios:

```bash
docker compose up -d
```

Verificar los contenedores:

```bash
docker compose ps
```

Ver los logs de Floci:

```bash
docker compose logs -f floci
```

### AWS CLI

Los comandos ejecutados desde el equipo local utilizan:

```bash
--endpoint-url=http://localhost:4566
```

Ejemplo:

```bash
aws --endpoint-url=http://localhost:4566 s3 ls
```

Consultar las tablas DynamoDB:

```bash
aws --endpoint-url=http://localhost:4566 dynamodb list-tables
```

Consultar las colas SQS:

```bash
aws --endpoint-url=http://localhost:4566 sqs list-queues
```

Consultar parámetros:

```bash
aws --endpoint-url=http://localhost:4566 ssm get-parameters-by-path \
  --path /chasis/local
```

### Recursos iniciales

El script `scripts/aws-init.sh` crea los recursos necesarios para el entorno local.

Si se requiere un nuevo recurso AWS:

1. Probarlo utilizando AWS CLI.
2. Agregar su creación al `aws-init.sh`.
3. Levantar nuevamente el entorno para validar la inicialización.
4. Si la aplicación necesita consumirlo, agregar el AWS SDK correspondiente.

Ejemplo:

```bash
aws --endpoint-url=http://localhost:4566 dynamodb list-tables
```

### AWS SDK

Cuando la aplicación necesite consumir un servicio AWS desde Node.js, se instala el SDK correspondiente.

Ejemplo para DynamoDB:

```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

El endpoint utilizado dentro de Docker es:

```text
http://floci:4566
```

Desde el equipo local:

```text
http://localhost:4566
```

---

# 🐳 Docker

El proyecto utiliza Docker para ejecutar la aplicación, PostgreSQL y los servicios AWS locales.

### Servicios

```text
Docker Compose
│
├── chasis-fastify-app
│   └── Fastify API :3000
│
├── chasis-fastify-db
│   └── PostgreSQL :5432
│
├── chasis-fastify-floci
│   └── AWS Local :4566
│
└── sqs-admin
    └── SQS UI :3999
```

Todos los servicios utilizan la red:

```text
chasis-network
```

### Levantar el entorno

```bash
docker compose up -d
```

Ver servicios:

```bash
docker compose ps
```

Detener servicios:

```bash
docker compose down
```

### URLs locales

API:

```text
http://localhost:3000
```

Floci:

```text
http://localhost:4566
```

SQS Admin:

```text
http://localhost:3999
```

### Comunicación entre contenedores

Desde el equipo local se utiliza:

```text
localhost
```

Por ejemplo:

```text
http://localhost:4566
```

Desde otro contenedor se utiliza el nombre del servicio:

```text
floci
```

Por ejemplo:

```text
http://floci:4566
```

Para PostgreSQL:

```text
postgresql://postgres:postgres@db:5432/test_db
```

---

# 🐳 Dockerfile

El proyecto utiliza un Dockerfile multi-stage.

### Build

Durante el build se instalan todas las dependencias, se genera Prisma Client y se compila TypeScript.

```dockerfile
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build


FROM node:24-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

Prisma genera el cliente en `src/generated/prisma/`. TypeScript lo compila junto con la aplicación a `dist/generated/prisma/`, que queda incluido al copiar `dist` a la imagen runtime. La imagen final copia `dist`; no necesita una segunda copia de `src/generated`.

El archivo de build se llama `Dockerfile` y Compose usa `build: .`. El `JWT_SECRET` del Compose actual es un valor de desarrollo; cámbialo antes de exponer el servicio fuera de un entorno local.

Compose inicia PostgreSQL, pero no ejecuta migraciones automáticamente. Aplica las migraciones con `npm run prisma:deploy` o el comando de desarrollo apropiado antes de usar una base vacía.

La dependencia `prisma` permanece en `devDependencies`, ya que solamente se necesita durante el proceso de generación y build.

---

# 💉 Inyección de Dependencias

El proyecto utiliza **Awilix** para resolver las dependencias.

Las implementaciones se registran en:

```text
src/config/container.ts
```

Flujo:

```text
Use Case
   ↓
Repository Interface
   ↓
Repository
   ↓
Prisma
```

Esto permite reemplazar implementaciones fácilmente y facilita las pruebas.

La implementación activa de usuarios es `UserPrismaRepository`, que usa `src/infraestructure/database/prisma.ts`. El módulo `generic` conserva `GenericRepository` basado en `pg` como ejemplo legacy; los nuevos módulos deben usar Prisma salvo que exista una decisión documentada.

---

# 🔐 Autenticación

La autenticación utiliza **JWT** y está separada del módulo de usuarios.

El módulo `auth` expone tres flujos:

| Endpoint | Uso | Respuesta |
| --- | --- | --- |
| `POST /chasis/v1/auth/login` | Login de usuario | Access token + refresh token |
| `POST /chasis/v1/auth/refresh` | Renovar sesión móvil | Nuevo access token + refresh token |
| `POST /chasis/v1/auth/client-credentials` | Server-to-server | Access token |
| `POST /chasis/v1/auth/service-clients` | Crear cliente técnico | Client ID + secreto (una vez) |
| `POST /chasis/v1/auth/service-clients/:clientId/rotate-secret` | Rotar secreto | Nuevo secreto (una vez) |
| `PATCH /chasis/v1/auth/service-clients/:clientId/disable` | Desactivar cliente | Estado |

Login de usuario:

```json
{
  "email": "usuario@email.com",
  "password": "Password1"
}
```

Renovación:

```json
{
  "refreshToken": "<refresh-token>"
}
```

Cliente técnico:

```json
{
  "clientId": "billing-service",
  "clientSecret": "<secret>"
}
```

Los secretos de clientes técnicos se almacenan como hash en
`test.service_clients`; nunca deben guardarse en texto plano. Sus scopes se
incluyen en el access token. Las operaciones administrativas requieren el
scope `service-clients:manage`; no se usa un scope genérico `ADM`.

Variables opcionales para la vigencia de tokens:

```env
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
```

La implementación se encuentra en:

```text
src/infraestructure/security/
src/application/use-cases/auth/
src/infraestructure/controllers/v1/auth.controller.ts
```

Las rutas protegidas utilizan:

```text
Authorization: Bearer <token>
```

---

# ✅ Validación

Los datos de entrada se validan utilizando **Zod**.

Los schemas se encuentran en:

```text
src/infraestructure/schemas/
```

Flujo:

```text
Request
 ↓
Fastify Zod schema validation
 ↓
Zod
 ↓
Controller
 ↓
Use Case
```

---

# ⚠️ Manejo de errores

Los errores se centralizan mediante el error handler global de Fastify.

```text
Use Case / Domain
       ↓
DomainException
       ↓
Fastify error handler
       ↓
HTTP Response
```

Los errores de dominio se encuentran en:

```text
src/domain/errors/

src/domain/exceptions/
```

---

# 🪵 Logging

El proyecto utiliza **Winston** para logging estructurado.

La implementación se encuentra en:

```text
src/infraestructure/logger/
```

---

# 📖 Swagger / OpenAPI

La API está documentada mediante `@fastify/swagger` y `@fastify/swagger-ui`, generados desde los schemas Zod de cada ruta.

La configuración de OpenAPI se registra en `src/server.ts`; cada controller declara schemas Zod junto a sus endpoints. La UI y el JSON se sirven desde `/docs` y `/docs/json`.

---

# 🧪 Testing

El proyecto utiliza **Vitest**.

```bash
npm run test
```

Ejecutar una sola vez:

```bash
npm run test:run
```

Coverage:

```bash
npm run test:coverage
```

---

# 🎨 Calidad de código

El proyecto utiliza **Biome**.

Formatear:

```bash
npm run format
```

Validar:

```bash
npm run check
```

---

# 🪝 Git Hooks

**Husky** y **Commitlint** automatizan las validaciones de Git.

Los commits utilizan **Conventional Commits**.

Ejemplos:

```text
feat: add user repository

fix: resolve database connection

test: add user tests

refactor: improve dependency injection

docs: update README

chore: update dependencies
```

---

# 🚀 Desarrollo

Iniciar el proyecto:

```bash
npm run dev
```

Compilar:

```bash
npm run build
```

Ejecutar la versión compilada:

```bash
npm start
```

---

# 📋 Scripts

### Aplicación

```bash
npm run dev
npm run build
npm start
```

### Prisma

```bash
npm run prisma:generate
npm run prisma:validate
npm run prisma:migrate
npm run prisma:migrate:create
npm run prisma:deploy
npm run prisma:status
npm run prisma:reset
npm run prisma:studio
```

También pueden ejecutarse directamente con Prisma:

```bash
npx prisma generate
npx prisma validate
npx prisma migrate dev
npx prisma migrate deploy
npx prisma migrate status
npx prisma migrate reset
npx prisma studio
```

### Testing

```bash
npm run test
npm run test:run
npm run test:coverage
```

### Calidad

```bash
npm run format
npm run check
```

### Docker

```bash
docker compose up -d
docker compose ps
docker compose logs -f
docker compose down
```

---

# 🔁 Flujo de trabajo

Para desarrollar una nueva funcionalidad:

```text
Especificación SDD (`.agents/specs/`)
      ↓
Criterios de aceptación y pruebas
      ↓
Dominio / puertos
      ↓
Caso de uso de aplicación
      ↓
Adaptador de infraestructura
      ↓
Plugin controller Fastify (schema Zod + endpoint + handler)
```

Los cambios de negocio empiezan con una especificación en `.agents/specs/`, siguiendo `spec.template.md`. Define criterios verificables y pruebas antes de implementar; actualiza OpenAPI y la documentación del caso de uso con el comportamiento que realmente quedó. Para cambios exclusivamente técnicos o documentales, registra la decisión y evidencia sin inventar reglas de negocio.

Si requiere cambios en PostgreSQL:

```text
Modificar modelo Prisma
        ↓
prisma:validate
        ↓
prisma:migrate
        ↓
prisma:generate
        ↓
Tests
        ↓
Build
```

Si requiere un nuevo servicio AWS local:

```text
AWS CLI
   ↓
Probar recurso en Floci
   ↓
Agregar al aws-init.sh
   ↓
Validar con AWS CLI
   ↓
Instalar AWS SDK
   ↓
Implementar Adapter / Repository
   ↓
Use Case
```

En producción:

```text
Pull request a develop/master
  → pruebas → build → SonarCloud

Push a master
  → pruebas → build → SonarCloud → despliegue a Railway
```

GitHub Actions y Azure Pipelines generan Prisma Client en cada job limpio. Ninguno ejecuta `prisma:deploy`: las migraciones se aplican explícitamente como paso operativo antes de desplegar una versión que las requiera. El despliegue de Railway se ejecuta al hacer push a `master` y requiere `RAILWAY_TOKEN`; SonarCloud requiere `TOKEN_SONAR`.

---

# 🏁 Objetivo

Este proyecto funciona como un **chasis reutilizable para APIs profesionales en Node.js**, proporcionando desde el inicio:

* Clean Architecture
* DDD
* Arquitectura Hexagonal
* Dependency Injection
* Repository Pattern
* Prisma + PostgreSQL
* JWT
* Zod
* Swagger/OpenAPI
* Winston
* Vitest
* Biome
* Husky
* Commitlint
* Migraciones versionadas
* Docker
* Floci para AWS local

La idea es que un nuevo proyecto pueda comenzar sobre esta estructura sin tener que configurar nuevamente toda la infraestructura base.
