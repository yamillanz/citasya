## Why

La página de precios actual tiene inconsistencias críticas de negocio (precios desactualizados: $25/$60 vs $29.99/$59.99), CTAs divergentes (algunos a `/signup`, otros a `/contact`), y un diseño genérico de "SaaS template" que no refuerza la marca **professional, efficient, trustworthy** de CitasYa. El usuario ha decidido que todos los CTA deben converger en el formulario de contacto.

## What Changes

- **Actualizar precios**: Básico $25 → $29.99, Medio $60 → $59.99
- **Simplificar estructura de planes**: De 3 planes a 2 planes con precio + sección enterprise "¿Necesitas más?"
- **Unificar CTAs**: Todos los botones de acción llevan a `/contact`
- **Rediseñar CTA final**: De 2 botones a 1 botón principal "Contáctanos para comenzar"
- **Reducir decoración**: Eliminar blobs animados excesivos (3→1 en hero, eliminar en FAQ)
- **Mejorar card Custom/Enterprise**: Clarificar valor proposition y unificar copy de botones
- **Ajustar estilos**: Eliminar gradientes en cards, usar tokens de diseño consistentes

## Capabilities

### New Capabilities
- (none — this is a redesign of existing UI)

### Modified Capabilities
- `landing-navigation`: Actualizar links de CTA en página de precios para apuntar a `/contact`
- `brand-identity`: Aplicar principio de "functional minimalism" — reducir decoración sin propósito
- `ui-consistency`: Unificar patrón de CTA (todos los botones de planes con mismo destino y copy)

## Impact

- `app-web/src/app/features/landing/pricing/pricing.component.html` — Reestructura de cards, precios, CTAs
- `app-web/src/app/features/landing/pricing/pricing.component.scss` — Limpieza de blobs, ajustes de estilo
- `app-web/src/app/features/landing/pricing/pricing.component.ts` — Posible ajuste de datos/estructura
