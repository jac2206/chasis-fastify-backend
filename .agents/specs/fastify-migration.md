# Migración de plataforma HTTP a Fastify

## Estado

Implementado

## Objetivo y actor

Mantener el chasis reutilizable con los mismos contratos HTTP públicos, reemplazando Express por Fastify. Los consumidores de la API siguen usando los mismos endpoints bajo `/chasis` y el equipo de backend obtiene plugins, hooks, validación y documentación nativos de Fastify.

## Reglas de negocio

| ID | Regla | Error / resultado |
| --- | --- | --- |
| R-01 | La migración no modifica casos de uso, dominio ni persistencia Prisma; conserva rutas y payloads de negocio. | Mismos paths, entradas y respuestas exitosas. |
| R-02 | Las entradas `body`, `params` y `query` se validan con los schemas Zod existentes antes de invocar controladores. | `422` con `VALIDATION_ERROR`. |
| R-03 | Las rutas protegidas exigen un JWT de acceso válido y los scopes requeridos. | Token ausente/inválido: `401`; scopes ausentes o insuficientes: `403`. |
| R-04 | Las excepciones de dominio no filtran detalles internos. | `{ code, message }` y su `statusCode`. |
| R-05 | Cada petición recibe un scope Awilix que se libera al terminar la respuesta. | Dependencias scoped aisladas por petición. |

## Contrato HTTP

| Método y ruta | Auth/scope | Entrada | Éxito | Errores |
| --- | --- | --- | --- | --- |
| Rutas existentes bajo `/chasis/health` y `/chasis/v1/**` | Sin cambio | Sin cambio | Mismo status y JSON actual | `400`, `401`, `403`, `422`, errores de dominio y `500` sin detalles internos |
| `GET /docs` | Pública | N/A | Swagger UI generado por Fastify | `500` si falla el arranque |
| `GET /docs/json` | Pública | N/A | Documento OpenAPI generado por Fastify desde los schemas de ruta | `500` si falla el arranque |

## Criterios de aceptación

- Given una petición a `GET /chasis/health`, when se inyecta en el servidor Fastify, then responde `200` y `service: "chasis-fastify-back"`.
- Given un body inválido en una ruta validada, when Fastify procesa la petición, then responde `422` con `VALIDATION_ERROR` sin llegar al controlador.
- Given una ruta protegida sin Bearer token, when se ejecuta, then responde `401` con `UNAUTHORIZED`.
- Given una ruta protegida con un token válido sin scope suficiente, when se ejecuta, then responde `403` con `FORBIDDEN`.
- Given una `DomainException`, when un handler la propaga, then el error handler de Fastify responde con su código, mensaje y estado HTTP.
- Given el documento OpenAPI, when se solicita `/docs/json`, then contiene las rutas registradas y el esquema `bearerAuth`.

## Decisiones y fuera de alcance

- Zod sigue siendo la fuente de verdad de los contratos y se integra como compilador de validación/serialización de Fastify.
- Swagger se sirve con `@fastify/swagger` y `@fastify/swagger-ui`; se elimina el registro manual de `zod-to-openapi` y `swagger-ui-express`.
- Winston se conserva; no se sustituye por el logger por defecto de Fastify en esta migración.
- Se elimina Express, `awilix-express`, Supertest y sus tipos. Las pruebas HTTP usan `app.inject()`.
- No se realizan cambios de esquema ni migraciones de Prisma.
