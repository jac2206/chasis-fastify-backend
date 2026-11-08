# Caso de uso: Consultar usuario actual

> **Endpoint:** GET `/chasis/v1/users/me`  
> **Versión:** v1

## Descripción

Obtiene los datos públicos del usuario representado por el JWT de acceso.

## Detalles del endpoint

| Método | Ruta | Content-Type |
| --- | --- | --- |
| GET | `/chasis/v1/users/me` | No aplica |

## Actores

- **Usuario autenticado:** presenta el JWT.
- **PostgreSQL/Prisma:** busca el usuario por número de documento.

## Precondiciones y prerrequisitos

- Debe existir `Authorization: Bearer <token>`.
- El token debe ser de acceso y contener el scope `user`.
- El claim `sub` se interpreta como número de documento.

## Parámetros de entrada

### Headers

| Nombre | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `Authorization` | string | Sí | `Bearer <token>` con JWT de acceso y scope `user`. |

No recibe body, path params ni query.

## Flujo principal

1. `authenticateJWT` verifica el JWT y adjunta sus claims en `request.user`.
2. `authorizeScopes(["user"])` valida el scope.
3. El handler lee `request.user.sub`.
4. `GetMeUseCase` busca el usuario y devuelve sus datos públicos.

## Respuestas

### Éxito (`200`)

```json
{ "documentType": "CC", "documentNumber": "1037630472", "fullName": "Julian Arango", "email": "julian@email.com", "phone": "3117468187" }
```

### Errores

| HTTP | Código | Causa |
| --- | --- | --- |
| 401 | `UNAUTHORIZED` / `INVALID_TOKEN` | Falta o invalidez/expiración del JWT; también se usa `UNAUTHORIZED ` (espacio final) cuando el token carece del scope `user`. |
| 403 | `FORBIDDEN` | El token verificado no contiene el claim `scopes`. |
| 404 | `USER_NOT_FOUND` | No existe el usuario del claim `sub` |

La entidad permite que `phone` sea `null`, pero el schema OpenAPI de esta respuesta lo declara como string; la implementación no valida la respuesta contra ese schema.

## Detalles técnicos

- Caso de uso: `src/application/use-cases/users/get-me-user.usecase.ts`.
- Repositorio activo: `UserPrismaRepository`.

## Diagrama de flujo

```mermaid
flowchart TD
    A[Cliente HTTP] --> B[authenticateJWT]
    B -->|Token faltante o inválido| X[401 UNAUTHORIZED / INVALID_TOKEN]
    B -->|Token válido| C[authorizeScopes: user]
    C -->|Sin claim scopes| Y[403 FORBIDDEN]
    C -->|Scope user ausente| Z[401 UNAUTHORIZED con espacio final]
    C -->|Scope user presente| D[Leer request.user.sub]
    D --> E[GetMeUseCase]
    E --> F[UserPrismaRepository.findByDocument]
    F --> G[(PostgreSQL: users)]
    G --> H{¿Usuario existe?}
    H -- No --> I[USER_NOT_FOUND 404]
    H -- Sí --> J[Respuesta 200]
```
