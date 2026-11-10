# Caso de uso: Consultar Pokémon por nombre

> **Endpoint:** GET `/chasis/v1/generic/pokemon/:name`  
> **Versión:** v1

## Descripción

Ruta pública de ejemplo que consulta PokeAPI. El parámetro de ruta `name` es
una cadena de al menos un carácter; no requiere bearer token ni body.

## Flujo principal

1. Fastify valida el parámetro con Zod.
2. `GetPokemonXNameUseCase` solicita la información al puerto `IPokeApiAdapter`.
3. `PokeApiAdapter` llama mediante `HttpClient` a PokeAPI con un tiempo de espera de cuatro segundos y devuelve nombre, altura y peso.
4. El controller responde con los datos. El adaptador convierte cualquier error de la llamada en `POKEMON_NOT_FOUND`.

## Respuestas

Una consulta exitosa devuelve `200` con `{ "name": "pikachu", "height": 4, "weight": 60 }`. El parámetro inválido devuelve `422 VALIDATION_ERROR`. Cualquier error de la integración, incluido un fallo de conectividad, se traduce actualmente a `404 POKEMON_NOT_FOUND`.

## Diagrama de flujo

```mermaid
flowchart TB
    classDef statementClass fill:#7f56d9,color:white,stroke:#5d3ba2,stroke-width:2px
    classDef conditionalClass fill:#da0063,color:white,stroke:#b0004e,stroke-width:2px
    classDef inicioClass fill:#00c2a8,color:white,stroke-width:2px
    classDef finClass fill:black,color:white,stroke-width:2px
    classDef rejectClass fill:#e36236,color:white,stroke:#b00000,stroke-width:2px
    inicio((Inicio)):::inicioClass --> validacion{¿Nombre válido?}:::conditionalClass
    validacion -->|No| invalido[422 VALIDATION_ERROR]:::rejectClass --> finError((Fin)):::finClass
    validacion -->|Sí| caso[GetPokemonXNameUseCase]:::statementClass
    caso --> adaptador[PokeApiAdapter y HttpClient]:::statementClass
    adaptador -.-> api[PokeAPI externa]:::statementClass
    adaptador --> resultado{¿Llamada exitosa?}:::conditionalClass
    resultado -->|No| fallo[404 POKEMON_NOT_FOUND]:::rejectClass --> finError
    resultado -->|Sí| respuesta[Respuesta 200 con name, height y weight]:::statementClass --> finOk((Fin)):::finClass
```

## Detalles de implementación

El contrato OpenAPI se genera desde el schema registrado en el controller
`src/infraestructure/controllers/v1/generic.controller.ts`.
