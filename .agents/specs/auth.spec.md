# Autenticación y usuarios

## Estado

Parcialmente implementado como módulo de referencia.

## Comportamiento actual

- Registro: valida formato HTTP con Zod, exige contraseña de ocho o más caracteres con mayúscula y número, y rechaza email existente.
- Login: expone un token JWT según el caso de uso implementado.
- Perfil y listado: requieren JWT y scope `user`.

## Pendiente de decidir antes de ampliar

- Expiración, renovación y revocación de tokens.
- Recuperación de contraseña y bloqueo por intentos.
- Fuente de scopes y política de mínimo privilegio.

