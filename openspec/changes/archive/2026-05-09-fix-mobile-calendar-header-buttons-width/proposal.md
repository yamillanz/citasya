## Why

En la vista móvil del calendario del empleado, los botones del header ("Nueva Cita", refrescar, "Tu link") se estiran horizontalmente ocupando todo el ancho disponible, lo cual se ve desproporcionado y confuso.

## What Changes

- Ajustar `.header-actions` en mobile para usar `flex-wrap: wrap` y `justify-content: flex-start` en lugar de estirar los botones al 100% del ancho.
- Forzar `width: auto` en los botones PrimeNG dentro del header en mobile.

## Capabilities

### New Capabilities
- *(ninguno)*

### Modified Capabilities
- *(ninguno)*

## Impact

- `app-web/src/app/features/backoffice/employee/calendar/employee-calendar.component.scss`
