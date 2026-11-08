# Integración y despliegue continuo

La pipeline principal del repositorio es GitHub Actions, definida en `.github/workflows/ci_cd.yml`. También se conserva `azure-pipelines.yml` como flujo adicional. Los YAML son la fuente de verdad; actualiza este resumen cuando cambien.

## Tecnologías y comandos

- Runtime de CI: Node.js 24.
- Dependencias: `npm ci`.
- Cliente de base de datos: `npm run prisma:generate` genera Prisma Client antes de compilar o probar.
- Pruebas: `npm run test:coverage` ejecuta Vitest con cobertura V8.
- Compilación: `npm run build` ejecuta TypeScript (`tsc`).
- El repositorio también ofrece `npm run check` para Biome y `npm run prisma:validate` para validar el esquema. Ninguno de los dos aparece en las pipelines revisadas.
- Las pipelines no aplican migraciones de base de datos.

## Flujo principal: GitHub Actions

Archivo: `.github/workflows/ci_cd.yml`.

- Se activa con push a `master` y pull request hacia `develop` o `master`.
- Los trabajos se ejecutan en Ubuntu y siguen la secuencia `test` → `build` → `sonar`.
- `test` instala dependencias, genera Prisma Client y ejecuta cobertura.
- `build` vuelve a instalar dependencias, genera Prisma Client y compila.
- `sonar` vuelve a instalar dependencias, genera Prisma Client, ejecuta cobertura y llama a SonarQube Scan. Usa el secreto `TOKEN_SONAR` como `SONAR_TOKEN`.
- `deploy` depende de `sonar` y solo corre en push a `master`; instala Railway CLI y ejecuta `railway up --service chasis-fastify-backend --ci` con el secreto `RAILWAY_TOKEN`.

## Flujo adicional: Azure Pipelines

Archivo: `azure-pipelines.yml`.

- Se activa con push a `master` y pull request hacia `develop` o `master`.
- Usa Ubuntu y Node.js 24. Las etapas declaradas son `Test` → `Build` → `Sonar` → `Deploy`.
- `Test` instala dependencias, genera Prisma Client y ejecuta cobertura.
- `Build` instala dependencias, genera Prisma Client y compila.
- `Sonar` instala dependencias, genera Prisma Client y cobertura. El YAML contiene un comentario que indica que SonarCloud debe configurarse allí; no declara un paso de análisis.
- `Deploy` está condicionado a una ejecución CI exitosa en `master`; instala Railway CLI y ejecuta `railway up --service chasis-fast-back --ci` con `RAILWAY_TOKEN`.

## Diferencias que requieren verificación

- Los nombres de servicio de Railway difieren: GitHub Actions usa `chasis-fastify-backend` y Azure usa `chasis-fast-back`. El nombre del paquete en `package.json` es `chasis-fastify-back`. Confirma cuál servicio existe antes de depender de una pipeline de despliegue; este documento no cambia esa configuración.
- La etapa `Sonar` de Azure no tiene configurado un análisis en el YAML actual, mientras que GitHub Actions sí invoca una acción de escaneo.
- Biome (`npm run check`) y la validación de esquema Prisma (`npm run prisma:validate`) no son controles configurados en ninguna de estas dos pipelines.

## Límites operativos

- No ejecutes un despliegue para validar documentación o cambios locales.
- No apliques migraciones desde estas pipelines: los YAML inspeccionados no las ejecutan. Sigue el procedimiento operativo aprobado para cada entorno.
- Trata `TOKEN_SONAR` y `RAILWAY_TOKEN` como nombres de secretos; nunca imprimas ni solicites sus valores en logs o documentos.