## Context

El componente `SharedCalendarComponent` (`calendar.component.scss`) define un layout de dos columnas en desktop (calendario + panel de citas) y una sola columna apilada en mobile. En mobile, el contenedor `.calendar-wrapper` tiene `overflow: hidden` y `max-height: calc(100vh - 140px)`, lo que recorta cualquier contenido que exceda esa altura. Como el calendario (`calendar-card`) tiene un `min-height: 420px` en mobile, el panel de citas (`appointments-card`) queda con muy poco espacio visible y las citas adicionales quedan fuera del viewport sin posibilidad de scroll.

## Goals / Non-Goals

**Goals:**
- Permitir que el usuario vea y haga scroll sobre todas las citas del día seleccionado en vista móvil.
- Mantener el comportamiento existente en desktop (sin cambios visuales ni funcionales).

**Non-Goals:**
- Rediseñar el layout del calendario.
- Modificar la lógica de selección de fechas o citas.
- Cambiar el comportamiento del diálogo de detalle de cita.

## Decisions

1. **Quitar `max-height` y `overflow: hidden` de `.calendar-wrapper` en mobile.**
   - **Rationale**: El scroll debe ser natural de toda la página, no confinado a un contenedor con altura fija. En mobile el layout es vertical, por lo que no tiene sentido limitar la altura del wrapper.
   - **Alternative considered**: Mantener `max-height` y poner `overflow-y: auto` en `.calendar-wrapper`. Se descartó porque generaría dos scrollbars anidados (uno en el wrapper y otro potencial en el calendario o el panel), degradando la UX en mobile.

2. **Mantener `overflow-y: auto` en `.appointments-card .card-content`.**
   - **Rationale**: Aunque el scroll principal será de página, es útil conservar el scroll interno del panel de citas en caso de que en algún contexto futuro el panel tenga altura restringida. En la práctica actual, al no haber `max-height` en el wrapper, el panel expandirá su altura naturalmente.

## Risks / Trade-offs

- **[Risk]** En pantallas muy pequeñas, el calendario puede ocupar mucho espacio antes de llegar al panel de citas.  
  → **Mitigation**: El `min-height: 420px` del calendario ya estaba establecido y el usuario ya acepta hacer scroll para ver el contenido inferior. Este fix solo elimina la barrera artificial que impedía ese scroll.
