## Context

Tras el refactoring a sub-componentes, surgieron problemas de layout causados por Angular View Encapsulation: los estilos `.step-card` y `.card-header` definidos en el padre no se aplicaban a los hijos. Además, el formulario de contacto tenía labels desalineados y existía un bug de doble-submit.

## Goals / Non-Goals

**Goals:**
- Corregir todos los problemas de layout post-refactoring
- Prevenir doble-submit en el formulario de contacto
- Alinear con el sistema de diseño (CSS custom properties)
- Agregar responsive breakpoints

**Non-Goals:**
- Rediseñar el flujo de booking
- Cambiar la arquitectura de componentes
- Agregar nuevas features

## Decisions

### Decision 1: Mover `.step-card` y `.card-header` a cada hijo
Cada sub-componente define sus propios estilos de card y header en su SCSS local.

**Alternativa considerada**: `::ng-deep` en el padre — descartado porque está deprecado y es anti-pattern.

### Decision 2: Label fuera de `.input-wrapper`
Los labels del formulario de contacto se mueven fuera del wrapper para que `.form-field` (flex-column) los apile verticalmente sobre los inputs full-width.

**Alternativa considerada**: Cambiar `.input-wrapper` a `flex-wrap: wrap` — descartado porque rompe el layout de iconos.

### Decision 3: `isSubmitting` flag con reset automático
El child component usa un flag `isSubmitting` que se resetea después de 1 segundo, suficiente para que el padre setee su `loading()` signal.

**Alternativa considerada**: `BehaviorSubject` — descartado porque signals son más simples y el proyecto ya usa signals.

## Risks / Trade-offs

- **[Risk]** Duplicación de estilos `.step-card` en 3 archivos → **Mitigation**: Si divergen, mover a `styles.scss` global con selector específico
- **[Trade-off]** 1 segundo de delay en reset de `isSubmitting` → **Acceptable**: El padre toma el control inmediatamente, el flag del hijo es solo un safety net
