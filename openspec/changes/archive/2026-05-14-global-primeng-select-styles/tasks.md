# Tasks: Estilos Globales PrimeNG Select y Dropdown

## Phase 1: Refinar Overrides de `p-select` en `styles.scss`

- [x] **1.1** Abrir `app-web/src/styles.scss` y localizar la sección `.p-select` (líneas ~861-888).
- [x] **1.2** Agregar `font-family: var(--font-body) !important;` al bloque `.p-select`.
- [x] **1.3** Verificar que `.p-select-label` tenga `font-size: 0.9375rem`, `color: var(--color-text-primary)`, y `line-height: 1.5`.
- [x] **1.4** Refinar `.p-select-trigger` para que use `color: var(--color-text-muted)`.
- [x] **1.5** Agregar estilos para `.p-select.p-disabled`:
  - `opacity: 0.6 !important;`
  - `background: var(--color-linen) !important;`
  - `cursor: not-allowed !important;`
  - Sin `box-shadow` de focus.
- [x] **1.6** Agregar estilos para `.p-select-clear-icon` (si existe el selector en PrimeNG):
  - `color: var(--color-text-muted) !important;`
  - En hover: `color: var(--color-text-secondary) !important;`

## Phase 2: Refinar Panel de `p-select` en `styles.scss`

- [x] **2.1** Localizar la sección `.p-select-panel` (líneas ~891-921).
- [x] **2.2** Agregar `font-family: var(--font-body) !important;` al bloque `.p-select-panel`.
- [x] **2.3** Verificar `.p-select-items` tenga `padding: var(--space-xs) !important;`.
- [x] **2.4** Refinar `.p-select-item`:
  - `border-radius: var(--radius-sm) !important;`
  - `margin: 2px 0 !important;`
  - `font-size: 0.9375rem !important;`
  - `color: var(--color-text-primary) !important;`
- [x] **2.5** Refinar hover de `.p-select-item` (no highlight, no disabled):
  - `background: var(--color-sage-pale) !important;`
  - `color: var(--color-sage-dark) !important;`
- [x] **2.6** Refinar estado `.p-highlight` de `.p-select-item`:
  - `background: var(--color-sage-pale) !important;`
  - `color: var(--color-sage-dark) !important;`
  - `font-weight: 500 !important;`
- [x] **2.7** Agregar estado `.p-disabled` para `.p-select-item`:
  - `opacity: 0.5 !important;`
  - `cursor: not-allowed !important;`

## Phase 3: Crear Overrides para `p-dropdown` Legacy en `styles.scss`

- [x] **3.1** Localizar la sección `.p-dropdown` (líneas ~926-953).
- [x] **3.2** Agregar `font-family: var(--font-body) !important;` al bloque `.p-dropdown`.
- [x] **3.3** Agregar estilos para `.p-dropdown.p-disabled` (mirror de `.p-select.p-disabled`).
- [x] **3.4** Crear nueva sección `.p-dropdown-panel` (después de `.p-dropdown`) como mirror completo de `.p-select-panel`:
  - Mismos valores de background, border, border-radius, box-shadow, margin-top, font-family.
- [x] **3.5** Crear reglas para `.p-dropdown-items` y `.p-dropdown-item` (mirror de `.p-select-items` y `.p-select-item`):
  - Mismos valores de padding, border-radius, margin, font-size, color.
  - Mismos estados hover, p-highlight, y p-disabled.
- [x] **3.6** Agregar estilos para `.p-dropdown-clear-icon` si aplica.

## Phase 4: Alinear Border-Radius en Filtros de Appointments

- [x] **4.1** Abrir `app-web/src/app/features/backoffice/manager/appointments/appointments.component.scss`.
- [x] **4.2** Localizar los estilos del input de búsqueda en la barra de filtros (probablemente `.search-box input` o similar).
- [x] **4.3** Cambiar `border-radius` del input de búsqueda de `var(--radius-lg)` (20px) a `var(--radius-md)` (12px).
- [x] **4.4** Verificar que el datepicker en la barra de filtros también use `var(--radius-md)`; si no, ajustarlo.
- [x] **4.5** Verificar que los selects (`.employee-filter`, `.status-filter`, `.date-filter`) mantengan `var(--radius-md)` (ya debería venir de `styles.scss`).
- [x] **4.6** Eliminar cualquier override local de border-radius en los filtros que fuerce un valor diferente.

## Phase 5: Verificación Visual y QA

- [x] **5.1** Ejecutar `ng serve` y navegar a `http://localhost:4200/bo/appointments`.
- [x] **5.2** Desplegar el filtro "Todos los empleados" y verificar:
  - Panel con fondo blanco, borde sutil, sombra suave.
  - Items con hover verde pálido + texto verde oscuro.
  - Item seleccionado resaltado con `font-weight: 500`.
- [x] **5.3** Hacer focus en el trigger del select y verificar anillo verde (`box-shadow`).
- [x] **5.4** Verificar que el input de búsqueda, datepicker y los tres selects compartan el mismo border-radius (12px).
- [x] **5.5** Abrir el diálogo "Nueva cita" y verificar el `p-select` de empleado.
- [x] **5.6** (Si es posible) Navegar a una página con `p-dropdown` legacy y verificar consistencia.
- [x] **5.7** Revisar que no haya regresiones visuales en otros componentes PrimeNG (tabla, paginator, dialog).
