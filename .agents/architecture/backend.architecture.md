# Arquitectura backend: DDD + hexagonal

## Regla de dependencia

```text
HTTP / PostgreSQL / JWT / APIs externas
              │ implementan
              ▼
       infraestructura (adapters)
              │ invoca
              ▼
       aplicación (use cases)
              │ usa puertos y modelo
              ▼
           dominio
```

Las flechas de importación apuntan hacia el centro. Infraestructura puede importar aplicación y dominio; aplicación solo importa dominio; dominio no importa capas externas.

## Responsabilidad por capa

| Capa | Contiene | No contiene |
| --- | --- | --- |
| `domain` | Entidades/agregados, value objects cuando apliquen, puertos, errores e invariantes | Frameworks, DTOs HTTP, SQL, acceso a entorno |
| `application` | Casos de uso, DTOs de entrada/salida, coordinación transaccional | `Request`, `Response`, queries SQL, lógica de transporte |
| `infraestructure` | Plugins, hooks, controladores HTTP, repositorios, adaptadores, schemas y logging, agrupados por limite tecnico | Reglas de negocio acopladas al transporte |
| `config` | Ensamblaje y configuración de dependencias | Reglas del dominio |

## Módulo nuevo de negocio

Para una capacidad de negocio, sustituye los nombres de ejemplo por los del dominio del producto:

```text
src/domain/
  entities/<aggregate>.entity.ts
  interfaces/repositories/<aggregate>.repository.interface.ts
  interfaces/use-cases/<module>/<action>.usecase.interface.ts
  errors/<module>/<module>-errors.ts
src/application/
  dto/<action>.dto.ts
  use-cases/<module>/<action>.usecase.ts
src/infraestructure/
  database/repositories/<aggregate>.repository.ts
  controllers/v1/<module>.controller.ts       # plugin Fastify: endpoint + schema + handler
  controllers/v1/index.ts                     # agrega y monta controllers por version
  hooks/                                       # hooks Fastify transversales
  plugins/                                     # plugins Fastify transversales
  http/http-client.ts                          # cliente HTTP de salida
  schemas/<module>.schema.ts
```

Registra el caso de uso y el repositorio en `src/config/container.ts`; luego monta el plugin controller en `src/infraestructure/controllers/v1/index.ts`. Mantén hooks/plugins Fastify transversales en sus directorios raiz de infraestructura; integraciones de otras tecnologias van con su adaptador.

## Agregados de dominio

Modela un agregado solo cuando existan invariantes coherentes dentro de él. Expón operaciones de intención del dominio (por ejemplo, `create`, `approve`, `cancel`) en vez de permitir cambios de estado arbitrarios. La consistencia, concurrencia, idempotencia y auditoría deben decidirse en la especificación antes de implementar el repositorio.

