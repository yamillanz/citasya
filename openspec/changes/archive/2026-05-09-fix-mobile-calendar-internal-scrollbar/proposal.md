## Why

En la vista móvil del calendario del empleado, FullCalendar muestra una barra de scroll interna visible a la derecha del componente de calendario. Esto confunde al usuario, ya que no es claro si debe hacer scroll en toda la página o solo dentro del calendario.

## What Changes

- Ocultar la barra de scroll interna del calendario (FullCalendar) en vista móvil (`max-width: 768px`).
- Mantener la funcionalidad de scroll si el calendario necesita más espacio, pero sin mostrar la barra visualmente.
- Como fallback, evaluar limitar la altura del calendario para que no genere scroll interno.

## Capabilities

### New Capabilities
- `mobile-calendar-scroll`: El calendario no muestra scrollbar interno visible en mobile.

### Modified Capabilities
- *(ninguno)*

## Impact

- `app-web/src/app/shared/components/calendar/calendar.component.scss`
- Solo afecta vista móvil del calendario compartido.
