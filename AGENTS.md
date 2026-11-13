# Instrucciones para agentes

Este archivo es la entrada de instrucciones para el repositorio. Lee `.agents/AGENTS.md` antes de cambiar código o documentación; allí están las convenciones detalladas del backend.

## Orientación

Usa las skills instaladas en la plataforma cuando sean pertinentes a la tarea. Las skills locales de `.agents/skills/` complementan esas capacidades con convenciones específicas del repositorio.

Para una implementación de backend que requiera coordinar análisis, diseño, cambios y verificaciones, consulta también la definición portátil [`backend-engineer`](.agents/agents/backend-engineer/AGENT.md). Complementa estas instrucciones y las skills locales; no sustituye `.agents/AGENTS.md` ni registra o ejecuta automáticamente un subagente.

- Contexto y tecnologías: `.agents/context.md`.
- Arquitectura y patrones: `.agents/architecture/`.
- Implementación, seguridad y contratos OpenAPI: `.agents/instructions/`.
- Pruebas: `.agents/testing/`.
- Especificaciones de negocio: `.agents/specs/`.
- Flujos de integración y despliegue: `.agents/ci-cd/pipelines.md`.

## Verificación y límites

- Consulta los scripts vigentes en `package.json`; no inventes comandos.
- La CI configurada ejecuta pruebas con cobertura, generación de Prisma Client y compilación. Consulta `.agents/ci-cd/pipelines.md` para sus diferencias y condiciones.
- No ejecutes migraciones, reinicios de base de datos ni despliegues como parte de una verificación rutinaria.
- No leas ni modifiques `.env` ni expongas credenciales. No edites código generado en `src/generated/prisma/`.
- Antes de finalizar, resume los archivos modificados y las verificaciones realmente ejecutadas.
