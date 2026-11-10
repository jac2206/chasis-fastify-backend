# Mejoras del chasis: autorización, sesiones y ejemplos

## Listado de usuarios

`GET /chasis/v1/users/` requiere el scope `users:read`. El scope `user` permite acceder al perfil propio, pero no al listado. Sin el permiso se responde 403.

## Renovación de sesión

Cada refresh token emitido en el login solo puede intercambiarse una vez. El intercambio exitoso invalida el token presentado y emite otro. Reutilizar un token consumido responde 401 INVALID_REFRESH_TOKEN sin invalidar el token sucesor ni otras sesiones. La sustitución debe ser atómica incluso ante solicitudes concurrentes. Se almacena únicamente un resumen criptográfico del token, no el token en claro. La migración requerida se versiona y no se aplica como parte de la verificación. Tokens previos a este cambio no registrados dejan de poder renovarse; se requiere un nuevo login.

## Ejemplo generic

Se conserva solamente GET `/chasis/v1/generic/pokemon/:name` como ejemplo publico de integracion con PokeAPI. La respuesta contiene `name`, `height` y `weight`; el nombre es obligatorio. La implementacion conserva el contrato anterior: un fallo de la integracion responde 404 `POKEMON_NOT_FOUND`. Las demas rutas generic se mantienen retiradas.

## Paginacion y deshabilitacion

El listado usa query `page` y `pageSize`, enteros positivos, ambos opcionales, con valores iniciales 1 y 20. Devuelve `items`, `page`, `pageSize` y `total`. El total cuenta todos los usuarios; una pagina fuera del rango devuelve una lista vacia. Deshabilitar un usuario o cliente no invalida access tokens emitidos, que siguen vigentes hasta su vencimiento.

Un usuario inactivo no puede iniciar sesion ni renovar tokens. Un cliente inactivo no puede obtener nuevos tokens mediante client-credentials o refresh. La comprobacion de estado no revoca access tokens existentes.
El tamano de pagina no puede superar 100 registros; solicitudes fuera de rango responden 422.

## Cierre de sesión individual

- `POST /chasis/v1/auth/logout` recibe `{ refreshToken }` no vacío; el refresh es la credencial y no requiere access token.
- Verifica firma, expiración y tipo refresh. Si son inválidos responde `401 INVALID_REFRESH_TOKEN`; un body inválido responde `422 VALIDATION_ERROR`.
- Elimina el hash del token presentado de forma parametrizada y responde `204` sin body. Repetir con un token firmado y vigente ya revocado también responde `204`; no modifica otras sesiones ni revela si el token estaba registrado.
- El refresh revocado no puede volver a renovar; los access tokens emitidos siguen válidos hasta su vencimiento. No cambia el modelo Prisma ni requiere migración.
- La revocación y una renovación concurrentes compiten por el mismo registro: si la renovación gana, el cliente debe cerrar la sesión con el refresh sucesor; no se revoca automáticamente una familia de tokens.
