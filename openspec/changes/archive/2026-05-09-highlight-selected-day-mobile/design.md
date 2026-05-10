## Context

FullCalendar no aplica automáticamente una clase CSS al día clickeado cuando se usa el callback `dateClick`. Para resaltar el día seleccionado, debemos:
1. Hacer que `calendarOptions` (computed) dependa reactivamente de `selectedDate()` para forzar re-renderizado.
2. Usar `dayCellClassNames` para agregar una clase `selected-day` cuando la fecha de la celda coincide con `selectedDate`.
3. Estilizar `.selected-day` en la media query mobile.

## Goals / Non-Goals

**Goals:**
- Proveer feedback visual inmediato al usuario sobre qué día está seleccionado.
- Usar el color primario de marca (`--color-sage`) para mantener consistencia visual.

**Non-Goals:**
- Cambiar el comportamiento de selección en desktop (ya funciona con fondo).
- Modificar la lógica de manejo de citas.

## Decisions

1. **Usar `box-shadow: inset` sobre `.fc-daygrid-day-frame` en lugar de `border` o `background`.**
   - **Rationale**: `box-shadow: inset` no afecta el layout (no cambia dimensiones), es visible sobre cualquier fondo (incluyendo `.has-apt`), y tiene buen soporte cross-browser. Se aplica sobre `.fc-daygrid-day-frame` (el contenedor interno de FullCalendar) para evitar problemas de renderizado en celdas de tabla.
   - **Alternative considered**: Usar `border`. Se descartó porque modificaría el box-model y podría desalinear las celdas.
   - **Alternative considered**: Usar `background`. Se descartó porque el color de fondo ya se usa para `.has-apt` (días con citas) y queremos distinguir ambos estados.
