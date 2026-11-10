# Caso de uso: Renovar tokens

> **Endpoint:** POST `/chasis/v1/auth/refresh`  
> **Versión:** v1

## Descripción

Verifica y consume un refresh token de un solo uso y emite un nuevo par de tokens.

## Detalles del endpoint

| Método | Ruta | Content-Type |
| --- | --- | --- |
| POST | `/chasis/v1/auth/refresh` | `application/json` |

## Actores

- **Cliente HTTP:** envía el refresh token.
- **Servicio JWT:** verifica y vuelve a firmar los tokens.

## Precondiciones y prerrequisitos

- El body debe incluir `refreshToken` no vacío.
- El token debe tener firma válida, algoritmo HS256 y `type: "refresh"`.
- La identidad debe existir y estar activa; el hash del token debe estar registrado y no haber expirado.

## Parámetros de entrada

### Headers

| Nombre | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `Content-Type` | string | Sí | Debe indicar `application/json`. |

### Body

| Campo | Tipo | Requerido | Validación |
| --- | --- | --- | --- |
| `refreshToken` | string | Sí | Mínimo 1 carácter. |

## Flujo principal

1. Se valida el body.
2. Se verifica el refresh token.
3. Se consulta el estado de la identidad: si existe `client_id`, se busca el cliente técnico; de lo contrario, se busca el usuario por `sub`.
4. Se conservan `sub`, `email`, `username`, `client_id` y `scopes` cuando existen y se firma el nuevo refresh.
5. En una transacción se elimina el hash vigente del token presentado y se inserta el hash y vencimiento del nuevo. Si el anterior no existe o ya expiró, se rechaza la solicitud.
6. Se firma un nuevo access token y se devuelve el par.

## Respuestas

### Éxito (`200`)

Devuelve `{ token, refreshToken, tokenType: "Bearer", expiresIn, refreshExpiresIn }`.

### Errores

| HTTP | Código | Causa |
| --- | --- | --- |
| 401 | `INVALID_REFRESH_TOKEN` | Token inválido, expirado, no registrado, ya utilizado o de tipo incorrecto; identidad inexistente o inactiva |
| 422 | `VALIDATION_ERROR` | Body inválido |

## Detalles de implementación

- Caso de uso: `src/application/use-cases/users/refresh-token.usecase.ts`.
- La ruta no requiere bearer token; la credencial es el refresh token del body.
- La reutilización rechaza únicamente el token consumido; no invalida el sucesor ni otras sesiones.
- Una identidad deshabilitada no puede renovar; los access tokens existentes siguen vigentes hasta su vencimiento.
- Tras aplicar la migración, los tokens emitidos antes de este cambio requieren un nuevo login.
- El flujo `client-credentials` emite solo access token; no crea un refresh para clientes técnicos.

## Diagrama de flujo

```mermaid
flowchart TD
    A[Cliente HTTP] --> B[POST /chasis/v1/auth/refresh]
    B --> C{¿Body válido según Zod?}
    C -- No --> V[VALIDATION_ERROR 422]
    C -- Sí --> D[Verificar refresh token]
    D --> E{¿Firma, expiración y type refresh válidos?}
    E -- No --> F[INVALID_REFRESH_TOKEN 401]
    E -- Sí --> J[Buscar usuario o cliente según claims]
    J --> K{¿Identidad existente y activa?}
    K -- No --> F
    K -- Sí --> G[Generar refresh y reemplazar hash en transacción]
    G -.-> DB[(PostgreSQL: refresh_tokens)]
    G --> L{¿Hash anterior vigente eliminado?}
    L -- No --> F
    L -- Sí --> M[Generar access token]
    M --> H[Respuesta 200]
```
