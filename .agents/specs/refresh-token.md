# Especificación: refresh token

## Objetivo

Permitir que clientes de la API renueven el token de acceso sin volver a enviar
la contraseña. El contrato debe ser reutilizable para clientes de usuario y
clientes server-to-server que reciban un refresh token mediante su mecanismo
de provisión.

## Decisiones

- El login devuelve `token`, `refreshToken`, `tokenType` y las duraciones en
  segundos.
- El token de acceso dura 15 minutos.
- El refresh token dura 30 días y usa el mismo secreto de firma con tipo
  `refresh`, por lo que no puede usarse para acceder a recursos protegidos.
- `POST /chasis/v1/users/refresh` recibe `{ refreshToken }` y devuelve un nuevo
  par de tokens. El cliente debe reemplazar el par anterior; como los tokens no
  se persisten, el token anterior seguirá siendo criptográficamente válido
  hasta su expiración.
- Los refresh tokens no se persisten todavía. Por tanto, no hay revocación
  individual ni detección de reutilización; esas reglas requieren definir una
  política de sesiones y un almacenamiento de tokens antes de incorporarse.
- El refresh conserva `sub`, `email` y `scopes` del token presentado. No acepta
  un token de acceso en el endpoint de refresh.
- Un cliente server-to-server puede usar el contrato una vez que su sistema de
  identidad le haya provisionado un refresh token. La emisión de credenciales
  client-credentials queda fuera de esta especificación porque el chasis no
  tiene aún entidad, secreto ni política para clientes técnicos.

## Errores y contrato HTTP

- Credenciales inválidas durante login: `401 USER_INVALID_CREDENTIALS`.
- Refresh ausente o con formato inválido: `422 VALIDATION_ERROR`.
- Refresh expirado, mal firmado o de tipo incorrecto: `401 INVALID_REFRESH_TOKEN`.
- El response nunca expone secretos, hashes ni datos internos.

## Casos verificables

1. Login exitoso entrega access y refresh token.
2. El refresh token puede generar un nuevo par.
3. Un access token no puede renovar la sesión.
4. Un refresh expirado o inválido se rechaza.
5. El login conserva el comportamiento existente de credenciales inválidas.
