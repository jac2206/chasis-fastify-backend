# Patrones de implementación

## Flujo HTTP

`Fastify controller plugin (schema + handler) → hooks → use case → port → adapter`.

Cada controller HTTP se tipa como `FastifyPluginAsyncZod` y define la ruta, su schema Zod/OpenAPI y un handler delgado. El handler asigna estado HTTP y llama el caso de uso con datos ya validados. El caso de uso aplica reglas y usa puertos. Los adaptadores implementan detalles técnicos. `controllers/v1/index.ts` solo agrupa plugins y aplica prefijos.

## Errores de negocio

Declara errores estables en `src/domain/errors/<context>/` con `code`, `message` y `statusCode`. Lánzalos mediante `DomainException`; el error handler global de Fastify formatea la respuesta. Para conflictos usa normalmente 409; para ausencia 404; para regla de negocio inválida 422. No uses `Error` genérico para una condición esperada.

## Puertos y adaptadores

El contrato describe la necesidad del dominio, por ejemplo `I<Aggregate>Repository`. La implementación debe vivir en `infraestructure/database/repositories` y mapear explícitamente entre persistencia y dominio. Para modelos Prisma, usa `src/infraestructure/database/prisma.ts` y el cliente generado en `src/generated/prisma/`. Las consultas SQL directas deben usar parámetros.

## Plugins y hooks

Los hooks y plugins Fastify transversales viven en `infraestructure/hooks` y `infraestructure/plugins`; el controller index vive bajo `infraestructure/controllers`. Deja `infraestructure/http` para clientes HTTP de salida. Plugins de tecnologias distintas a Fastify se ubican con su adaptador, por ejemplo Prisma bajo `infraestructure/database`.

## Awilix

El proyecto usa inyección clásica: los nombres de parámetros del constructor deben coincidir con las claves de `container.register`. Los handlers resuelven casos de uso desde el scope de la request; usa `.scoped()` para casos de uso y repositorios dependientes de petición, y `.singleton()` para clientes sin estado como logger y HTTP.

## HTTP y seguridad

- Rutas bajo `/chasis/v1`; health bajo `/chasis/health`; Swagger en `/docs`.
- Valida `body`, `params` y `query` con schemas Zod registrados en la ruta Fastify.
- Protege rutas con los hooks `authenticateJWT` y después `authorizeScopes([...])` cuando corresponda.
- Usa códigos HTTP explícitos y respuestas DTO, nunca hashes o campos internos.

## Prisma y migraciones

- Mantén los modelos en `prisma/models/*.prisma` y el generador/datasource en `prisma/schema.prisma`.
- Revisa `prisma.config.ts` antes de ejecutar comandos; allí se definen la ruta del schema, migraciones y `DATABASE_URL`.
- Después de cambiar un modelo ejecuta `npm run prisma:validate`, crea/aplica una migración con `npm run prisma:migrate -- --name <nombre>` y regenera con `npm run prisma:generate`.
- Versiona las migraciones de `prisma/migrations/`. No edites `src/generated/prisma/` manualmente.
- `prisma:reset` es únicamente para desarrollo y borra datos; nunca lo uses en producción.

