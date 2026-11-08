---
name: backend-documentation
description: >
  Analyzes an existing backend and creates or maintains evidence-based technical
  documentation for the system overview and its implemented use cases. Use when
  documentation must reflect the actual code of APIs, application flows, domain
  logic, persistence, integrations, infrastructure, and execution flows without
  inventing behavior.
metadata:
  version: "1.1.1"
---

# Backend Documentation

Analyze a backend implementation and create or update technical documentation that
describes the behavior supported by the code.

The general overview output is `docs/main.md` by design. Use-case documents are
created under the documentation location discovered in the analyzed project.

`docs/main.md` is the deliberate path contract for the general overview. For
use-case documents and supporting material, adapt to the project's actual paths,
documentation conventions, templates, and terminology rather than imposing a
fixed project structure.

For every documented use case, reconstruct and document its actual execution
flow. Include a Mermaid diagram when the project's template or convention calls
for one. If no local template or diagram convention exists, include a diagram
when it materially clarifies meaningful steps, decisions, or side effects. Follow
an existing template that omits diagrams.

## Purpose

This Skill reconstructs a backend's implemented behavior from its source code,
configuration, tests, and existing documentation.

It can analyze Clean Architecture, Onion, Hexagonal, DDD, MVC, layered, or other
backend structures, but it does not depend on any particular language, framework,
ORM, database, cloud provider, messaging system, directory layout, or naming
convention.

The documentation is a traceable description of the implementation, not a design
proposal, requirements document, or idealized architecture.

## When to use

Use this Skill when the user asks to:

- Document an existing backend from its implementation.
- Generate or maintain `docs/main.md`.
- Generate or maintain use-case documentation under the project's established
  documentation location, such as `docs/use-case/`.
- Audit existing backend documentation against the code.
- Explain API flows across routes, controllers, application services, domain,
  persistence, events, or external integrations.
- Generate or update Mermaid flow diagrams for implemented use cases.
- Update technical documentation after backend changes.
- Reconstruct how a backend use case actually executes from its entry point to
  its final response or side effect.

## When not to use

Do not use this Skill when:

- The backend does not exist or there is no implementation to inspect.
- The user wants a future-state architecture, product requirements, or API design
  that is not backed by an existing implementation.
- The task is only to write a generic tutorial or conceptual architecture guide.
- The task is only to generate API reference from a formal specification when no
  code analysis or maintenance is required.
- The requested output is unrelated to backend technical documentation.

## Core Principles

### 1. Evidence before prose

Every documented behavior must be supported by identifiable evidence in source
code, configuration, tests, generated schemas, or existing documentation that is
still consistent with the implementation.

Prefer direct implementation evidence over names, comments, conventions, or
assumptions.

### 2. Document behavior, not architectural intent

Describe what the application actually does, including inconsistencies,
unimplemented paths, implicit behavior, and missing evidence when relevant.

Do not upgrade names such as `domain`, `service`, or `repository` into claims about
a specific architecture unless their relationships support that claim.

### 3. Preserve useful documentation

Before changing an existing document, compare it with the current implementation.

Keep valid content, update changed sections, and remove or qualify claims that no
longer match the code.

Do not regenerate unrelated documents.

### 4. Calibrated certainty

Separate confirmed behavior from inferred structure and unknowns.

If the code does not provide enough evidence, state that it could not be determined
and identify the missing evidence rather than filling the gap with a plausible
assumption.

### 5. Diagrams must represent implementation

A diagram is documentation of the implementation, not a conceptual architecture
diagram.

Every node, connection, decision, persistence operation, integration, event, and
response represented in a use-case flow diagram must be supported by evidence.

Do not create diagrams merely because they look useful. Create them because they
accurately communicate the actual execution flow.

## Inputs

### Required

- Backend repository or source tree.
  - Inspect the actual implementation, not only its README or file names.

- Existing documentation, when present.
  - Discover its root, index files, use-case locations, naming conventions,
    templates, and structure before changing any documentation.
  - Do not assume a fixed use-case path or template filename.

### Optional

- A requested scope, domain, module, endpoint, or set of use cases.
  - If supplied, prioritize it while preserving dependencies needed to explain
    the flow.

- Runtime configuration examples, API specifications, migration history, or test
  commands.
  - Use them only as corroborating evidence and distinguish them from source-code
    behavior.

- A base revision or change set for incremental documentation updates.
  - Compare the relevant implementation and documentation changes when available.

## Outputs

The Skill should produce:

### General documentation

- `docs/main.md`
  - Create it when it does not exist.
  - When another overview document exists, inspect it as supporting project
    documentation.
  - Keep the requested general output at `docs/main.md`.
  - Include a concise, evidence-based overview of purpose, functional context,
    architecture, modules, technologies, relevant components, security,
    persistence, events, external integrations, infrastructure, project
    organization, and a use-case index when those facts are supported.

### Use-case documentation

- Use-case documentation in the project's established documentation location.
  - One document per implemented use case, organized according to the discovered
    project convention.
  - Discover and read any local template or representative existing documents
    before writing.
  - The local template belongs to the analyzed project; never copy it into this
    Skill.
  - The bundled `templates/use-case-document.md` is an optional starter, not the
    default. Use it only when the user or project explicitly selects it, and never
    in place of a project-local template.

### Flow diagrams

- A Mermaid flow diagram for each documented use case when the project's local
  template or documentation convention calls for one. If no local template or
  diagram convention exists, add a diagram only when it materially clarifies a
  meaningful execution flow. Follow an existing template that omits diagrams.
  - The diagram must be generated from the actual implementation.
  - It must represent the execution path of the use case.
  - It must follow the visual and structural conventions defined by the project's
    local documentation template.
  - It must be updated whenever the implementation flow changes.

### Change summary

- A change summary.
  - Identify created, updated, retained, removed, and unresolved documentation
    items.
  - Identify the evidence or implementation area that motivated each change.

## Workflow

Execute the following process:

### 1. Establish scope and repository conventions

- Read applicable repository instructions.
- Inspect the project tree, package/build metadata, entry points, and existing
  documentation structure.
- Locate the project's general overview, documentation roots, existing use-case
  files, local templates or representative documents, and naming conventions.
- Treat paths such as `docs/main.md` or `docs/use-case/template.md` only as
  possible conventions, not assumptions.
- If a local use-case template exists, read it completely enough to understand
  its required structure, expected detail, diagram conventions, and examples.

### 2. Build an implementation inventory

Locate, when present:

- routes
- controllers
- handlers
- middleware
- DTOs
- schemas
- validators
- application services
- use cases
- entities
- value objects
- domain services
- interfaces
- repositories
- infrastructure
- database adapters
- ORM models
- migrations
- events
- queues
- external clients
- configuration
- authentication
- authorization
- error handling
- tests

Use imports, calls, registrations, dependency injection, schemas, and tests to
establish relationships.

Do not infer relationships from directory names alone.

### 3. Trace implemented use cases

Start from confirmed entry points such as:

- HTTP routes
- message consumers
- scheduled jobs
- event handlers
- CLI commands
- background workers
- other confirmed application entry points

For each use case:

- Follow the execution path through middleware, validation,
  controller/handler, application service, domain logic, repositories,
  persistence, events, and external integrations.
- Record inputs, transformations, branching rules, side effects, return values,
  errors, and dependencies.
- Identify the actual success and failure paths.
- Identify important validations and conditional branches.
- Identify database reads and writes.
- Identify external service calls.
- Identify published or consumed events.
- Identify authentication and authorization checks when applicable.
- Include non-HTTP entry points when they represent real application use cases.
- Use tests to confirm behavior, edge cases, status codes, and error contracts.
- Do not treat an unexecuted or stale test as proof without checking the code.

Create an internal evidence map before writing the documentation.

### 4. Reconcile existing documentation

Compare each documented claim with the evidence map and current code.

Classify claims as:

- confirmed
- contradicted
- stale
- inferred
- unresolved

Then:

- Preserve confirmed material.
- Revise stale material.
- Remove contradictions.
- Qualify inferred information.
- Mark unresolved facts explicitly.

### 5. Update the general documentation

Create or minimally edit `docs/main.md` according to the existing project style.

- Do not assume it exists before inspection.
- Include only applicable sections supported by evidence.
- Link to actual use-case documents.
- Keep the use-case index synchronized with the cases documented under the
  discovered use-case location.
- Describe architecture as observed relationships.
- Label architectural interpretations when they are not explicit in the
  implementation.

### 6. Update use-case documentation

Create or minimally edit one document per confirmed use case under the discovered
directory and naming convention.

If a local template exists:

- Read it before generating the document.
- Treat it as the authoritative structural contract for the project.
- Follow its sections, formatting, examples, Mermaid conventions, and expected
  level of detail.
- Do not replace or redesign the template.

If no template exists:

- Infer the structure from representative existing documents.
- Use a minimal structure appropriate for the project's documentation style.
- Generate a flow diagram when the use case has meaningful execution steps,
  decisions, dependencies, or integrations.
- Do not apply the bundled `templates/use-case-document.md` unless the user or
  project explicitly selects it.

Use only applicable sections.

Depending on the implementation, a use-case document may include:

- endpoint and method
- actors and security
- preconditions
- prerequisites
- input parameters
- headers
- path parameters
- query parameters
- request body
- DTOs
- field details
- validation
- main flow
- application service
- domain objects and rules
- repositories and persistence
- events
- external integrations
- successful responses
- errors
- exceptions
- dependencies
- implementation details
- technical considerations
- field mapping
- examples
- Mermaid flow diagram

Mark a field as unknown or not evidenced when the implementation does not
establish it.

Do not create illustrative examples that look like real contracts unless they are
derived from schemas, tests, or actual code.

### 7. Generate the flow diagram

Generate or update a Mermaid diagram when the project template or documentation
convention calls for one. If no local template or diagram convention exists, use
a Mermaid diagram when it materially clarifies meaningful execution steps,
decisions, dependencies, or side effects. Follow an existing template that omits
diagrams.

The diagram must be derived from the evidence map created during implementation
analysis.

#### Diagram construction

Trace the real execution flow from the entry point to the final outcome.

Represent, when applicable:

- route or entry point
- middleware
- authentication
- authorization
- validation
- controller or handler
- application service or use case
- domain services
- entities or important domain operations
- repositories
- database operations
- transactions
- external services
- queues
- event buses
- event publication
- response mapping
- success response
- error response
- relevant exception or rejection paths

#### Decision branches

Represent meaningful conditional behavior, such as:

- validation failures
- authorization failures
- entity not found
- duplicate records
- business rule rejection
- external service failures
- database failures
- conditional persistence
- conditional event publication
- fallback behavior

Do not add branches merely because they are common patterns.

A branch must be supported by the implementation.

#### Diagram detail

Use actual component names when they improve traceability.

For example, prefer:

```text
UsersController
    ↓
CreateUserUseCase
    ↓
UserRepository
    ↓
Postgres
```

over generic labels such as:

```text
Controller
    ↓
Service
    ↓
Database
```

when the actual implementation names are available and useful.

Do not make the diagram unnecessarily low-level.

The objective is to expose the meaningful execution flow, not every line of code.

#### Mermaid conventions

When the project provides Mermaid styles, colors, node types, subgraphs,
or connection conventions, follow them exactly.

Do not replace project-specific Mermaid conventions with a generic Mermaid style.

When no local convention exists:

- Use readable Mermaid syntax.
- Group components by meaningful responsibility.
- Keep the flow visually understandable.
- Use consistent node types for processes, decisions, persistence, external
  systems, and outcomes.
- Avoid excessive styling that does not improve comprehension.

#### Diagram accuracy

The diagram must never:

- invent components
- invent services
- invent integrations
- invent validations
- invent database operations
- invent events
- invent error paths
- invent business rules

If an important part of the flow cannot be established, omit it or mark the
uncertainty in the surrounding documentation rather than guessing.

#### Diagram synchronization

Whenever an existing use-case document is updated:

1. Compare the current implementation with the existing diagram.
2. Identify changed execution paths.
3. Update affected nodes, connections, branches, integrations, and outcomes.
4. Remove obsolete components.
5. Ensure the final diagram still matches the implementation.

The flow diagram is part of the documentation and must remain synchronized with
the code.

### 8. Validate and report

Check every documented:

- endpoint
- field
- response
- error
- business rule
- side effect
- event
- integration
- dependency
- flow step
- diagram component
- diagram relationship

against implementation evidence.

Also check:

- links
- paths
- use-case index entries
- local template consistency
- Mermaid syntax when practical
- consistency between prose and diagram

Report unresolved questions and evidence gaps instead of silently guessing.

## Rules

The Skill must:

- Treat source code as the primary authority for implemented behavior.
- Follow real call and dependency relationships across layers and modules.
- Inspect existing documentation before modifying it.
- Preserve valid documentation and make minimal targeted updates.
- Respect the existing `docs/` organization and avoid unnecessary file moves.
- Discover and use the analyzed project's local template or documentation
  convention when generating use-case documents.
- Treat a local documentation template as the structural contract for the
  generated document.
- Generate a flow diagram when the local template or documentation convention
  calls for one, or when no local template or diagram convention exists and a
  diagram materially clarifies the execution flow.
- Follow an existing template that omits diagrams.
- Derive every diagram from the implementation evidence map.
- Keep the diagram synchronized with the documented execution flow.
- Include only sections, branches, components, and diagrams that apply to the
  analyzed use case.
- Distinguish confirmed facts, evidence-based inferences, and unknowns.
- Keep the general overview and use-case index consistent with generated files.
- Preserve the project's Mermaid visual conventions when they exist.

The Skill must not:

- Invent endpoints, parameters, schemas, responses, errors, rules, events,
  integrations, actors, dependencies, infrastructure, or diagram components.
- Treat filenames, class names, comments, README claims, or architecture labels
  as sufficient evidence by themselves.
- Document planned, dead, unreachable, or commented-out behavior as implemented.
- Regenerate all documentation when only a subset changed.
- Replace useful existing content with generic boilerplate.
- Copy the complete use-case template into the Skill definition.
- Replace a project's Mermaid conventions with unrelated visual conventions.
- Claim that an architecture or security guarantee exists without implementation
  evidence.
- Add diagrams merely for visual decoration.
- Omit a required flow diagram when the project's documentation template defines
  one.
- Simplify a documented flow in a way that removes meaningful business,
  persistence, integration, validation, or error behavior.

## Constraints

- The Skill is read-first: inspect and form an evidence map before writing files.
- The Skill is portable across backend languages, frameworks, architectures,
  persistence technologies, infrastructure providers, messaging systems, and
  documentation conventions.
- Documentation must remain in English unless the user or analyzed project's
  convention specifies another language.
- Do not move source or documentation files unless explicitly requested.
- If an implementation detail cannot be established, use an explicit uncertainty
  note and name the missing evidence.
- Do not execute destructive commands or modify application source code as part of
  documentation generation.
- Keep generated documentation proportional to the evidence and complexity of the
  backend.
- Do not require a specific documentation directory or template filename.
- Do not require a specific architecture or framework.
- Respect the project's Mermaid conventions and existing template structure. If
  there is no local template or diagram convention, use Mermaid only when it
  materially clarifies the execution flow.

## Tools

### Required

Use repository file-search and file-reading tools to inspect:

- implementation
- configuration
- tests
- existing documentation
- local documentation templates

before editing documentation.

### Optional

- Version-control diff tools may be used to identify changed implementation and
  documentation areas for incremental updates.
- Language-aware search, static analysis, test runners, schema inspectors, or
  Mermaid validation may be used when available and safe to corroborate behavior.

Do not run builds, tests, servers, migrations, or external services when they are
not needed to establish documentation facts.

Never treat a tool's generated output as stronger evidence than the implementation
without checking its source.

## Composition

### Upstream Skills

Repository or software-analysis Skills may provide an inventory or architectural
analysis, but this Skill must verify claims against the code before documenting
them.

### Downstream Skills

Documentation QA or technical-writing Skills may review clarity, links, Mermaid
syntax, and formatting after this Skill produces the evidence-based content.

## Quality Criteria

The result is valid when:

- [ ] `docs/main.md` exists or was reviewed and updated only where implementation
      evidence justified a change.
- [ ] Each documented use case maps to a real entry point or confirmed application
      flow in the backend.
- [ ] Every endpoint, input, output, error, side effect, event, and integration is
      traceable to code, configuration, tests, or clearly labeled corroborating
      evidence.
- [ ] Unsupported facts are marked unresolved or omitted rather than invented.
- [ ] Existing valid documentation was preserved and contradictory content was
      corrected.
- [ ] The project's discovered documentation organization and local template or
      convention were respected.
- [ ] The general document links to the actual use-case documentation and its index
      is consistent.
- [ ] Every use case contains a flow diagram when its local template or convention
      calls for one, or when no such contract exists and a diagram materially
      clarifies the flow.
- [ ] Every flow diagram reflects the actual implementation path.
- [ ] Diagram nodes and relationships are supported by implementation evidence.
- [ ] Meaningful validations, decisions, integrations, persistence operations,
      events, and error paths are represented when they exist.
- [ ] Mermaid follows the project's local visual and structural conventions when
      such conventions exist.
- [ ] The prose and diagram describe the same execution flow.
- [ ] Generated examples do not misrepresent undocumented contracts as facts.
- [ ] The change summary identifies meaningful updates and remaining evidence gaps.

## Examples

### Example 1 — Documenting a REST use case

**Input**

A backend exposes `POST /orders`, whose route applies an authentication
middleware, validates a `CreateOrderDto`, calls `CreateOrder`, persists through
`OrderRepository`, and publishes `OrderCreated`.

**Expected behavior**

Trace that route through the actual controller, application service, domain
objects, repository, and event publisher.

Document only the fields and status or error contracts confirmed by validators,
implementation, schemas, or tests.

Generate the use-case flow diagram showing the actual execution path, including
authentication, validation, order creation, persistence, event publication, and
the final response when those behaviors are confirmed by the implementation.

Link the use case from `docs/main.md` and omit sections for components not present.

### Example 2 — Missing evidence

**Input**

A controller calls `PaymentGateway`, but the repository contains no provider
configuration, implementation, tests, or response contract.

**Expected behavior**

Document the observed call as an external dependency.

Identify the available evidence and mark provider details, authentication,
timeout behavior, and failure mapping as unresolved.

Do not invent a provider, payment flow, or error code.

If the flow diagram includes the external dependency, represent only the confirmed
call to `PaymentGateway` and do not infer the underlying provider.

### Example 3 — Existing diagram requires synchronization

**Input**

An existing use-case document contains a Mermaid diagram showing:

```text
Controller
  ↓
UseCase
  ↓
Repository
  ↓
Database
```

The current implementation now performs an authorization check and publishes an
event after persistence.

**Expected behavior**

Update the documentation and diagram to reflect the current implementation.

The resulting flow should include the confirmed authorization step and event
publication.

Remove or update any obsolete flow elements.

Do not modify unrelated documentation.

## Validation

Before returning the result:

1. Verify that the requested backend scope and current documentation structure were
   inspected.

2. Verify that the implementation inventory and use-case traces are based on real
   relationships rather than naming conventions alone.

3. Verify that `docs/main.md` and the discovered use-case documents contain only
   applicable, evidence-backed sections.

4. Verify that changed documentation preserves valid existing information and
   removes or qualifies contradicted claims.

5. Verify that all documented contracts, errors, side effects, events,
   integrations, and dependencies can be traced to evidence or are explicitly
   unresolved.

6. Verify that every use case requiring a flow diagram contains a Mermaid diagram.

7. Verify that every Mermaid diagram reflects the actual implementation flow.

8. Verify that diagram decisions, branches, persistence operations, events,
   integrations, success paths, and relevant error paths are supported by code.

9. Verify that the diagram follows the project's local Mermaid conventions when
   those conventions exist.

10. Verify that the prose and diagram are consistent with each other.

11. Verify that links, paths, indexes, and diagrams are consistent where validation
    is available.

12. Verify that the final change summary includes unresolved evidence gaps.

> This Skill documents implemented backend behavior. It does not define a future
> architecture or replace a formal API specification.
