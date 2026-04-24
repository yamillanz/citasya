## Why

La página de contacto muestra información de ubicación ficticia ("Ciudad de México, México") tanto en la lista de información de contacto como en una sección de mapa decorativa. Esta información no refleja la realidad del negocio (es un producto SaaS sin oficina física relevante para los usuarios) y genera confusión. La sección del mapa además añade clutter visual innecesario.

## What Changes

- Eliminar el item "Ubicación" de la lista de información de contacto en la columna lateral
- Eliminar toda la sección `.map-section` (mapa decorativo con pin + "Ciudad de México")
- Limpiar SCSS asociado a las secciones removidas

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- (none — cambio de UI puro, no afecta specs de comportamiento)

## Impact

- Afecta únicamente `src/app/features/landing/contact/*`
- Sin cambios en APIs, rutas o dependencias
- Sin breaking changes
