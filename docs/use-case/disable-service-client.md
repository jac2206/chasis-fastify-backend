# Caso de uso: Deshabilitar cliente de servicio

> **Endpoint:** PATCH `/chasis/v1/auth/service-clients/:clientId/disable`  
> **Versión:** v1

## Descripción

Marca un cliente técnico existente como inactivo.

## Detalles del endpoint

| Método | Ruta | Content-Type |
| --- | --- | --- |
| PATCH | `/chasis/v1/auth/service-clients/:clientId/disable` | No aplica |

## Actores

- **Administrador autorizado:** requiere `service-clients:manage`.
- **PostgreSQL/Prisma:** actualiza el estado del cliente.

## Precondiciones y prerrequisitos

- JWT de acceso válido con el scope requerido.
- `clientId` no vacío y existente.

## Parámetros de entrada

### Headers

| Nombre | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `Authorization` | string | Sí | `Bearer <token>` con scope `service-clients:manage`. |

### Parámetro de ruta

| Nombre | Tipo | Requerido | Validación |
| --- | --- | --- | --- |
| `clientId` | string | Sí | Mínimo 1 carácter. |

## Flujo principal

1. Se autentica y autoriza la solicitud.
2. Se valida `clientId`.
3. Se comprueba que el cliente exista.
4. Se actualiza `status` a `false`.
5. Se devuelve el estado resultante.

## Respuestas

### Éxito (`200`)

```json
{ "clientId": "billing-service", "status": false }
```

### Errores

| HTTP | Código | Causa |
| --- | --- | --- |
| 401 | `UNAUTHORIZED` / `INVALID_TOKEN` | Falta o es inválido/expiró el bearer token; si falta el scope requerido responde `401` con `UNAUTHORIZED ` (espacio final). |
| 403 | `FORBIDDEN` | El token verificado no contiene el claim `scopes`. |
| 404 | `SERVICE_CLIENT_NOT_FOUND` | Cliente inexistente |
| 422 | `VALIDATION_ERROR` | Parámetro inválido |

## Reglas específicas

- La operación actualiza el estado a `false`; no elimina el registro ni rota su secreto.

## Diagrama de flujo

```mermaid
flowchart TD
    A[Cliente autorizado] --> B[authenticateJWT]
    B -->|Token faltante o inválido| X[401 UNAUTHORIZED / INVALID_TOKEN]
    B -->|Token válido| C[authorizeScopes: service-clients:manage]
    C -->|Sin claim scopes| Y[403 FORBIDDEN]
    C -->|Scope ausente| Z[401 UNAUTHORIZED con espacio final]
    C -->|Scope presente| D{¿clientId válido según Zod?}
    D -- No --> V[VALIDATION_ERROR 422]
    D -- Sí --> E[Buscar service client]
    E --> F{¿Cliente existe?}
    F -- No --> G[SERVICE_CLIENT_NOT_FOUND 404]
    F -- Sí --> H[Actualizar status a false]
    H --> I[(PostgreSQL: service_clients)]
    I --> J[Respuesta 200]
```
