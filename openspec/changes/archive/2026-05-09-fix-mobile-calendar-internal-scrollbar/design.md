## Context

FullCalendar renderiza su propio contenedor de scroll (`.fc-scroller`) que muestra una barra de scroll nativa del navegador cuando el contenido excede la altura disponible. En desktop esto es aceptable, pero en mobile genera confusión porque aparece una barra de scroll vertical dentro del componente de calendario, además del scroll de la página.

## Goals / Non-Goals

**Goals:**
- Eliminar la barra de scroll visible dentro del calendario en mobile.
- Mantener la accesibilidad del calendario mediante scroll táctil/swipe.

**Non-Goals:**
- Rediseñar el calendario.
- Cambiar el comportamiento de scroll en desktop.

## Decisions

1. **Usar `scrollbar-width: none` y `::-webkit-scrollbar { display: none }` en mobile.**
   - **Rationale**: Es la solución CSS estándar para ocultar scrollbars en navegadores modernos (Firefox, Chrome, Safari, Edge) sin eliminar la funcionalidad de scroll táctil.
   - **Alternative considered**: Quitar `max-height` del calendario en mobile. Se descartó porque haría que el calendario ocupe mucho espacio vertical antes de llegar al panel de citas.
   - **Alternative considered**: Usar `overflow: hidden`. Se descartó porque cortaría el contenido del calendario si excede la altura.
