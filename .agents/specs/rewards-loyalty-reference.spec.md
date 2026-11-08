# Sistema de recompensas y lealtad — especificación de referencia

## Estado

Propuesto. Esta especificación captura el enunciado y explicita preguntas pendientes; no autoriza implementar reglas aún no definidas.

## Objetivo y actor

Proponer un sistema de lealtad para una empresa retail omnicanal. Actores: cliente, administrador, operador, consulta, POS/canal digital y procesos de reportes.

## Reglas de negocio

| ID | Regla / requisito | Error / resultado |
|---|---|---|
| R-01 | Registrar/consultar clientes por tipo+número de documento o ID interno; activar/desactivar | Unicidad, formato y error de duplicado TBD |
| R-02 | Configurar equivalencia monetaria/puntos y acumular a partir de una compra | Fórmula, moneda, redondeo y vigencia TBD |
| R-03 | Permitir acumulación manual a un actor administrativo autorizado | Límites, motivo, aprobación y auditoría TBD |
| R-04 | No aceptar acumulaciones negativas | Rechazar con error de dominio; reversos no definidos |
| R-05 | Registrar fecha y origen para cada movimiento | Zona horaria, origen permitido y retención TBD |
| R-06 | Redimir solo con saldo suficiente y aplicar descuento de puntos | Débito atómico; insuficiencia no modifica saldo |
| R-07 | Evitar duplicar acumulación/redención | Clave idempotente y política de retención TBD |
| R-08 | Consultar movimientos por rango de fecha y tipo | Paginación, límites de rango y permisos TBD |
| R-09 | Reportar puntos acumulados/redimidos y top clientes; exportar CSV/PDF | Definición temporal de agregación y privacidad TBD |
| R-10 | Aplicar roles Administrador, Operador y Consulta | Matriz permiso-operación TBD |

## Contrato HTTP

Pendiente. La arquitectura propone API Gateway y APIs por servicio, pero rutas, payloads, errores, scopes, paginación y OpenAPI se definirán antes de implementar.

## Criterios de aceptación de la referencia arquitectónica

- Dado que la arquitectura se revisa, cuando se consulta el ownership de datos, entonces cada microservicio tiene una base PostgreSQL propia y ningún otro servicio escribe directamente en ella.
- Dada una compra repetida con la misma clave idempotente, cuando el servicio procesa el evento de nuevo, entonces no crea una segunda acumulación.
- Dadas redenciones concurrentes, cuando el saldo no alcanza para todas, entonces el Ledger impide que el saldo autorizado resulte negativo.
- Dado un evento confirmado localmente, cuando se publica, entonces el patrón outbox permite reintento y el consumidor puede deduplicar entrega repetida.
- Dada una consulta agregada de reportes, cuando aún no llegó el evento a la proyección, entonces se documenta la consistencia eventual y no se usa el reporte para validar saldo.
- Dado un microservicio sin necesidad medida de cache, cuando se despliega, entonces Redis puede omitirse sin cambiar el comportamiento de negocio.

Estos criterios describen objetivos de diseño, no pruebas ejecutadas.

## Decisiones y fuera de alcance

- Se propone ledger como fuente autoritativa de saldo, outbox/inbox-idempotency, y saga para la redención que cruza servicios.
- Se proponen AWS/EKS/API Gateway/Cognito + EventBridge/SQS/RDS PostgreSQL como primera variante para revisar; Azure y Google Cloud son mapeos alternativos.
- No se implementan servicios, infraestructura como código, esquemas Prisma, reglas concretas, ni endpoints.
- Pendiente decidir caducidad, reversos, devoluciones, moneda/redondeo, límites, recompensas y fulfillment, región/capacidad, SLO/RPO/RTO y permisos detallados.
