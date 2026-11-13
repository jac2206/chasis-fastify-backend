# Definiciones de agentes

- [`backend-engineer`](backend-engineer/AGENT.md): definición portátil para coordinar una tarea acotada de implementación backend y seleccionar las capacidades pertinentes. Para usarla, pide explícitamente al asistente o a un host compatible que lea el archivo, junto con las instrucciones del repositorio y las skills aplicables.

La definición es una copia de `backend-engineer` versión `0.1.0` de la biblioteca local `agentic-skills`; no se sincroniza automáticamente con su origen. Su metadata declara `ready` en esa biblioteca, que registra un piloto en este chasis con Fastify, TypeScript y Vitest. Esa evidencia no demuestra registro automático ni ejecución como subagente nativo. La disponibilidad de delegación, herramientas y permisos depende del host y de la solicitud; los límites de este repositorio siguen vigentes.
