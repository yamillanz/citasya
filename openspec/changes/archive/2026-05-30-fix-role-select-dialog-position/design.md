## Context

En la vista `/sa/management` del panel de superadmin, el diálogo para crear o editar usuarios contiene un campo **Rol** implementado con `p-select` de PrimeNG. Este componente despliega un panel flotante (`p-overlay`) que se renderiza fuera del árbol del diálogo, pero debido a restricciones de `overflow` y posicionamiento relativo del `p-dialog`, el panel aparece cortado y dificulta la selección.

Este es un bug conocido documentado en las reglas del proyecto: *"p-select dentro de p-dialog con scroll tiene problemas de posicionamiento"*. La solución recomendada es reemplazar el dropdown por un patrón de selección inline (grid de botones/cards) cuando las opciones son pocas.

## Goals / Non-Goals

**Goals:**
- Eliminar el dropdown `p-select` del campo Rol en el diálogo de usuario.
- Implementar un grupo de botones/card de 3 opciones (Superadmin, Manager, Empleado) que sea completamente accesible y no sufra problemas de posicionamiento.
- Mantener el comportamiento existente del formulario, incluyendo la aparición condicional del checkbox "Puede actuar como empleado" al seleccionar Manager.

**Non-Goals:**
- Modificar la lógica de guardado/validación del formulario.
- Cambiar el diseño de otros campos del diálogo.
- Refactorizar el componente `CentralManagementComponent` más allá del scope del fix.

## Decisions

**1. Reemplazar `p-select` por botones card en grid de 3 columnas**
- **Rationale**: Solo existen 3 roles fijos. Un grupo de botones inline elimina completamente el problema del overlay cortado, reduce interacciones (1 click vs 2) y es visualmente más claro.
- **Alternatives consideradas**: 
  - Usar `appendTo="body"` en `p-select` → Rechazado porque el proyecto ya documenta que este patrón no resuelve el bug en dialogs con scroll.
  - Usar `p-radioButton` → Rechazado porque el patrón de cards ofrece mejor área de click y alineación visual con el resto del diseño del formulario.

**2. Reutilizar `ngModel` sobre `userFormData().role` mediante evento `(click)`**
- **Rationale**: El formulario actual usa signals con `ngModel`. En lugar de refactorizar a Reactive Forms, mantenemos el patrón actual pero actualizamos la signal directamente desde el template con `(click)`.

## Risks / Trade-offs

- **[Risk]** El nuevo grupo de botones ocupa más espacio vertical que el dropdown. → **Mitigation**: El diálogo tiene altura suficiente (540px de ancho, altura flexible) y solo son 3 botones en una fila, por lo que el impacto es mínimo.
- **[Risk]** Estilo inconsistente con otros selects del sistema. → **Mitigation**: Aplicar los design tokens de color y border-radius del proyecto (`var(--color-sage)`, `var(--radius-md)`, etc.) para mantener coherencia visual.

## Migration Plan

No aplica — es un fix directo en el frontend sin cambios de datos ni APIs. Rollback: revertir el commit.
