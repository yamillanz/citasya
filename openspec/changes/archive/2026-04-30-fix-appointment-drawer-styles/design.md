## Context

El componente `appointments.component` utiliza un `p-drawer` de PrimeNG para gestionar la actualización de estado de las citas (completar, cancelar, no asistió). Actualmente, aunque el componente tiene algunos estilos bajo `:host ::ng-deep .status-drawer`, el drawer se renderiza con apariencia plana y sin coherencia visual respecto al resto del backoffice. Esto se debe a que los overrides de PrimeNG no están siendo aplicados correctamente o faltan reglas clave.

## Goals / Non-Goals

**Goals:**
- Aplicar estilos visuales consistentes al drawer de estado de citas.
- Usar design tokens (CSS custom properties) del proyecto.
- Mantener la estructura HTML existente; solo modificar estilos SCSS.

**Non-Goals:**
- No modificar la lógica del componente TypeScript.
- No cambiar el comportamiento funcional del drawer.
- No alterar otros componentes o páginas.

## Decisions

- **Solo modificar SCSS**: El bug es puramente visual; la estructura HTML del drawer ya es correcta.
- **Refinar ng-deep overrides**: Asegurar que `:host ::ng-deep .status-drawer` aplique fondo, bordes, sombras, y padding correctos siguiendo el patrón de PrimeNG overrides documentado en `STYLES.MD`.
- **Reutilizar patrones existentes**: Aplicar los mismos estilos de cards, botones y form inputs que ya se usan en otras partes del backoffice.

## Risks / Trade-offs

- **[Risk]** Los estilos `::ng-deep` pueden afectar otros drawers si no están suficientemente scopeados bajo `.status-drawer`.
  - **Mitigación**: Todas las reglas están anidadas bajo `.status-drawer`.
