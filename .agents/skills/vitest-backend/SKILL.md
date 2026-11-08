---
name: vitest-backend
description: >
  Diseña y mantiene pruebas Vitest para los casos de uso, adaptadores y rutas
  HTTP de este backend, usando los dobles y comandos que ya define el proyecto.
  Úsala al crear o modificar pruebas.
metadata:
  version: "1.0.0"
---

# Vitest en este backend

## Propósito

Probar decisiones y resultados observables del backend con Vitest, sin introducir conexiones externas en pruebas unitarias.

## Cuándo usarla

- Al añadir o actualizar pruebas de dominio, aplicación, infraestructura o HTTP.
- Al corregir una prueba inestable o al ajustar cobertura relacionada con un cambio.
- Al decidir qué nivel de prueba corresponde a un criterio de aceptación.

## Evidencia del proyecto

- Vitest usa entorno Node, globals y archivos `test/**/*.spec.ts`, según `vitest.config.ts`.
- Las pruebas viven bajo `test/` reflejando la estructura de `src/`.
- Las pruebas HTTP usan `createServer().inject()`; la prueba del servidor está en `test/infraestructure/http/server.fastify.spec.ts`.
- Las pruebas unitarias de casos de uso usan puertos falsos tipados. Las pruebas de adaptadores simulan el borde externo.
- `npm run test:run` ejecuta Vitest una vez; `npm run test:coverage` ejecuta las pruebas con cobertura V8 y es el comando de pruebas usado por la CI.

## Procedimiento

1. Lee la implementación, su prueba análoga y los criterios de aceptación relacionados antes de escribir pruebas.
2. Elige el nivel más cercano a la decisión que quieres comprobar: caso de uso para reglas y orquestación, infraestructura para mapeos y llamadas al borde, HTTP para rutas y contratos.
3. Escribe un caso por resultado relevante, con nombres que expresen condición y resultado esperado.
4. Para casos de uso, crea dobles tipados de las interfaces de dominio y verifica el resultado y las colaboraciones relevantes, no detalles internos irrelevantes.
5. Para Prisma, `pg`, HTTP externo o JWT, simula la dependencia externa en pruebas unitarias. No conectes una base de datos o servicio real en una prueba unitaria.
6. Para HTTP, usa `app.inject()` y verifica estado, cuerpo, autenticación, validación y errores que correspondan al cambio.
7. Comprueba tanto los caminos de éxito como los fallos previstos y límites importantes de la especificación.
8. Ejecuta la prueba enfocada durante el desarrollo y la suite de una sola ejecución antes de cerrar, según el alcance y autorización de la tarea.

## Reglas locales

- Mantén cada prueba independiente y limpia recursos Fastify en `afterEach` cuando se cree una instancia.
- No reproduzcas la implementación dentro del mock; modela los resultados del puerto.
- En pruebas SQL legacy, comprueba el uso de parámetros `$1`, `$2`, etc.; no aceptes SQL interpolado.
- No agregues pruebas que dependan del estado de una base compartida.
- La exclusión de una carpeta en la configuración de cobertura no elimina la necesidad de probar su comportamiento observable.
- No persigas un porcentaje aislado; cubre criterios, decisiones y resultados relevantes.

## Verificación

- Ejecuta `npm run test:run` para la suite completa.
- Usa `npm run test:coverage` cuando se requiera comprobar cobertura o reproducir la validación de CI.
- Usa `npm run mutation` solo cuando el alcance o la solicitud lo justifique; no es una verificación rutinaria.
- Informa los comandos ejecutados y sus resultados; no afirmes que se validó una prueba que no se corrió.
