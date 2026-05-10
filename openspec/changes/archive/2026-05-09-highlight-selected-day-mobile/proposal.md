## Why

En la vista móvil del calendario, cuando el usuario selecciona un día, no hay ningún indicador visual que muestre cuál día está activo. Esto genera confusión porque el usuario no sabe si su clic fue registrado ni qué día está viendo en el panel de citas inferior.

## What Changes

- En `SharedCalendarComponent`, forzar re-renderizado de FullCalendar cuando `selectedDate` cambia, para que `dayCellClassNames` sea re-evaluado.
- En `getDayCellClassNames`, agregar clase `selected-day` a la celda del día que coincide con `selectedDate`.
- En `calendar.component.scss`, agregar estilo visual (box-shadow inset con color primario) para `.selected-day` dentro de la media query mobile.

## Capabilities

### New Capabilities
- `selected-day-highlight`: El día seleccionado en el calendario se resalta visualmente en vista móvil.

### Modified Capabilities
- *(ninguno)*

## Impact

- `app-web/src/app/shared/components/calendar/calendar.component.ts`
- `app-web/src/app/shared/components/calendar/calendar.component.scss`
- Solo afecta vista móvil (`max-width: 768px`).
