## Why

En la vista móvil del calendario del empleado en el backoffice, cuando un día tiene múltiples citas, el panel inferior que muestra el detalle de las citas del día seleccionado queda cortado por el viewport. El usuario no puede hacer scroll para ver las citas adicionales porque el contenedor padre tiene `overflow: hidden` y `max-height` fijo en mobile.

## What Changes

- Ajustar los estilos del componente `SharedCalendarComponent` (`calendar.component.scss`) para permitir scroll natural del contenido en vista móvil (`max-width: 768px`).
- Eliminar la restricción de `max-height` y `overflow: hidden` en `.calendar-wrapper` que recorta el panel de citas en mobile.
- Garantizar que `.appointments-card` y su `.card-content` mantengan `overflow-y: auto` para scroll interno si es necesario, pero sin ser limitados por el contenedor padre.

## Capabilities

### New Capabilities
- *(ninguno — es un bug fix de UI)*

### Modified Capabilities
- *(ninguno — no cambian requerimientos funcionales, solo CSS)*

## Impact

- `app-web/src/app/shared/components/calendar/calendar.component.scss`
- Solo afecta la vista móvil (`max-width: 768px`) del calendario compartido.
