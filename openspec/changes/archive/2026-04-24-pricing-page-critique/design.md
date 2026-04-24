## Context

La página de precios actual (`/pricing`) fue construida con un patrón genérico de 3 cards de SaaS que no refuerza la identidad de marca de CitasYa. Los precios están desactualizados ($25/$60), los CTAs son inconsistentes (algunos a `/signup`, otros a `/contact`), y la decoración excesiva (4 blobs animados) viola el principio de "functional minimalism" del Design Context.

## Goals / Non-Goals

**Goals:**
- Simplificar la oferta a 2 planes con precios claros ($29.99 y $59.99)
- Unificar todos los CTAs a `/contact`
- Reducir la carga cognitiva eliminando decoración innecesaria
- Mantener coherencia visual con el resto del landing (header, tokens de diseño)

**Non-Goals:**
- No cambiar la funcionalidad del FAQ (mantener accordion existente)
- No modificar el routing de la aplicación
- No agregar nuevas dependencias
- No cambiar la paleta de colores ni tipografía

## Decisions

**1. Estructura: 2 planes + enterprise CTA separado**
- **Decision**: En lugar de 3 cards (Básico, Medio, Custom), usar 2 cards con precio + una sección enterprise debajo.
- **Rationale**: Los 3 planes creaban confusión — el plan "Custom" sin precio era visualmente de segunda categoría. Separar enterprise como una sección distinta (no como card) clarifica que es una opción diferente, no un "plan inferior".
- **Alternatives considered**: Mantener 3 cards pero igualar prominencia — rechazado porque el usuario eligió explícitamente simplificar a 2.

**2. Botón único en CTA final**
- **Decision**: Un solo botón "Contáctanos para comenzar" en lugar de "Crear cuenta gratis" + "Hablar con ventas".
- **Rationale**: El usuario especificó que todos los CTA deben ir a `/contact`. Dos botones con el mismo destino generan confusión de elección sin valor.
- **Alternatives considered**: Mantener 2 botones con mismo destino — rechazado porque viola el principio de "no false choices".

**3. Reducción de blobs: 3 → 1**
- **Decision**: Eliminar todos los blobs excepto uno sutil en el hero.
- **Rationale**: Los blobs son puramente decorativos y no refuerzan la marca "professional, efficient, trustworthy". Un solo elemento sutil mantiene algo de personalidad sin distraer.
- **Alternatives considered**: Eliminar todos los blobs completamente — el usuario eligió mantener 1.

**4. Eliminar gradiente en card featured**
- **Decision**: La card "Medio" (más popular) usará fondo sólido con borde destacado en lugar de gradiente.
- **Rationale**: El gradiente `linear-gradient(135deg, sage → sage-dark)` rompe la coherencia del sistema de tokens. Un borde o shadow más prominente es suficiente para destacar.

## Risks / Trade-offs

- **[Risk]** La eliminación del plan "Custom" como card podría hacer que usuarios enterprise no encuentren la opción → **Mitigation**: La sección enterprise será visualmente prominente, con copy claro como "¿Necesitas más? Hablemos."
- **[Risk]** El cambio de precios ($25→$29.99, $60→$59.99) podría requerir actualización en otros lugares (DB, emails) → **Mitigation**: Este change solo toca UI; los precios reales de backend están fuera de scope.
- **[Risk]** El FAQ blob se elimina → la sección FAQ queda con fondo más plano → **Mitigation**: Usar un fondo sutil (linen/cream) para mantener separación visual.

## Migration Plan

No aplica — cambio de UI en un solo componente, sin impacto en datos ni APIs.

## Open Questions

(none — todas las decisiones fueron clarificadas por el usuario)
