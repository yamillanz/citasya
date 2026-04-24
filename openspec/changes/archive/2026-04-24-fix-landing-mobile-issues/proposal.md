## Why

El análisis de la landing page en versión mobile reveló múltiples problemas de diseño y usabilidad que afectan la primera impresión del usuario. El header tiene el logo pegado al borde sin margen, el menú drawer móvil está desproporcionado (texto gigante, botones enormes, header cortado), y existen patrones anti-AI (gradient text, side-stripe borders) que deben eliminarse para mantener la profesionalidad de la marca.

## What Changes

- Agregar padding horizontal al `.header-container` en mobile para evitar que el logo quede pegado al borde.
- Rediseñar el menú drawer móvil: ajustar tamaños de texto, padding, y header para que sea proporcionado y usable.
- Eliminar gradient text del headline hero (`headline-accent`) y reemplazar con color sólido.
- Eliminar side-stripe borders (`border-left: 3px solid`) de los mock appointments y reemplazar con indicador sutil.
- Corregir animación de `width` en nav-links para usar `transform: scaleX()` y evitar layout thrash.

## Capabilities

### New Capabilities
- `landing-mobile-polish`: Conjunto de mejoras de diseño y usabilidad para la landing page en dispositivos móviles.

### Modified Capabilities
- (Ninguno)

## Impact

- `landing-header.component.scss`: Padding en header mobile, ajustes de drawer mobile.
- `home.component.scss`: Eliminación de gradient text, side-stripe borders, fix de animación.
