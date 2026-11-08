---
name: fastify-node
description: >
  Aplica las convenciones locales de Fastify 5 y TypeScript de este backend al
  crear o modificar plugins HTTP, hooks, composición del servidor o integración
  con Awilix. Úsala para cambios de infraestructura HTTP en este repositorio.
metadata:
  version: "1.0.0"
---

# Fastify en este backend

## Propósito

Implementar cambios HTTP con los patrones que ya usa este chasis: plugins Fastify tipados, validación Zod, casos de uso resueltos desde el scope de la petición y errores centralizados.

## Cuándo usarla

- Al crear o modificar controllers, plugins, hooks o el ensamblaje de Fastify.
- Al conectar una ruta con schemas Zod, Awilix, autenticación o autorización.
- Al cambiar el prefijo de una API o su registro por versión.

Para cambios solo de contrato OpenAPI, consulta [Swagger y OpenAPI](../swagger-openapi/SKILL.md). Para probar comportamiento HTTP, consulta [Vitest](../vitest-backend/SKILL.md).

## Evidencia del proyecto

- `src/server.ts` crea Fastify, configura los compiladores de `@fastify/type-provider-zod`, registra plugins transversales y monta los controllers con prefijos `/chasis` y `/chasis/v1`.
- `src/infraestructure/controllers/v1/index.ts` agrupa los plugins de la versión 1; cada controller declara endpoint, schema y handler.
- Los controllers usan `FastifyPluginAsyncZod` y resuelven casos de uso mediante `request.scopedContainer`.
- Los hooks transversales están en `src/infraestructure/hooks/`; los plugins Fastify transversales, en `src/infraestructure/plugins/`.
- El manejador global de errores se registra desde `src/infraestructure/hooks/error.hook.ts`.

## Procedimiento

1. Lee `.agents/AGENTS.md`, el controller o hook análogo y su prueba correspondiente antes de cambiar archivos.
2. Conserva el patrón de plugin Fastify. No agregues una capa de rutas que solo reenvíe a otro controller.
3. Para cada entrada HTTP, declara schemas Zod de `body`, `params` y `query` según aplique; declara también las respuestas del endpoint.
4. Mantén el handler delgado: obtiene dependencias del scope de la petición, pasa datos validados al caso de uso y traduce el resultado a una respuesta HTTP explícita.
5. Registra nuevos plugins en el punto de composición existente y respeta los prefijos definidos por el servidor.
6. Para rutas protegidas, usa los hooks de autenticación/autorización existentes y documenta el esquema de seguridad junto a la ruta.
7. Usa `DomainException` y los errores de dominio existentes para fallos previstos. No expongas detalles internos en respuestas.
8. Añade o actualiza pruebas HTTP con `createServer().inject()` para validar ruta, estado, cuerpo y límites relevantes.

## Reglas locales

- Mantén TypeScript estricto y no introduzcas `any`.
- No pongas reglas de negocio, SQL o acceso directo a Prisma en controllers.
- No muevas hooks Fastify a `infraestructure/http/`; esa carpeta contiene clientes HTTP de salida.
- No crees nuevos prefijos ni cambies contratos existentes sin seguir la especificación aplicable.
- No registres contraseñas, tokens, secretos ni información personal innecesaria.

## Verificación

- Ejecuta `npm run build` y `npm run test:run` para cambios HTTP normales.
- Confirma que `npm run check` no reporte problemas en los archivos modificados cuando la tarea incluya validación de estilo.
- Si cambia el contrato de una ruta, verifica también la documentación generada en `/docs/json` mediante una prueba o inspección ya disponible.
- No declares una verificación como ejecutada si no se corrió.
