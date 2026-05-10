## Context

El contenedor `.header-actions` usa `display: flex` sin `flex-wrap`, y el contenedor padre `.calendar-header` en mobile tiene `align-items: stretch`. Esto hace que los botones PrimeNG se expandan horizontalmente ocupando todo el ancho disponible, generando un aspecto desproporcionado.

## Goals / Non-Goals

**Goals:**
- Evitar que los botones del header se estiren en mobile.
- Mantener los botones en una fila o que pasen a la siguiente si no caben.

**Non-Goals:**
- Cambiar el diseño de los botones en desktop.
- Modificar la funcionalidad de los botones.

## Decisions

1. **Agregar `flex-wrap: wrap` y `width: auto` en mobile.**
   - **Rationale**: Es la forma más simple y robusta de evitar el estiramiento sin cambiar el markup.
   - **Alternative considered**: Cambiar el HTML a una estructura de grid. Se descartó para no aumentar la complejidad del template.
