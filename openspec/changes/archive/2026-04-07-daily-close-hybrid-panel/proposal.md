# Proposal: Daily Close Hybrid Panel

## Why

El flujo actual de cierre de citas diarias en `/bo/close` solo permite generar un reporte PDF pasivo. El manager necesita completar/cerrar citas una por una desde `/bo/appointments` sin ver totales acumulados por empleado. Esto fragmenta el flujo de trabajo y dificulta el seguimiento del rendimiento diario por empleado.

Se necesita una interfaz unificada donde el manager pueda:
1. Ver totales del día por empleado en tiempo real
2. Cerrar/completar citas (confirmar asistencia + monto) directamente
3. Buscar empleados rápidamente cuando hay muchos

## What Changes

- **Mejora del componente `DailyCloseComponent`**: Transformarlo de un simple generador de PDF a una herramienta de trabajo activa con panel split-view
- **Lista de empleados con buscador**: Panel izquierdo (30%) con búsqueda y scroll vertical para listas extensas
- **Detalle de citas por empleado**: Panel derecho (70%) muestra citas del empleado seleccionado con acciones de cierre inline
- **Cierre inline de citas**: Botones para Completar (con input de monto), No Asistió, Cancelar
- **Totales actualizados en tiempo real**: Cálculos reactivos al cambiar estado de citas
- **Navegación de fechas**: Flechas para día anterior/siguiente y calendario para saltar a fecha específica
- **Generación de PDF**: Mantener funcionalidad existente pero ahora después de cerrar citas

## Capabilities

### New Capabilities

- `daily-close-workbench`: Panel de control híbrido para cierre diario con lista de empleados, buscador, y acciones de cierre inline

### Modified Capabilities

- `daily-close-report`: El reporte PDF existente se mantiene pero ahora se usa después de completar las citas

## Impact

### Código Afectado

- `src/app/features/backoffice/manager/daily-close/daily-close.component.ts` — Refactor completo
- `src/app/features/backoffice/manager/daily-close/daily-close.component.html` — Nuevo layout split-view
- `src/app/features/backoffice/manager/daily-close/daily-close.component.scss` — Estilos para panel y scroll

### APIs y Servicios

- `AppointmentService` — Sin cambios (se usa `getByDate()` y `updateStatus()` existentes)
- `DailyCloseService` — Sin cambios (se usa generación de PDF existente)

### Datos

- Sin cambios en schema — usa campos existentes: `appointments.status`, `appointments.amount_collected`

### Dependencias

- PrimeNG: componentes existentes (`p-button`, `p-avatar`, `p-tag`, `p-datepicker`, `p-inputText`, `p-drawer`)
- Angular Signals para estado reactivo
- Sin nuevas dependencias