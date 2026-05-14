# ui Specification

## Purpose
TBD - created by archiving change global-primeng-select-styles. Update Purpose after archive.
## Requirements
### Requirement: Trigger del Select/Dropdown SHALL alinearse con design tokens
**El trigger de `.p-select` y `.p-dropdown` DEBE alinearse con los design tokens de inputs.**
- **SHALL** usar `background: var(--color-warm-white)` (#FFFFFF).
- **SHALL** usar `border: 1px solid var(--color-border)` (#E8E4DD).
- **SHALL** usar `border-radius: var(--radius-md)` (12px) como valor base global.
- **SHALL** usar `font-family: var(--font-body)` (DM Sans) explícitamente.
- **SHALL** tener altura consistente con otros inputs (~2.45rem o definida por padding).
- **SHALL** en estado `:hover` cambiar el borde a `var(--color-sage-light)` (#B8D4A3).
- **SHALL** en estado `.p-focus` cambiar el borde a `var(--color-sage)` (#9DC183) y agregar `box-shadow: 0 0 0 3px var(--color-sage-pale)`.
- **SHALL** en estado `.p-disabled` usar `opacity: 0.6` y `background: var(--color-linen)` (#F5F2ED), sin sombra de focus.

#### Scenario: Focus del trigger
**Given** un `p-select` cerrado  
**When** el usuario hace click o navega con teclado al trigger  
**Then** el trigger muestra borde `var(--color-sage)` y anillo de sombra `0 0 0 3px var(--color-sage-pale)`.

### Requirement: Panel Desplegable SHALL seguir el sistema de diseño
**El panel de opciones `.p-select-overlay` y `.p-dropdown-panel` DEBE seguir el sistema de diseño.**
- **SHALL** usar `background: var(--color-warm-white)` (#FFFFFF).
- **SHALL** usar `border: 1px solid var(--color-border)` (#E8E4DD).
- **SHALL** usar `border-radius: var(--radius-md)` (12px).
- **SHALL** usar `box-shadow: var(--shadow-lg)` para elevación.
- **SHALL** tener `margin-top: 4px` respecto al trigger.
- **SHALL** usar `font-family: var(--font-body)` (DM Sans).

#### Scenario: Panel con header estilizado
**Given** un `p-select` con `placeholder` configurado  
**When** el usuario abre el panel  
**Then** el header muestra fondo `var(--color-linen)` y borde inferior sutil.

### Requirement: Opciones del Panel SHALL tener estados interactivos consistentes
**Las opciones `.p-select-option` y `.p-dropdown-item` DEBEN tener estados interactivos consistentes.**
- **SHALL** tener `border-radius: var(--radius-sm)` (6px) por opción.
- **SHALL** tener `padding: var(--space-sm) var(--space-md)` (8px 16px).
- **SHALL** usar `font-size: 0.9375rem` (15px) y `color: var(--color-text-primary)` (#2C3E50).
- **SHALL** en estado `:hover` (no seleccionado, no disabled) usar:
  - `background: var(--color-sage-pale)` (#E8F0E0)
  - `color: var(--color-sage-dark)` (#7BA366)
- **SHALL** en estado `.p-select-option-selected` (seleccionado) usar:
  - `background: var(--color-sage-pale)` (#E8F0E0)
  - `color: var(--color-sage-dark)` (#7BA366)
  - `font-weight: 500`
- **SHALL** en estado `.p-disabled` usar `opacity: 0.5` y `cursor: not-allowed`.

#### Scenario: Hover sobre opción no seleccionada
**Given** un `p-select` desplegado con múltiples opciones  
**When** el usuario pasa el mouse sobre una opción no seleccionada  
**Then** la opción muestra fondo `var(--color-sage-pale)` y texto `var(--color-sage-dark)`.

#### Scenario: Opción seleccionada resaltada
**Given** un `p-select` con una opción previamente seleccionada  
**When** el usuario abre el panel  
**Then** la opción seleccionada muestra fondo `var(--color-sage-pale)`, texto `var(--color-sage-dark)` y `font-weight: 500`.

### Requirement: Iconos y Clear Button SHALL usar colores de texto secundario
**Los iconos dentro del trigger DEBEN usar los colores de texto secundario.**
- **SHALL** el icono desplegable (chevron) usar `color: var(--color-text-muted)` (#95A5A6).
- **SHALL** el botón de limpiar (clear) usar `color: var(--color-text-muted)` en estado normal y `var(--color-text-secondary)` en hover.

#### Scenario: Clear icon hover
**Given** un `p-select` con `showClear="true"` y una opción seleccionada  
**When** el usuario pasa el mouse sobre el icono de limpiar  
**Then** el icono cambia a `color: var(--color-text-secondary)`.

### Requirement: Alineación de Border-Radius SHALL ser consistente en filtros
**En la barra de filtros de `/bo/appointments`, todos los controles DEBEN compartir el mismo border-radius.**
- **SHALL** el input de búsqueda, el datepicker y los selects usar `border-radius: var(--radius-md)` (12px).
- **SHALL** eliminarse cualquier override local que fuerce un border-radius diferente (ej. 20px en el input de búsqueda).

#### Scenario: Filtros de appointments alineados
**Given** la página `/bo/appointments`  
**When** se renderiza la barra de filtros  
**Then** el input de búsqueda, el datepicker y los tres selects comparten el mismo `border-radius` visual (12px).

#### Scenario: Dropdown legacy consistente
**Given** un componente que aún usa `p-dropdown` (ej. superadmin-plans)  
**When** el usuario interactúa con el dropdown  
**Then** el trigger y el panel desplegable se ven idénticos a un `p-select` moderno.

