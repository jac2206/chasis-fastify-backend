# Arquitectura de referencia — Sistema de recompensas y lealtad

> **Estado: propuesta de referencia (2026-11-07), no implementada ni desplegada.** Se deriva del enunciado compartido por el usuario y de decisiones de diseño explícitas en este documento. No constituye una especificación final de reglas de negocio ni una configuración lista para producción.

## Propósito y alcance

Una plataforma de lealtad para retail que permite identificar clientes, registrar compras, acumular y redimir puntos, consultar historial/saldos y producir reportes. Los canales previstos son una SPA web, una aplicación móvil y los sistemas de venta/POS que originan compras.

Este paquete contiene una vista lógica de componentes y tres alternativas de infraestructura: AWS, Azure y Google Cloud. Son opciones independientes con equivalencias funcionales aproximadas, no un diseño multi-cloud activo. Las cuentas/proyectos/suscripciones, regiones, redes, capacidad, objetivos de servicio y costes quedan **TBD**. Todos los límites de despliegue llevan marca **PROPOSED**.

La propuesta reutiliza ideas del chasis Fastify (TypeScript, DDD/hexagonal, Zod/OpenAPI, PostgreSQL/Prisma, pruebas y logging) como orientación para implementar cada servicio, pero no afirma que el chasis actual ya contenga servicios de lealtad ni Kubernetes. En la revisión del 10 de noviembre de 2026 se observó el commit local `f0004af25decc95e9879514ededfcf1081e93e4a` y cambios sin confirmar; esta revisión no verificó un repositorio remoto ni atribuye los cambios locales a ese commit. El contexto del chasis implementado se documenta en [docs/main.md](../main.md).

## Requisitos de negocio recibidos

- Crear, consultar, activar y desactivar usuarios por tipo y número de documento o identificador interno.
- Configurar equivalencia monetaria/puntos; acumular por compra y permitir acumulación manual administrativa, sin valores negativos y con fecha/origen.
- Configurar redención; validar saldo suficiente, descontar puntos y evitar duplicados.
- Consultar movimientos por fecha y tipo; reportar acumulación, redención y top clientes; exportar CSV/PDF.
- Roles: administrador, operador y consulta.

El enunciado no especifica fórmula exacta, redondeo, moneda, vigencia/caducidad, reversos/devoluciones, límites, conciliación, política de conflictos de documentos ni retención. Esas reglas se deben decidir en una especificación SDD antes de implementar.

## Actores y límites del sistema

| Actor o sistema | Interacción propuesta | Estado |
|---|---|---|
| Cliente web SPA | Consulta perfil, saldo, movimientos y redenciones | Requisito del usuario; UX/contrato TBD |
| Aplicación móvil | Consume la misma API; distribución por tiendas móviles | Requisito del usuario; tiendas y autenticación TBD |
| POS / canal digital | Envía compras con identificador idempotente | Inferido del origen de compras; contrato y confianza TBD |
| Administrador / operador / consulta | Operaciones autorizadas por rol | Requisito; matriz rol-permiso TBD |
| Proveedor OIDC | Cognito, Microsoft Entra External ID o Google Identity Platform según alternativa | Opciones propuestas, no elegidas |

## Componentes y responsabilidades

| Componente | Responsabilidad propuesta | Persistencia / límite |
|---|---|---|
| SPA web y app móvil | Presentar experiencia de cliente y backoffice autorizado | Clientes independientes; la app móvil se distribuye fuera de la nube backend |
| API Gateway | Entrada HTTP(S), validación JWT/OIDC, scopes, límites de tráfico y enrutamiento | No contiene reglas de saldo |
| Customer Service | Alta, consulta y estado del cliente; identidad de negocio | Su propia base PostgreSQL |
| Rules Service | Equivalencias configurables y reglas aprobadas de acumulación/redención; RBAC administrativo | Su propia base PostgreSQL |
| Purchase & Accrual Service | Recibe compras, registra origen, evalúa reglas y solicita movimientos de acumulación | Su propia base PostgreSQL; idempotencia de compra |
| Loyalty Ledger Service | Fuente autoritativa del saldo e historial; movimientos append-only y ajustes controlados | Su propia base PostgreSQL; único dueño del saldo |
| Redemption Service | Orquesta solicitud/estado de redención y coordina reserva/consumo con Ledger | Su propia base PostgreSQL; saga/idempotencia |
| Reporting Service | Proyección de lectura eventual, top clientes, filtros y trabajos CSV/PDF | Su propia base PostgreSQL; no autoritativa |
| Event bus | Enruta eventos de dominio a consumidores desacoplados | EventBridge / Event Grid / Pub/Sub |
| Colas de consumidor | Buffer, reintentos, aislamiento y DLQ por consumidor | SQS / Service Bus queues / Pub/Sub subscriptions + dead lettering |
| Redis opcional | Cache-aside para lecturas derivadas o reglas de baja volatilidad cuando mediciones lo justifiquen | Instancia/aislamiento por servicio consumidor; nunca autoridad de saldo |

## Vista de componentes

Mermaid, Draw.io y el nuevo HTML Archify representan el flujo lógico propuesto con canales, proveedor de identidad y caché opcional; el HTML agrupa los canales en un único nodo. El HTML Archify anterior se conserva como artefacto histórico: no representa la relación entre el proveedor OIDC y el gateway y muestra la caché para Customer en lugar de Purchase & Accrual. Ninguna de estas vistas demuestra una implementación. Los servicios propuestos no acceden a bases de otros servicios: comparten datos mediante APIs/eventos. La arquitectura no presupone una transacción ACID distribuida.

- Compra: POS/canal → Gateway → Purchase & Accrual → Rules y Ledger → evento de dominio → Reporting.
- Redención: cliente → Gateway → Redemption → Ledger para reservar/consumir puntos; la coordinación entre almacenes se trata como saga con estado e idempotencia.
- Consultas de historial/saldo se sirven desde Ledger; los reportes agregados y exportaciones usan la proyección eventual de Reporting.
- Cada servicio persiste su propio estado en PostgreSQL. El diagrama representa seis límites de propiedad de datos; no obliga a seis proveedores o clusters físicos si el aislamiento lógico, credenciales y operación se diseñan explícitamente.

## Integridad, idempotencia y consistencia

1. **Ledger es la única fuente autoritativa del saldo.** Cada cambio se registra como movimiento inmutable; correcciones se modelan como movimientos compensatorios, una vez aprobada esa política.
2. **No permitir saldo negativo:** Ledger debe comprobar y aplicar el débito/reserva en una transacción local serializable/condicional que impida que solicitudes concurrentes gasten el mismo saldo.
3. **Evitar duplicados:** exigir claves idempotentes/identificadores externos únicos para compras, ajustes manuales y redenciones; el registro de idempotencia debe confirmarse en la misma transacción local que el efecto de negocio.
4. **Publicación fiable:** usar transactional outbox por servicio productor y relay hacia el bus; los consumidores asumen entrega al menos una vez, deduplican y guardan offset/idempotencia junto con sus cambios locales.
5. **Sin acceso cruzado a DB:** el servicio propietario ofrece una API o publica eventos; no se permiten joins o escrituras directas a una base ajena.
6. **Redención multi-servicio:** Redemption y Ledger no comparten transacción. Definir estados de reserva/confirmación/cancelación, timeout y compensación como saga antes de implementar; el ledger sigue siendo el árbitro del saldo.
7. **Reporting es eventualmente consistente:** no usar la proyección para autorizar un débito ni afirmar saldo en tiempo real.

Redis se añade por servicio solo para una necesidad medida (p. ej., cache de reglas/consultas de lectura), con TTL e invalidación definidos; nunca para escribir saldo de forma autoritativa ni para deduplicación durable.

## Eventos propuestos

Nombres ilustrativos sujetos a contrato/versionado: `PurchaseAccepted`, `PointsAccrued`, `PointsReserved`, `PointsRedeemed`, `PointsReservationCancelled`, `CustomerStatusChanged` y `LoyaltyRuleChanged`. El outbox conserva el evento junto al commit local. El bus enruta a una cola o suscripción por consumidor; cada cola debe definir reintento, backoff, retención, DLQ, alarmas, replay y propiedad. No se presupone orden global; particionar/ordenar por `customerId` solo si las reglas lo requieren.

## Alternativas de infraestructura

Las tres opciones usan Kubernetes administrado para desplegar los microservicios, gateway administrado, PostgreSQL administrado con propiedad por servicio, Redis administrado opcional y mensajería administrada. SPA se publica como contenido estático en una capa CDN/hosting global; la app móvil llega por el gateway y se distribuye por tiendas externas. Sistemas POS permanecen externos salvo una decisión posterior.

| Capacidad | AWS (preferida para el usuario) | Azure | Google Cloud |
|---|---|---|---|
| Kubernetes | Amazon EKS | Azure Kubernetes Service (AKS) | Google Kubernetes Engine (GKE) |
| API gateway | Amazon API Gateway HTTP API + VPC Link a ALB interno/EKS | Azure API Management + integración/red privada hacia AKS | Google Cloud API Gateway + backend GKE expuesto privadamente según patrón/red elegido |
| Identidad de usuario | Amazon Cognito User Pool; federación Google opcional | Microsoft Entra External ID u OIDC externo | Google Identity Platform u OIDC externo |
| JWT en gateway | Authorizer JWT/Cognito nativo para issuer configurado. Lambda authorizer solo para autorización custom/claims externos que el gateway no resuelva | APIM `validate-azure-ad-token` / `validate-jwt` | API Gateway JWT validation con issuer/JWKS/audience configurados |
| PostgreSQL | Amazon RDS for PostgreSQL; base/credencial aislada por microservicio | Azure Database for PostgreSQL Flexible Server; base/credencial aislada por microservicio | Cloud SQL for PostgreSQL; base/credencial aislada por microservicio |
| Redis opcional | Amazon ElastiCache for Valkey/Redis compatible, aislado por servicio consumidor | Azure Managed Redis (Azure Cache for Redis tiene retiro anunciado) | Memorystore for Redis |
| Event bus y colas | EventBridge + SQS por consumidor + DLQ | Event Grid + Service Bus Queue por consumidor + DLQ | Pub/Sub + subscription por consumidor + dead-letter policy |
| SPA web | S3 + CloudFront (+ WAF propuesto) | Azure Static Web Apps o Storage + Front Door/CDN (elección TBD) | Cloud Storage + HTTPS Load Balancer/Cloud CDN (elección TBD) |
| Infraestructura como código | CloudFormation (pedido por el usuario) | Bicep (Azure nativo) | Terraform o Infrastructure Manager; Deployment Manager no es opción nueva recomendada por su fin de soporte |

Son equivalencias de capacidad, no equivalencias exactas de producto ni garantía de idéntico comportamiento, cuotas, precio, red o disponibilidad. Región/cuenta/proyecto/subscription, topología Multi-AZ/zonal, tier/capacidad, redes y entornos son **TBD**.

## Autenticación y autorización

- SPA y móvil usan Authorization Code + PKCE con OIDC; evitar flujos implícitos y secretos cliente embebidos.
- AWS recomendado para la alternativa base: Cognito User Pool, opcionalmente federado con Google; API Gateway valida los tokens del issuer configurado sin Lambda authorizer. Si se aceptan tokens Google directamente, usar authorizer JWT para issuer/JWKS/audience compatibles; Lambda authorizer se reserva para lógica personalizada o claims/policies que no cubra la validación JWT nativa. No confiar en un token solo por decodificarlo.
- Azure: Entra External ID/issuer escogido y validación explícita de firma, issuer, audience y claims en APIM. Google puede ser proveedor federado si se elige esa configuración.
- Google Cloud: Identity Platform u otro OIDC; API Gateway valida JWT firmado con issuer, JWKS y audience configurados.
- Los roles administrador/operador/consulta y scopes se autorizan por operación. El gateway aporta autenticación y controles de entrada, pero cada servicio vuelve a aplicar autorización de dominio. POS/servicios técnicos necesitan identidad máquina-a-máquina y scopes propios.
- Definir ciclo de vida de cuenta, vinculación de documento, MFA, bloqueo, consentimiento y separación de tenants antes de implementación.

## Seguridad y operaciones por diseñar

Propuesta: TLS en todos los saltos, gateway público y servicios/databases privados, políticas de red Kubernetes, identidad workload-to-cloud sin credenciales estáticas, secretos administrados, cifrado administrado/en tránsito, RBAC de mínimo privilegio, auditoría de cambios y redenciones, rate limits, WAF, logs/trazas/métricas correlacionados, alertas en DLQ, backups y restauración probada. Todo lo anterior es una recomendación; no está configurado ni desplegado.

Antes de producción definir SLO/SLI, RPO/RTO, Multi-AZ/zonal, capacidad/autoescalado, retención/privacidad, recuperación ante desastre, estrategia de despliegue/rollback, coste y certificaciones requeridas.

## Icon inventory y tratamiento de servicios sin icono verificado

Los iconos verificados están colocados junto al nodo de infraestructura correspondiente (ya no como una fila de muestras separada); cada nombre de servicio sigue siendo texto editable. Los servicios sin glyph exacto verificado se muestran como tarjetas rotuladas; no son logotipos oficiales.

| Proveedor | Iconos usados | Tarjetas/fallbacks rotuladas |
|---|---|---|
| AWS | Stencils AWS4: API Gateway, EKS, RDS, EventBridge y SQS | Cognito, S3/CloudFront, ALB/VPC Link, ElastiCache Redis y CloudFormation aparecen como tarjetas con nombre editable |
| Azure | SVG embebidos del paquete de referencia de Microsoft: API Management, AKS, PostgreSQL Flexible Server, Event Grid y Service Bus | Entra External ID, Azure Managed Redis y Static Web Apps/Front Door aparecen como tarjetas |
| Google Cloud | SVG embebidos de ejemplos basados en la librería Google Cloud: GKE, Cloud SQL y Pub/Sub | API Gateway, Identity Platform, Memorystore y Cloud Storage/CDN aparecen como tarjetas |

La comprobación estructural reconoce el markup y las relaciones, pero no confirma visualmente el servicio representado por cada icono. No se abrieron los Draw.io en diagrams.net; por tanto, no se afirma revisión visual independiente. Ver [inventario de fuentes y decisiones](#fuentes-y-decisiones-de-proveedor).

En la revisión del 10 de noviembre de 2026, `check_drawio.py` no encontró errores en los cuatro Draw.io. AWS y componentes no produjeron advertencias; Azure y Google Cloud advirtieron que la detección de SVG embebidos no verifica por sí sola el proveedor ni la correspondencia del icono con el servicio. Se conserva el inventario anterior como referencia, sin afirmar una nueva inspección visual de esos SVG.

## Decisiones y preguntas abiertas

1. Precisar moneda, cálculo, redondeo, topes y versión/vigencia de reglas.
2. Definir caducidad, reversos de compra, devoluciones, anulaciones y correcciones de ledger.
3. Aprobar idempotency keys, orden por cliente, reservas de puntos, estados y compensaciones de la saga.
4. Elegir identidad (Cognito, Entra External ID, Google Identity Platform o federación) y matriz de roles/scopes.
5. Determinar si PostgreSQL es una instancia/cluster por servicio o bases/roles separados dentro de instancias administradas; el límite lógico de propiedad por servicio sí es obligatorio.
6. Definir catálogo/tipo de recompensas, inventario, vigencia, elegibilidad, límites y fulfillment físico/digital.
7. Especificar volúmenes, latencia, concurrencia, SLO, RPO/RTO, retención, datos personales y requisitos de auditoría/certificación.
8. Elegir región, entornos, conectividad con POS, patrón de ingress/API Gateway↔Kubernetes, red privada, WAF y despliegue IaC por proveedor.
9. Definir consumidores de eventos, schemas versionados, reintentos, DLQ, replay y responsable operativo.
10. Confirmar si AWS es la primera implementación y si Azure/Google son solo variantes futuras.

## Fuentes y decisiones de proveedor

- Requisitos funcionales: enunciado de sistema de recompensas aportado por el usuario en la conversación (fuente de requisitos, no evidencia de implementación).
- Arquitectura base Fastify: `.agents/context.md`, `.agents/architecture/backend.architecture.md`, `README.md` y `docs/main.md` (contexto del chasis local; HEAD `f0004af25decc95e9879514ededfcf1081e93e4a` y árbol de trabajo con cambios sin confirmar).
- AWS Cognito authorizer y API Gateway JWT: [Cognito authorizer para API Gateway REST](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html), [JWT authorizer para HTTP API](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html), [integraciones privadas/VPC Link](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-private.html).
- Azure JWT en API Management: [validar tokens Entra](https://learn.microsoft.com/en-us/azure/api-management/validate-azure-ad-token-policy) y [visión de autenticación/autorización APIM](https://learn.microsoft.com/en-us/azure/api-management/authentication-authorization-overview).
- Google Cloud API Gateway valida JWT Google/OIDC: [JWT de usuarios](https://docs.cloud.google.com/api-gateway/docs/authenticating-users-jwt) y [Google ID tokens](https://docs.cloud.google.com/api-gateway/docs/authenticating-users-googleid).
- Redis Azure: se propone Azure Managed Redis, considerando el retiro anunciado (no consumado) de Azure Cache for Redis; [FAQ oficial de retiro](https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/retirement-faq).
- Iconos: [paquete oficial AWS](https://aws.amazon.com/architecture/icons/), [Microsoft Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/icons/), [biblioteca oficial de iconos Google Cloud](https://cloud.google.com/icons).
- IaC: [CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html), [Bicep/Terraform en Azure](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/considerations/infrastructure-as-code-updates), [fin de soporte de Deployment Manager y migración en Google Cloud](https://docs.cloud.google.com/deployment-manager/docs/deprecations).

## Índice de artefactos

- [Componentes en Mermaid](component-diagram.mmd)
- [Componentes editables en Draw.io](component-diagram.drawio)
- [Infraestructura AWS propuesta](aws-infrastructure.drawio)
- [Infraestructura Azure propuesta](azure-infrastructure.drawio)
- [Infraestructura Google Cloud propuesta](google-cloud-infrastructure.drawio)
- Archify: [componentes alineados](component-diagram-aligned.html), [candidato de componentes](component-diagram-aligned.candidate.json), [AWS](aws-infrastructure.html), [Azure](azure-infrastructure.html) y [Google Cloud](google-cloud-infrastructure.html). La [vista anterior de componentes](component-diagram.html) se conserva como referencia histórica; los candidatos originales están en `../../.archify/architecture-rewards-reference-20261107-2230/` cuando esa carpeta está disponible.
- El resumen de `finalize` original para componentes quedó en estado `running`, por lo que ese recibo no demuestra una finalización completa. El 10 de noviembre de 2026 se ejecutó `finalize` para los cuatro candidatos originales en una carpeta local de revisión: las etapas `validate`, `deliver`, `check` y `browser-check` pasaron y los HTML resultantes tienen los mismos hashes SHA-256 que los HTML anteriores publicados aquí. También se creó y validó la vista de componentes alineada, con [resumen de validación](component-diagram-aligned.finalize-summary.json). La herramienta señaló cruces y desvíos en las cuatro vistas; esas advertencias requieren revisión visual. No se inspeccionaron visualmente los diagramas. Los recibos originales se conservan sin cambios; los de la revisión temporal están en `.archify/architecture-rewards-reference-review/` en el workspace revisado y esa carpeta puede no estar versionada.
- Diagrama previo del chasis: `../arquitectura.html` es una fotografía histórica de Express y no representa el servidor Fastify actual; consulta `../main.md` para el contexto vigente.
