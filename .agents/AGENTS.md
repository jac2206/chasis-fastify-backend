# Guía de agentes — Chasis Fastify Back

Este repositorio es un chasis reutilizable para backends. Usa TypeScript estricto, Fastify 5, DDD, arquitectura hexagonal, Awilix, Prisma 7 sobre PostgreSQL, Zod/OpenAPI, JWT, Winston, Vitest, Biome, Docker y Floci.

## Orden obligatorio de trabajo (SDD)

1. Lee `README.md`, `.agents/context.md`, la arquitectura y el patrón aplicable.
2. Para cambios de negocio, crea o actualiza primero una especificación en `.agents/specs/`.
3. Define el comportamiento verificable: reglas, casos límite, contrato HTTP y errores.
4. Escribe o actualiza las pruebas que demuestren la especificación.
5. Implementa de dentro hacia fuera: dominio → aplicación → infraestructura → composición HTTP.
6. Si cambia persistencia Prisma, actualiza modelo, migración y cliente generado mediante los comandos documentados.
7. Actualiza OpenAPI en el schema de la ruta Fastify y ejecuta las verificaciones requeridas.

No inventes reglas de negocio, estados, vigencias, cálculos, límites ni reversos: documenta la decisión en la especificación y solicita definición si cambia el negocio.

## Reglas no negociables

- `domain` no importa Fastify, `pg`, Zod, Awilix, Axios, Winston ni variables de entorno.
- Los puertos pertenecen al dominio; sus implementaciones pertenecen a infraestructura.
- Un caso de uso orquesta una intención de negocio y depende de interfaces, nunca de repositorios concretos.
- Las entidades protegen invariantes; los DTOs exponen datos de entrada/salida, no entidades ni filas SQL.
- Los controladores HTTP son plugins Fastify por recurso: declaran endpoint, schema Zod y handler delgado; el handler obtiene el caso de uso, pasa datos validados y fija el estado HTTP. No crees un archivo de rutas por recurso que solo reenvie a otro controller.
- Todas las rutas públicas se registran como plugins Fastify con schemas Zod para mantener OpenAPI sincronizado. Al modernizar rutas existentes, llévalas a este patrón.
- Conserva `infraestructure/controllers/v1/index.ts` como indice para agrupar y montar controllers por version. Los controllers, hooks Fastify y plugins Fastify transversales viven directamente bajo `infraestructure/controllers`, `infraestructure/hooks` e `infraestructure/plugins`; deja `infraestructure/http` para clientes HTTP. Plugins de otras tecnologias van con su adaptador (por ejemplo, persistencia en `infraestructure/database`).
- Usa `DomainErrors` + `DomainException` para errores previstos. No filtres detalles de SQL, tokens, hashes ni errores internos.
- Obtén dependencias del contenedor por el nombre acordado y registra cualquier dependencia nueva en `src/config/container.ts`.
- Conserva el directorio existente `src/infraestructure` (incluida su ortografía) para no introducir árboles paralelos.
- Respeta `.gitattributes` y `.editorconfig`: usa UTF-8, finales de línea LF y no conviertas archivos a CRLF manualmente.
- No uses `any` en código nuevo; tipa entradas, resultados, errores y `FastifyRequest` enriquecidos.
- Los modelos Prisma viven en `prisma/models/`; `src/generated/prisma/` es generado y no se edita manualmente.
- Los repositorios Prisma mapean explícitamente entre modelos Prisma y entidades de dominio. Las consultas SQL directas deben parametrizarse.
- Nunca registres contraseñas, JWTs, secretos, PII innecesaria ni el contenido completo de errores externos.

## Comandos de verificación

```bash
npm run build
npm run test:run
npm run test:coverage
npm run mutation
npm run prisma:validate
npm run prisma:generate
```

Para cambios normales, los comandos locales mínimos son `npm run build` y `npm run test:run`. Si cambia Prisma, valida y regenera el cliente según corresponda. `npm run test:coverage` es el comando usado por las pipelines. `npm run check` ejecuta Biome; la pipeline Azure lo incluye y GitHub Actions no. Revisa `.agents/ci-cd/pipelines.md` antes de describir los controles automatizados. No ejecutes migraciones, `prisma:reset` ni despliegues sin una solicitud explícita.

## Lectura dirigida

Además de las skills locales enlazadas abajo, consulta y usa las skills instaladas en la plataforma cuando aporten procedimientos útiles para la tarea.
- Definición portátil de ingeniería backend: `.agents/agents/backend-engineer/AGENT.md`. Su lectura no registra ni activa automáticamente un subagente.
- Contexto del repositorio: `.agents/context.md`
- Diseño de capas: `.agents/architecture/backend.architecture.md`
- Patrones concretos: `.agents/architecture/backend.patterns.md`
- Reglas de implementación: `.agents/instructions/backend.instructions.md`
- Contratos OpenAPI: `.agents/instructions/swagger.instructions.md`
- Pruebas: `.agents/testing/strategy.md` y `.agents/testing/patterns.md`
- Skills locales: `.agents/skills/fastify-node/SKILL.md`, `.agents/skills/swagger-openapi/SKILL.md` y `.agents/skills/vitest-backend/SKILL.md`. Úsalas para cambios en esas áreas; siguen las instrucciones generales de este archivo.
- Especificaciones de negocio: `.agents/specs/`
- Integración y despliegue: `.agents/ci-cd/pipelines.md`.
