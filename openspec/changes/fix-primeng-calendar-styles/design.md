## Context

El proyecto CitasYa usa PrimeNG v20 con el preset de tema `Aura` configurado en `app.config.ts`. Los estilos de override para componentes PrimeNG se definen globalmente en `app-web/src/styles.scss`. Actualmente existen overrides básicos para `p-datepicker`, pero el calendario desplegable se ve con estilos genéricos de PrimeNG en lugar de la paleta Verde Salvia de la aplicación. Esto afecta la consistencia visual en todas las pantallas que usan selección de fechas.

El sistema de theming de PrimeNG v20 usa `@primeuix/themes` con CSS layers. Los overrides globales en `styles.scss` deben usar `!important` y selectores específicos para sobreescribir los estilos del tema.

## Goals / Non-Goals

**Goals:**
- Aplicar la paleta de colores y tipografía de CitasYa al componente `p-datepicker` de PrimeNG
- Asegurar que el calendario desplegable sea visualmente consistente con el resto de la aplicación
- Mantener la funcionalidad y accesibilidad del componente
- Que el fix aplique globalmente a todos los datepickers de la app sin modificar componentes individuales

**Non-Goals:**
- No se modificará la funcionalidad del datepicker (solo estilos visuales)
- No se cambiará el tema base de PrimeNG (Aura)
- No se modificarán componentes individuales que usan el datepicker

## Decisions

**1. Usar estilos globales en `styles.scss` en lugar de `:host ::ng-deep` en componentes**
- Rationale: El panel del datepicker (`p-datepicker-panel`) se renderiza en el `<body>` (overlay), fuera del árbol de componentes Angular. Los estilos con `:host ::ng-deep` en un componente no afectarían al panel. Los estilos globales en `styles.scss` sí lo hacen.
- Alternativa considerada: Crear un directive o service para inyectar estilos dinámicamente. Rechazada por ser innecesariamente compleja para un fix de estilos.

**2. Usar `!important` en los overrides**
- Rationale: El tema Aura de PrimeNG v20 tiene alta especificidad y usa CSS variables internas. `!important` asegura que los estilos de la aplicación prevalezcan.
- Nota: Esta es la convención ya establecida en el proyecto para todos los overrides de PrimeNG.

**3. Conservar los estilos existentes y mejorarlos en lugar de reemplazarlos**
- Rationale: Los estilos actuales ya tienen una base funcional. Es más seguro y mantenible extenderlos y corregir los gaps visuales identificados.

## Risks / Trade-offs

**[Riesgo]** Los futuros upgrades de PrimeNG podrían cambiar las clases CSS internas, rompiendo los overrides.
→ **Mitigación**: Los estilos usan selectores estándar de PrimeNG (`p-datepicker-*`) que son relativamente estables entre versiones. Si cambian, el fix es localizado en un solo archivo.

**[Riesgo]** El uso extensivo de `!important` dificulta futuras personalizaciones puntuales.
→ **Mitigación**: Se limita `!important` solo a los overrides de PrimeNG en `styles.scss`, siguiendo la convención existente del proyecto.

**[Trade-off]** Los estilos globales afectan TODOS los datepickers. No se puede personalizar por instancia sin crear clases adicionales.
→ **Aceptación**: Esto es deseable para mantener consistencia visual. Si en el futuro se necesita un datepicker con estilos diferentes, se puede usar una clase CSS específica en el componente.

## Migration Plan

No aplica. Este es un fix de estilos puro sin cambios en datos ni APIs. El despliegue es inmediato al hacer build de la aplicación.

## Open Questions

Ninguna. El alcance y la implementación son claros.
