# Proposal: Estilos Globales para PrimeNG Select y Dropdown

## Intent
Los componentes `p-select` y `p-dropdown` de PrimeNG despliegan paneles de opciones con estilos por defecto que no concuerdan con el sistema de diseño de CitasYa (paleta de colores, tipografía, espaciado, border-radius y estados de interacción). Este cambio aplica overrides globales en `styles.scss` para que **todos** los selects y dropdowns del proyecto se rendericen consistentes con la guía de estilos `STYLES.MD`, sin necesidad de estilos locales por componente.

## Why
Los paneles desplegables de `p-select` en PrimeNG 20 muestran un fondo verde menta por defecto en el header, items sin estilo de hover consistente, y tipografía que no coincide con el sistema de diseño de CitasYa. Esto genera una experiencia visual fragmentada, especialmente en la barra de filtros de `/bo/appointments` donde el input de búsqueda, datepicker y selects tienen border-radius inconsistentes.

## What Changes
- Overrides globales en `styles.scss` para `.p-select`, `.p-select-overlay` (PrimeNG 20), `.p-dropdown` y `.p-dropdown-panel`.
- Corrección de selectores CSS de PrimeNG legacy a PrimeNG 20 (`.p-select-panel` → `.p-select-overlay`, `.p-select-item` → `.p-select-option`, `.p-highlight` → `.p-select-option-selected`).
- Alineación de `border-radius` en la barra de filtros de `/bo/appointments` (input de búsqueda de 20px a 12px).

## Scope

### In
- Overrides globales en `styles.scss` para:
  - `.p-select` (trigger, label, icono clear, estado focus/hover/disabled)
  - `.p-select-overlay` (fondo, borde, sombra, border-radius, header, lista, opciones)
  - `.p-dropdown` y `.p-dropdown-panel` (mismos estilos que `.p-select` para legacy)
- Alineación de `border-radius` en la barra de filtros de `/bo/appointments` para que input de búsqueda, datepicker y selects compartan el mismo radio.
- Especificación explícita de `font-family` heredada de los design tokens.
- Estados interactivos: hover, focus, selected, disabled.

### Out
- Migración de `p-dropdown` a `p-select` (se hará en un cambio posterior).
- Cambios de funcionalidad o lógica de negocio.
- Modificación de componentes individuales (salvo el ajuste de border-radius en appointments).

## Approach
1. Auditar los overrides actuales en `styles.scss` (líneas ~858-953).
2. Identificar que PrimeNG 20 usa clases CSS diferentes a las versiones anteriores (`.p-select-overlay` vs `.p-select-panel`).
3. Actualizar selectores CSS para coincidir con las clases reales de PrimeNG 20.
4. Aumentar especificidad con `body` prefix para sobreescribir estilos inline de PrimeNG.
5. Ajustar el `border-radius` de los filtros en `appointments.component.scss` para alinearlos.
6. Verificar compilación y aplicar estilos correctos.
