# Use Case: [Use Case Name]

> Optional starter template. Use only when the project or user selects it; a
> project-local template takes precedence. All sections, values, errors, and the
> sample diagram below are illustrative placeholders, not facts about a backend.
> Remove anything that does not apply and include only implementation-backed
> behavior.

> **Endpoint:** [METHOD] /[base-route]/[resource]
> **Version:** [api-version]

## Description

This use case allows [brief description of the functionality]. [Explain the general purpose and value it provides].

[Include more details about the use case, business context, and any relevant information about its importance or application]

## Endpoint Details

**Method:** [GET/POST/PUT/DELETE/PATCH]

**Route:** /[complete-route]/[with-parameters]

**API Version:** [v1/v2/etc]

**Content Type:** [application/json, multipart/form-data, etc]

## Actors

- **[Primary Actor]**: [Description of the role and responsibilities]
- **[Secondary Actor]**: [Description of the role and responsibilities]
- **[External System]**: [Description of the interaction]

## Preconditions

- [Precondition 1: State that must be satisfied before the use case can start]
- [Precondition 2]
- [...]

## Prerequisites

- [Prerequisite 1: Required technical or business condition]
- [Prerequisite 2]
- [...]

## Input Parameters

### Headers

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| Content-Type | string | Yes/No | [Parameter description] |
| Authorization | string | Yes/No | [Parameter description] |
| [Header N] | string | Yes/No | [Parameter description] |

### Path Parameters

| Name | Type | Description |
| --- | --- | --- |
| [Param 1] | string | [Parameter description] |
| [Param N] | string | [Parameter description] |

### Query Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| [Param 1] | string | Yes/No | [Parameter description] |
| [Param N] | integer | Yes/No | [Parameter description] |

### Body

```json
{
  "property1": "value", // Description of property1
  "property2": 123, // Description of property2
  "nestedObject": {
    "subProperty1": "value", // Description of subProperty1
    "subProperty2": true // Description of subProperty2
  },
  "array": [
    {
      "item1": "value", // Description of item1
      "item2": 456 // Description of item2
    }
  ]
}
```

### Field Details

| Field | Type | Required | Validation Rules |
| --- | --- | --- | --- |
| property1 | string | Yes | [Restrictions, format, minimum/maximum length] |
| property2 | number | No | [Restrictions, valid range] |
| nestedObject | object | Yes | [Object description] |
| nestedObject.subProp1 | string | Yes | [Restrictions] |
| array | array | No | [Array restrictions] |
| array[].item1 | string | Yes | [Restrictions] |

## Main Flow

1. [Step 1: Description of the action or validation]
2. [Step 2]
3. [Step N]
   - [Sub-step or special condition if applicable]
   - [...]
4. [Final step: Expected result or response]

## Responses

### Success ([HTTP Code])

```json
{
  "id": "string",
  "property1": "value",
  "property2": 123,
  "[field confirmed by implementation]": "[observed value]"
}
```

### Errors

| HTTP Code | Error Code | Code | Message | Cause |
| --- | --- | --- | --- | --- |
| [Observed status] | [Observed error identifier] | [Observed code] | [Observed message] | [Cause established by evidence] |

## Specific Business Rules

### [Rule Category 1]

1. **[Rule Name]**: [Detailed description]
2. **[Rule Name]**: [Detailed description]
3. **[...]**

### [Rule Category 2]

1. **[Rule Name]**: [Detailed description]
2. **[...]**

## Exceptions

- **[Exception Type]**: [Description of when it occurs and how it is handled]
- **[...]**

## Flow Diagram

The diagram below is fictional and demonstrates formatting only. Replace it with
the analyzed implementation flow, preserve the project's Mermaid conventions,
and remove nodes and edges that are not supported by evidence.

```mermaid
%%{init: { "flowchart": { "defaultRenderer": "elk" } }}%%
flowchart TB

    %% Style classes
    classDef statementClass fill:#7f56d9,color:white,stroke:#5d3ba2,stroke-width:2px
    classDef conditionalClass fill:#da0063,color:white,stroke:#b0004e,stroke-width:2px
    classDef inicioClass fill:#00c2a8,color:white,stroke-width:2px,stroke:lightGreen
    classDef finClass fill:black,color:white,stroke-width:2px
    classDef rejectClass fill:#e36236,color:white,stroke:#b00000,stroke-width:2px
    classDef dbClass fill:#3578ff,stroke:blue,stroke-width:2px
    classDef amazonClass fill:#da0063,stroke:pink,color:white,stroke-width:2px
    classDef backendClass fill:#7f56d9,color:white,stroke:#5d3ba2,stroke-width:2px

    %% Initial and final states
    inicio(("Start")):::inicioClass
    fin_ok(("End OK")):::finClass
    fin_error(("End Error")):::finClass

    %% Main backend
    subgraph BACKEND [Main Backend]
        direction TB

        %% Initial validations
        recibe_solicitud["Backend receives request
        METHOD /route/resource"]:::statementClass

        validar_formato["Validate data format"]:::statementClass

        validar_campos{"Validate
        Fields"}:::conditionalClass

        %% Rejections
        rechaza_campos["Invalid fields:
        - Specific error 1
        - Specific error 2"]:::rejectClass

        %% Main processing
        subgraph PROCESO_PRINCIPAL [Main Process]
            procesar_datos["Process Input Data"]:::statementClass

            verificar_condicion{"Is Condition
            Met?"}:::conditionalClass

            realizar_operacion["Perform Main Operation"]:::statementClass
        end

        %% Additional validations
        subgraph VALIDACIONES [Additional Validations]
            validar_adicional{"Validate
            Constraint"}:::conditionalClass

            error_validacion["Validation Error:
            SPECIFIC_ERROR_CODE"]:::rejectClass
        end

        %% Persistence
        subgraph PERSISTENCIA [Persistence]
            guardar_datos["Save Data"]:::statementClass

            actualizar_relacionados["Update Related Entities"]:::statementClass
        end

        %% Final actions
        dispara_evento["Trigger event
        SpecificEvent"]:::amazonClass

        preparar_respuesta["Prepare Response"]:::statementClass
    end

    %% External resources
    subgraph BASE_DE_DATOS [Database]
        db[(Database
        DATABASE_NAME)]:::dbClass
    end

    subgraph EVENTO_BUS [Event System]
        eventbus["Event system"]:::amazonClass
    end

    %% Main flow
    inicio --> recibe_solicitud --> validar_formato --> validar_campos

    validar_campos --> |No| rechaza_campos --> fin_error

    validar_campos --> |Yes| procesar_datos

    %% Processing flow
    procesar_datos --> verificar_condicion

    verificar_condicion --> |Yes| realizar_operacion

    verificar_condicion --> |No| validar_adicional

    %% Additional validation flow
    validar_adicional --> |Valid| realizar_operacion

    validar_adicional --> |Invalid| error_validacion --> fin_error

    %% Persistence flow
    realizar_operacion --> guardar_datos --> actualizar_relacionados

    actualizar_relacionados --> dispara_evento --> preparar_respuesta --> fin_ok

    %% External resource connections
    guardar_datos <-.-> db

    actualizar_relacionados <-.-> db

    dispara_evento -.-> eventbus
```

### Flow Diagram Guide

The flow diagram above follows these conventions:

1. **General Structure**:

   - Orientation: Top to bottom (TB) for better readability.
   - Subgraphs are used to group related operations.
   - Solid arrows show the main process flow.
   - Dotted arrows (`-.->`) show interactions with external resources.

2. **Color Convention**:

   - **Purple (#7f56d9)**: Normal or declarative operations (statements).
   - **Pink/Fuchsia (#da0063)**: Conditional decisions.
   - **Teal (#00c2a8)**: Start points.
   - **Black**: End points.
   - **Red/Orange (#e36236)**: Rejection or error operations.
   - **Blue (#3578ff)**: Database resources.
   - **Pink (#da0063)**: Event or messaging systems.

3. **Node Types**:

   - **Rectangles**: Operations or actions.
   - **Diamonds**: Conditional decisions.
   - **Double circles**: Start/end points.
   - **Cylinders**: Databases.

4. **Grouping**:

   - Use subgraphs (`subgraph`) to group related operations.
   - Each subgraph must have a descriptive name.
   - The direction inside subgraphs can be specified (`TB` = top-to-bottom).

5. **Connections**:

   - Solid arrows `-->` for the main control flow.
   - Dotted arrows `-.->` for interactions with external systems.
   - Conditions on connections are specified between vertical bars `|Condition|`.

## Implementation Details

The use case follows a [architectural pattern] and implements the following main functionalities:

1. **[Functionality 1]**:

   - [Implementation detail]
   - [Classes or components involved]

2. **[Functionality 2]**:

   - [Implementation detail]
   - [...]

## Technical Notes

### Database

- [Tables and schemas involved]
- [Relationships between entities]
- [Performance considerations]

### Events

- [Events generated]
- [Events consumed]
- [Event format and structure]

### Integration Considerations

- [Recommendations for clients]
- [Error handling]
- [Idempotency]
- [Rate limiting]
- [External dependencies]

## Field Mapping and Validation

### [Enum Type 1]

| Value | Description |
| --- | --- |
| [VALUE_1] | [Value description] |
| [VALUE_2] | [Value description] |
| [...] | [...] |

### [Enum Type 2]

| Value | Description |
| --- | --- |
| [VALUE_1] | [Value description] |
| [...] | [...] |

## Examples

### [Example 1: Description]

```bash
curl -X [METHOD] [FULL_URL] \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{
    "property1": "value1",
    "property2": 123
  }'
```

### [Example 2: Description]

```bash
curl -X [METHOD] [FULL_URL] \
  -H "Content-Type: application/json" \
  -d '{
    "property1": "value2",
    "property2": 456
  }'
```

### Successful Response

```json
{
  "id": "[identifier confirmed by implementation]",
  "property1": "value1",
  "[field confirmed by implementation]": "[observed value]"
}
```

### Error Response - [Error Type]

```json
{
  "code": "[APP_CODE]_[CATEGORY]_[CODE]",
  "message": "[Descriptive error message]"
}
```
