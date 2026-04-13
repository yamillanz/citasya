## Why

Los managers necesitan un reporte semanal que muestre el rendimiento de cada empleado: total de citas completadas, montos cobrados y comisiones correspondientes. Actualmente no existe forma de ver esta información consolidada ni de exportarla a otros sistemas contables. La comisión por servicio tampoco está modelada en la base de datos.

## What Changes

- Agregar campo `commission_percentage` a la tabla `services` (migration + modelo TypeScript)
- Crear vista de Reporte Semanal en `/bo/reports/weekly` con tabla resumen por empleado
- Crear modal de detalle por empleado (`p-dialog`) mostrando todas las citas del rango (incluyendo pendientes, canceladas, no_show)
- Filtros: rango de fechas (default: semana actual lun-dom) y empleado (opcional, default: todos)
- Exportación CSV del resumen y CSV del detalle desde el modal
- Agregar sección "Reportes" en el sidebar del backoffice manager

## Capabilities

### New Capabilities
- `weekly-report`: Reporte semanal por empleados con resumen de citas, montos y comisiones, filtro por fecha y empleado, modal de detalle y exportación CSV
- `service-commission`: Campo de porcentaje de comisión en servicios, permitiendo calcular la porción que corresponde a cada empleado

### Modified Capabilities
- `appointment-management`: Se agrega la capacidad de consultar citas agrupadas por empleado en un rango de fechas con totales calculados (monto total y comisión)

## Impact

- **Base de datos**: Nueva migration agregando `commission_percentage` a tabla `services`
- **Modelos**: Modificación de `service.model.ts`, nuevo `weekly-report.model.ts`
- **Servicios**: Nuevo `weekly-report.service.ts`, modificación de `appointment.service.ts` para consultas agrupadas
- **Componentes**: Nuevos `WeeklyReportComponent` y `EmployeeDetailDialogComponent`
- **Rutas**: Nueva ruta `/bo/reports/weekly` en `manager.routes.ts`
- **Sidebar**: Nuevo item "Reportes" en `backoffice.component.ts`
- **Dependencias_front**: Sin nuevas dependencias (PrimeNG `p-table`, `p-dialog`, `p-calendar`, `p-dropdown` ya disponibles)