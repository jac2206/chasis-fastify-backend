# Caso de uso: Registrar usuario

> **Endpoint:** POST `/chasis/v1/users/register`  
> **Versión:** v1

## Descripción

Registra un usuario nuevo, protege su contraseña con bcrypt y lo guarda mediante Prisma.

## Detalles del endpoint

| Método | Ruta | Content-Type |
| --- | --- | --- |
| POST | `/chasis/v1/users/register` | `application/json` |

## Actores

- **Cliente HTTP:** envía los datos de registro.
- **PostgreSQL/Prisma:** persiste el usuario.

## Precondiciones y prerrequisitos

- El body debe cumplir el schema Zod de registro.
- El email no debe existir previamente.

## Parámetros de entrada

### Headers

| Nombre | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `Content-Type` | string | Sí | Debe indicar `application/json`. |

### Body

| Campo | Tipo | Requerido | Validación |
| --- | --- | --- | --- |
| `documentType` | string | Sí | Uno de `CC`, `CE`, `NIT` o `PT`. |
| `documentNumber` | string | Sí | Mínimo 5 caracteres. |
| `fullName` | string | Sí | Mínimo 3 caracteres. |
| `email` | string | Sí | Formato email. |
| `phone` | string | No | Si se envía, mínimo 7 caracteres. Si se omite, se guarda como `null`. |
| `password` | string | Sí | Además, el caso de uso exige mínimo 8 caracteres, mayúscula y número. |

## Flujo principal

1. Fastify valida el body con el schema Zod registrado en el controller; el handler recibe `request.body` con el tipo inferido.
2. `RegisterUserUseCase` valida la fortaleza de la contraseña.
3. Busca un usuario existente por email.
4. Genera el hash bcrypt con costo `10`.
5. Crea el usuario con `hasPin=false` y `status=true`.
6. `UserPrismaRepository` guarda el registro y se devuelve el resultado público.

## Respuestas

### Éxito (`201`)

```json
{ "id": "1037630472", "email": "julian@email.com", "fullName": "Julian Arango", "message": "User registered successfully" }
```

### Errores

| HTTP | Código | Causa |
| --- | --- | --- |
| 409 | `USER_EMAIL_ALREADY_EXISTS` | Email ya registrado |
| 422 | `VALIDATION_ERROR` | Body inválido |
| 422 | `USER_WEAK_PASSWORD` | Contraseña sin mayúscula, número o longitud requerida |

## Detalles técnicos

- Repositorio: `src/infraestructure/database/repositories/user-prisma.repository.ts`.
- El `id` de respuesta es el número de documento, no el UUID interno de Prisma.
- El número de documento tiene una restricción única en la base de datos. El caso de uso no comprueba ese duplicado antes de guardar ni traduce expresamente ese error a una excepción de dominio.

## Diagrama de flujo

```mermaid
flowchart TD
    A[Cliente HTTP] --> B[POST /chasis/v1/users/register]
    B --> C{¿Body válido según Zod?}
    C -- No --> V[VALIDATION_ERROR 422]
    C -- Sí --> D{¿Contraseña cumple la regla del caso de uso?}
    D -- No --> E[USER_WEAK_PASSWORD 422]
    D -- Sí --> F[UserPrismaRepository.findByEmail]
    F --> G{¿Email existente?}
    G -- Sí --> H[USER_EMAIL_ALREADY_EXISTS 409]
    G -- No --> I[Hash bcrypt y crear User]
    I --> J[(PostgreSQL: users)]
    J --> K[Respuesta 201]
```
