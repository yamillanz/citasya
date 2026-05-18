## Why

En el enlace público de reserva de empleados (`/c/:company_slug/e/:employee_id`), el calendario permite seleccionar fechas pasadas (anteriores al día actual). Esto genera una experiencia de usuario confusa y podría permitir intentos de reserva en fechas inválidas, lo que resulta en errores o comportamientos inesperados al consultar disponibilidad.

## What Changes

- Bloquear la selección de fechas anteriores al día actual en el calendario FullCalendar del componente público `employee-calendar`
- Los días pasados no serán clickeables ni seleccionables visualmente
- Solo aplica al enlace público de reserva, no afecta el panel de administración (backoffice)

## Capabilities

### New Capabilities
- `public-calendar-date-restrictions`: Restricciones de fechas en el calendario público de reserva, bloqueando días pasados

### Modified Capabilities
<!-- No existing capabilities to modify -->

## Impact

- **Componente afectado**: `app-web/src/app/features/public/employee-calendar/employee-calendar.component.ts`
- **Configuración de FullCalendar**: Se agregará la opción `validRange` o `dateClick`/`select` validation para filtrar fechas pasadas
- **No breaking changes**: Solo se restringe una acción que no debería ser válida
