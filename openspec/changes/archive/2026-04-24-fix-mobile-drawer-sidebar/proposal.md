## Why

El menú móvil de la landing page usa `p-dialog` de PrimeNG, que renderiza como un diálogo modal flotante con bordes redondeados. En mobile, esto deja ver todo el contenido de la landing page debajo del menú, creando una experiencia visual terrible y poco profesional.

## What Changes

- Reemplazar `p-dialog` por `p-drawer` de PrimeNG en el landing header.
- Ajustar imports, template y estilos para el nuevo componente drawer.
- Configurar el drawer para que ocupe toda la altura, deslice desde la derecha, y tenga backdrop con blur.

## Capabilities

### New Capabilities
- `landing-mobile-drawer`: Drawer lateral nativo para navegación mobile en la landing page.

### Modified Capabilities
- (Ninguno)

## Impact

- `landing-header.component.ts`: Cambio de import `DialogModule` → `DrawerModule`.
- `landing-header.component.html`: Reemplazo de `p-dialog` por `p-drawer`.
- `landing-header.component.scss`: Ajuste de estilos para drawer nativo.
