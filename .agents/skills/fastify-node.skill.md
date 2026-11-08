# Skill: Fastify + Node + TypeScript

Usa plugins Fastify para agrupar endpoints y hooks para validación transversal, autenticación, autorización, logging y errores. Registra schemas Zod en cada controller plugin para inferencia de tipos, validación, serialización de respuestas y OpenAPI. Mantén controllers en `infraestructure/controllers`, hooks en `infraestructure/hooks` y plugins en `infraestructure/plugins`; `infraestructure/http/` queda para clientes HTTP. Mantén TypeScript estricto y evita `any`.
