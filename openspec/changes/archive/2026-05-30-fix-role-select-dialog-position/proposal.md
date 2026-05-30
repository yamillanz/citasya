## Why

El componente `p-select` de PrimeNG utilizado para seleccionar el rol dentro del diálogo "Nuevo/Editar Usuario" presenta un bug conocido de posicionamiento: su panel desplegable se corta por los límites del `p-dialog`, dificultando la selección de opciones. Esto afecta directamente la usabilidad del flujo de gestión de usuarios en la vista de superadmin.

## What Changes

- Reemplazar el componente `p-select` del campo **Rol** en el diálogo de usuario por un **grupo de botones/card de selección** (grid de 3 opciones).
- Actualizar la lógica de binding para que el valor seleccionado se comunique mediante eventos `(click)` en vez de `ngModel` sobre el dropdown.
- Ajustar estilos locales del diálogo para soportar el nuevo patrón de selección visual.

## Capabilities

### New Capabilities
- `role-select-button-group`: Selección de rol mediante grupo de botones/cards dentro del diálogo de creación/edición de usuario.

### Modified Capabilities
- (Ninguno — no cambian requisitos funcionales, solo el componente de UI)

## Impact

- **Archivos afectados**:
  - `app-web/src/app/features/backoffice/superadmin/central-management/central-management.component.html`
  - `app-web/src/app/features/backoffice/superadmin/central-management/central-management.component.scss`
  - `app-web/src/app/features/backoffice/superadmin/central-management/central-management.component.ts`
- **Dependencias**: Se elimina la importación de `SelectModule` de PrimeNG en el componente.
