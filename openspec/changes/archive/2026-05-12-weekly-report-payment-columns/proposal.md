## Why

El reporte semanal tiene un dialog de detalle por empleado que muestra todas las citas del período. Con la nueva funcionalidad de pagos, el manager necesita ver en este detalle si cada cita fue pagada y cuándo, sin tener que ir al listado de citas a verificarlo.

## What Changes

- Agregar campos `is_paid` y `payment_date` al modelo `WeeklyDetailRow`
- Mapear los nuevos campos en `getEmployeeDetail` del `WeeklyReportService`
- Agregar columna "Pagado" (badge verde / "—") y columna "Fecha pago" (fecha corta / "—") a la tabla de detalle
- Incluir las columnas en la exportación CSV

## Capabilities

### New Capabilities
- (ninguna — es una extensión de funcionalidad existente)

### Modified Capabilities
- `weekly-report`: El dialog de detalle de empleado ahora incluye estado de pago y fecha de pago para cada cita.

## Impact

- **Model**: `WeeklyDetailRow` — nuevos campos `is_paid` y `payment_date`
- **Service**: `WeeklyReportService.getEmployeeDetail()` — mapear nuevos campos
- **Component**: `EmployeeDetailDialogComponent` — template, CSV export, helper de fecha
- **Tests**: `employee-detail-dialog.component.spec.ts`
