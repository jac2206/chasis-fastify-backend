# Autenticación y usuarios

## Estado y alcance

Módulo de referencia implementado. Los contratos detallados se mantienen en [auth-module.md](auth-module.md) y las decisiones de sesiones y paginación en [chasis-hardening.md](chasis-hardening.md). La documentación del comportamiento implementado está en [docs/main.md](../../docs/main.md).

## Comportamiento actual

- Registro: valida el body con Zod, requiere contraseña de ocho o más caracteres con mayúscula y número y rechaza email existente.
- Login: requiere usuario activo y credenciales válidas; devuelve access token con scope `user` y refresh token.
- Perfil: requiere JWT de acceso y scope `user`.
- Listado: requiere JWT de acceso y scope `users:read`; usa paginación con `page` y `pageSize` (valores iniciales 1 y 20, tamaño máximo 100).
- Renovación: el refresh token se consume una vez; su hash se sustituye por el del nuevo en una transacción. Su reutilización responde `401 INVALID_REFRESH_TOKEN` y no invalida otras sesiones.
- Una identidad inactiva no puede iniciar sesión ni renovar; sus access tokens emitidos continúan válidos hasta su vencimiento.
- Clientes técnicos: `client-credentials` emite únicamente access token; crear, rotar secretos y deshabilitar exige `service-clients:manage`.

## Pendiente de decidir antes de ampliar

- Recuperación de contraseña, bloqueo por intentos y políticas de protección ante abuso.
- Fuente y administración de scopes para usuarios y política de mínimo privilegio.
- Retención y limpieza de hashes de refresh tokens expirados y política de cierre de sesión o revocación adicional.
