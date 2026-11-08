# Especificación: módulo de autenticación

## Contratos

- `POST /chasis/v1/auth/login`: autentica un usuario y devuelve access token y
  refresh token.
- `POST /chasis/v1/auth/refresh`: intercambia un refresh token válido por un
  nuevo par de tokens.
- `POST /chasis/v1/auth/client-credentials`: autentica un cliente técnico y
  devuelve únicamente un access token.
- Las operaciones de usuarios permanecen bajo `/chasis/v1/users`.

## Clientes técnicos

Los clientes se identifican por `client_id`; el secreto se almacena únicamente
como hash. Un cliente inactivo, inexistente o con secreto incorrecto recibe
`401 INVALID_CLIENT_CREDENTIALS`. Sus scopes se copian al access token.

La creación y rotación administrativa de clientes queda fuera de este primer
flujo de autenticación y se expone únicamente mediante endpoints protegidos
por el scope `service-clients:manage`. El secreto plano se devuelve una sola
vez en la creación o rotación. El primer cliente con ese scope debe
provisionarse mediante bootstrap seguro para evitar una dependencia circular.
