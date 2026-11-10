# Instrucciones de implementación backend

## Antes de modificar

1. Localiza una implementación análoga y la prueba correspondiente.
2. Para comportamiento de negocio, redacta/actualiza una spec SDD.
3. Define los errores y los contratos de entrada/salida antes de codificar.

## Lista de cambios para una capacidad nueva

1. Entidad o value object e invariantes en `domain`.
2. Puerto de repositorio/adaptador en `domain/interfaces`; contrato del caso de uso en `application/interfaces`.
3. `DomainErrors` y `DomainException` para fallos previstos.
4. DTOs y caso de uso en `application`.
5. Tests unitarios del caso de uso con dobles tipados.
6. Adaptador/repository y su prueba. Para persistencia Prisma, modifica `prisma/models/`, valida, migra y regenera el cliente; no edites `src/generated/prisma/` a mano. Parametriza cualquier consulta SQL directa.
7. Schema Zod, controlador y ruta registrada en un plugin Fastify.
8. Registro Awilix, plugin/ruta Fastify y prueba HTTP con `app.inject()`.
9. Documentación OpenAPI/Swagger y comandos de verificación.

## Calidad

- Mantén funciones pequeñas y con una única intención.
- No hagas consultas en controladores ni lógica de negocio en repositorios.
- Mantén los DTOs específicos por caso de uso cuando las formas de entrada/salida difieran.
- Si se necesita una transacción entre repositorios, define primero el límite transaccional y el puerto adecuado; no disperses `BEGIN/COMMIT` en casos de uso.
- No mezcles acceso a Prisma o `pg` dentro de casos de uso, controladores o dominio.
- No cambies modelos Prisma sin una migración versionada, salvo que el cambio sea exclusivamente de código y no de esquema.
- Cambios compatibles hacia atrás son preferibles; documenta toda ruptura de contrato en la spec.

