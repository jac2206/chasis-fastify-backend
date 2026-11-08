# Instrucciones de Swagger y contratos HTTP

OpenAPI se genera en runtime por `@fastify/swagger` desde schemas Zod registrados en las rutas Fastify. La UI se sirve en `/docs` y el JSON en `/docs/json`.

- Define request, params, query y response schemas en `src/infraestructure/schemas/`.
- Añade ejemplos en metadatos Zod cuando ayuden al consumidor.
- Registra rutas dentro de plugins, con `schema` que incluya tags, entradas, respuestas y seguridad.
- Los prefijos Fastify forman parte de la ruta OpenAPI; conserva los parámetros con sintaxis `:id` en runtime (Fastify los transforma a `{id}` en OpenAPI).
- Las rutas con JWT deben declarar `security: [{ bearerAuth: [] }]` y aplicar los hooks reales.
- Documenta las respuestas de éxito y errores comunes mediante schemas de respuesta de ruta.
- Confirma que los schemas de respuesta reflejen exactamente el JSON de los controladores y no revelen secretos.
- Revisa manualmente `/docs` al añadir o cambiar endpoints.

