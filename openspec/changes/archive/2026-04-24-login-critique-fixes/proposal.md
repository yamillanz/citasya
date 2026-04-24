## Why

La página de login acumula problemas de accesibilidad críticos (labels mal vinculados, campos sin autocomplete) y elementos visuales que restan credibilidad (social proof genérico, decoración excesiva). Estos issues fueron identificados en un critique exhaustivo. Se abordarán en dos fases: primero lo crítico (P1), luego el pulido visual (P2).

## What Changes

- **Fase 1 (Crítico)**: 
  - Eliminar el enlace "¿Olvidaste tu contraseña?" (dead link con `href="#"`)
  - Arreglar vinculación de labels a inputs (`inputId`, `for` attributes)
  - Agregar `autocomplete` a email y password
  - Agregar indicación visual de campos obligatorios
- **Fase 2 (Visual/Distill)**:
  - Reducir decoración de fondo (blobs, shapes, grid)
  - Remover social proof con avatares genéricos ("MG", "CS", "AR")

## Capabilities

### New Capabilities
- `login-accessibility`: Formulario de login accesible con labels correctos, autocomplete y estados de error claros.

### Modified Capabilities
- (none)

## Impact

- Afecta únicamente `src/app/features/auth/components/login/*`
- Sin cambios en APIs, rutas o dependencias
- Sin breaking changes
