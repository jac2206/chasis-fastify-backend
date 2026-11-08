# Contexto del chasis

## Propósito

API base reutilizable para distintos dominios de negocio. El código actual contiene módulos de ejemplo `generic`, usuarios/autenticación, health y un adaptador externo; los módulos del producto se agregan siguiendo las convenciones de este chasis.

## Stack real

| Área | Decisión actual |
| --- | --- |
| Runtime | Node.js + TypeScript 5, modo estricto |
| HTTP | Fastify 5; prefijo `/chasis`; versión `/v1` |
| DI | Awilix, `InjectionMode.CLASSIC`, scope por petición |
| Persistencia | Prisma 7.10.0 con `@prisma/adapter-pg` sobre PostgreSQL; el módulo `generic` conserva un repositorio legacy basado en `pg` |
| Validación y docs | Zod + `@fastify/type-provider-zod`; Swagger UI en `/docs` |
| Seguridad | JWT y scopes mediante hooks Fastify |
| Observabilidad | Winston |
| Pruebas | Vitest, `app.inject()`, cobertura V8 y Stryker |
| Compatibilidad | UTF-8 y finales de línea LF definidos por `.gitattributes` y `.editorconfig` |

## Árbol de código

```text
src/
  domain/           Entidades, errores, excepciones y puertos
  application/      DTOs y casos de uso
  infraestructure/  Adaptadores agrupados por limite tecnico
    adapters/       Integraciones externas
    controllers/    Plugins Fastify HTTP (endpoints + handlers), indice por version
    hooks/          Hooks Fastify transversales
    plugins/        Plugins Fastify transversales
    http/           Cliente HTTP de salida
    database/       Cliente Prisma, pool legacy, plugins de persistencia y repositorios
    logger/         Winston
    schemas/        Contratos Zod/OpenAPI
    security/       Adaptadores de autenticación JWT
    services/       Servicios técnicos aún no agrupados en otro adaptador
  config/           Entorno y composición Awilix
  generated/prisma/ Cliente Prisma generado; no editar manualmente
  server.ts         Ensamblaje de Fastify
  main.ts           Bootstrap y apagado
test/               Espejo de pruebas por capa
```

## Convenciones vigentes

- Nombres de archivos: `kebab-case`, con sufijos `.entity.ts`, `.usecase.ts`, `.interface.ts`, `.repository.ts`, `.controller.ts`, `.schema.ts` y `.spec.ts`.
- Los casos de uso exponen `execute(...)` y sus contratos están en `src/domain/interfaces/use-cases/`.
- Los repositorios reciben/devuelven entidades de dominio, no DTOs HTTP.
- `UserPrismaRepository` es la implementación activa de usuarios y usa `src/infraestructure/database/prisma.ts`; `GenericRepository` es un ejemplo legacy basado en `pg`.
- El esquema Prisma se compone desde `prisma/schema.prisma` y `prisma/models/*.prisma`, con migraciones en `prisma/migrations/` y configuración en `prisma.config.ts`.
- El error handler global convierte `DomainException` a `{ code, message }`; la validación Zod responde 422 con `VALIDATION_ERROR`.
- Las rutas Fastify registran schemas Zod para validación, serialización y OpenAPI.
- Cada controller HTTP es un plugin `FastifyPluginAsyncZod`; `controllers/v1/index.ts` solo agrupa controllers por version. Hooks/plugins Fastify viven en sus directorios raiz; plugins no Fastify pertenecen a su adaptador tecnico.

## Límites y decisiones pendientes

- Las reglas del producto no forman parte del chasis: cada agregado nuevo debe tener una especificación antes de implementarse.
- No asumir unidades, fórmulas, vigencias, idempotencia ni políticas de reverso sin especificación aprobada.
- `JWT_SECRET` y `DATABASE_URL` son obligatorios: la aplicación falla al iniciar si falta alguno o está vacío; no hay fallback para `JWT_SECRET`.

