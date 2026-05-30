## Why

El checkbox "Puede actuar como empleado" dentro del diálogo de creación/edición de usuario aparece sin texto junto a él. El atributo `label` de `p-checkbox` no renderiza correctamente el texto visible en esta versión de PrimeNG.

## What Changes

- Reemplazar el uso del atributo `label` en `p-checkbox` del diálogo de usuario por un elemento `<label>` HTML separado siguiendo el patrón existente del proyecto.

## Capabilities

### New Capabilities
- (Ninguno)

### Modified Capabilities
- (Ninguno)

## Impact

- `app-web/src/app/features/backoffice/superadmin/central-management/central-management.component.html`
- `app-web/src/app/features/backoffice/superadmin/central-management/central-management.component.scss` (ajuste de estilos del label)
