---
name: swagger-openapi
description: >
  Mantiene contratos OpenAPI de rutas Fastify sincronizados con los schemas Zod,
  respuestas y seguridad que implementa este backend. Úsala al cambiar contratos
  HTTP o la documentación Swagger.
metadata:
  version: "1.0.0"
---

# Swagger y OpenAPI en este backend

## Propósito

Documentar contratos HTTP desde los schemas registrados en las rutas Fastify, de modo que la validación, serialización y OpenAPI describan el mismo comportamiento.

## Cuándo usarla

- Al añadir o cambiar body, params, query, respuestas, estados HTTP o seguridad de una ruta.
- Al modificar tags, ejemplos o metadatos OpenAPI.
- Al cambiar el registro de `@fastify/swagger` o `@fastify/swagger-ui`.

Para crear la ruta o su integración Fastify, consulta [Fastify](../fastify-node/SKILL.md). Para probar el contrato HTTP, consulta [Vitest](../vitest-backend/SKILL.md).

## Evidencia del proyecto

- `src/server.ts` registra `@fastify/swagger` y `@fastify/swagger-ui`, configura `jsonSchemaTransform` y `jsonSchemaTransformObject`, y expone la UI en `/docs`.
- El JSON OpenAPI se sirve en `/docs/json`.
- Las rutas se definen en plugins Fastify tipados con `FastifyPluginAsyncZod`; sus schemas Zod se encuentran en `src/infraestructure/schemas/`.
- El esquema de seguridad `bearerAuth` está configurado en el servidor para tokens JWT.
- La prueba `test/infraestructure/http/server.fastify.spec.ts` comprueba la generación de OpenAPI y la presencia de rutas y seguridad.

## Procedimiento

1. Inspecciona la ruta existente, su schema Zod, el controlador, las pruebas HTTP y los documentos OpenAPI relacionados.
2. Define o actualiza los schemas de entrada y respuesta en `src/infraestructure/schemas/`; conserva los tipos y validaciones reales de la implementación.
3. Registra esos schemas en la ruta correspondiente junto con tags, respuestas HTTP y seguridad aplicable.
4. En rutas con JWT, declara `security: [{ bearerAuth: [] }]` y confirma que los hooks de autenticación y scopes realmente estén aplicados. La declaración OpenAPI por sí sola no protege una ruta.
5. Incluye respuestas de error compartidas cuando correspondan y comprueba que sus códigos y cuerpos coincidan con el manejador global.
6. Asegura que los schemas de respuesta reflejen exactamente el JSON enviado por el controller; nunca incluyas secretos, hashes o campos internos.
7. Actualiza o añade una prueba que consulte `/docs/json` y compruebe las rutas, respuestas o seguridad relevantes.
8. Si el alcance lo requiere, inspecciona `/docs` para comprobar que la UI renderiza el contrato actualizado.

## Reglas locales

- No mantengas una especificación OpenAPI manual paralela a los schemas Zod de las rutas.
- No declares respuestas, parámetros, permisos o errores que el endpoint no implemente.
- Los prefijos se componen al registrar plugins; verifica la ruta final bajo `/chasis` o `/chasis/v1`.
- Fastify usa `:id` en runtime y el transformador lo representa como `{id}` en OpenAPI; sigue la convención de la ruta existente.
- Ejemplos son opcionales: añádelos cuando ayuden a quien consume la API y estén respaldados por el contrato.

## Verificación

- Ejecuta `npm run build` y `npm run test:run` para los cambios afectados.
- Comprueba `/docs/json` por medio de la prueba HTTP existente o una inspección local solicitada.
- Revisa que las respuestas documentadas coincidan con los estados y cuerpos del controller.
- No declares una verificación como ejecutada si no se corrió.
