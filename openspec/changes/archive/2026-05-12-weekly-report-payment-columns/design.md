## Context

El dialog de detalle de empleado (`EmployeeDetailDialogComponent`) muestra una tabla con todas las citas de un empleado en el rango de fechas seleccionado. Actualmente tiene 8 columnas: Fecha, Hora, Cliente, Servicios, Monto, Monto Bs., Comisión, Estado.

Con la funcionalidad de pagos ya implementada, tiene sentido que el manager pueda ver desde este reporte qué citas ya fueron pagadas.

## Goals / Non-Goals

**Goals:**
- Mostrar estado de pago y fecha de pago en cada fila de la tabla de detalle
- Incluir ambos datos en la exportación CSV

**Non-Goals:**
- No se agregan filtros ni ordenamiento por columnas de pago
- No se modifica el reporte semanal principal (solo el dialog de detalle)

## Decisions

### 1. Columnas al final de la tabla
Se agregan después de "Estado" (columnas 9 y 10). Es la posición más natural porque extienden la información de estado de la cita.

### 2. Badge para "Pagado", texto "—" para no pagado
Sigue el mismo patrón visual que las otras columnas de estado en la app. "—" indica ausencia de dato sin llamar la atención.

### 3. Campos en el modelo WeeklyDetailRow
Se agregan directamente a la interfaz existente. No se crea un tipo separado porque son campos simples que aplican a todas las filas.

## Risks / Trade-offs

- **Ninguno significativo** — cambio puramente aditivo, sin impacto en funcionalidad existente.
