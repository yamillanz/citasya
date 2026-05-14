# Design: Estilos Globales PrimeNG Select y Dropdown

## Architecture Decisions

### Decision 1: Centralizar todos los overrides en `styles.scss`
**Chose**: Mantener y extender la sección existente de PrimeNG overrides en `styles.scss` (líneas ~858-953).  
**Over**: Crear un archivo SCSS parcial dedicado (ej. `_primeng-select.scss`) e importarlo.  
**Because**: El proyecto ya tiene un patrón establecido de overrides de PrimeNG en `styles.scss` (Dialog, DataTable, Paginator, DatePicker, etc.). Fragmentar en un parcial rompería la convención actual y dificultaría el descubrimiento. Además, `styles.scss` ya tiene ~950 líneas y está organizado por secciones comentadas.

### Decision 2: Aplicar estilos idénticos a `.p-select` y `.p-dropdown`
**Chose**: Duplicar las reglas SCSS para ambos selectores (moderno y legacy) con la misma estructura y valores.  
**Over**: Usar mixins o placeholders de Sass para compartir reglas.  
**Because**: El proyecto no usa extensivamente mixins/placeholders en `styles.scss` y la duplicación controlada (2 bloques de ~40 líneas cada uno) es más legible y mantenible para desarrolladores que no dominan Sass avanzado. Además, cuando se migre `p-dropdown` a `p-select`, el bloque legacy se eliminará fácilmente.

### Decision 3: Alinear border-radius a `var(--radius-md)` (12px) en toda la barra de filtros
**Chose**: Cambiar el input de búsqueda y el datepicker en `appointments.component.scss` de `var(--radius-lg)` (20px) a `var(--radius-md)` (12px).  
**Over**: Cambiar los selects a `var(--radius-lg)` (20px).  
**Because**: `STYLES.MD` define `--radius-md` como el estándar para inputs y controles de formulario. El input de búsqueda en appointments usaba 20px por un override local histórico, no por decisión de diseño. Alinear a 12px mantiene consistencia con todos los demás inputs del sistema (login, formularios de creación, etc.).

### Decision 4: No modificar la API o comportamiento de los componentes
**Chose**: Solo cambiar estilos CSS (colores, bordes, sombras, tipografía).  
**Over**: Envolver componentes PrimeNG o crear componentes proxy.  
**Because**: Es un cambio puramente visual. La API de `p-select` y `p-dropdown` no necesita cambiar. Un wrapper añadiría complejidad innecesaria y rompería el patrón de uso directo de PrimeNG establecido en el proyecto.

## Data Flow
Este cambio no involucra flujo de datos. Es puramente presentacional. Los estilos se aplican vía CSS global en el momento del renderizado del DOM.

## File Changes

| File | Action | Purpose |
|------|--------|---------|
| `app-web/src/styles.scss` | **MODIFY** | Extender/refinar secciones `.p-select`, `.p-select-panel`, `.p-dropdown`, `.p-dropdown-panel`. Agregar estados disabled, font-family explícito, y alinear hover colors con datepicker. |
| `app-web/src/app/features/backoffice/manager/appointments/appointments.component.scss` | **MODIFY** | Ajustar `border-radius` del input de búsqueda y datepicker en la barra de filtros de `var(--radius-lg)` a `var(--radius-md)`. |

## Key Selectors to Modify in `styles.scss`

### Existing (to refine):
- `.p-select` (líneas ~861-888)
- `.p-select-panel` (líneas ~891-921)
- `.p-dropdown` (líneas ~926-953)

### New (to add):
- `.p-dropdown-panel` (como mirror de `.p-select-panel`)
- `.p-dropdown-items` y `.p-dropdown-item` (como mirror de `.p-select-items` y `.p-select-item`)
- `.p-select.p-disabled` y `.p-dropdown.p-disabled`
- `.p-select-item.p-disabled` y `.p-dropdown-item.p-disabled`
- `.p-select-trigger` color refinado
- `.p-select-clear-icon` y `.p-dropdown-clear-icon`

## Reference Patterns from `styles.scss`
El patrón a seguir ya existe en `.p-datepicker`:
```scss
.p-datepicker .p-datepicker-calendar td.p-datepicker-today > span {
  background: var(--color-sage) !important;
  color: white !important;
}
.p-datepicker .p-datepicker-calendar td > span:not(.p-disabled):hover {
  background: var(--color-sage-pale) !important;
  color: var(--color-sage-dark) !important;
}
```
Este mismo contraste (pale background + dark sage text) se aplicará a los items del select.

## Verification Strategy
1. Abrir `/bo/appointments` y desplegar el filtro de empleados.
2. Verificar: fondo blanco del panel, borde sutil, sombra suave, items con hover verde pálido + texto verde oscuro.
3. Verificar: item seleccionado resaltado con `font-weight: 500`.
4. Verificar: trigger en focus tiene anillo verde.
5. Verificar: input de búsqueda y selects en la barra de filtros tienen el mismo border-radius.
6. Abrir un diálogo con `p-select` (ej. crear cita) y repetir verificación.
7. Si es posible, verificar un `p-dropdown` legacy (ej. `/bo/superadmin/plans`).
