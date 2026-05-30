# Design: Fix Dialog Plan Select Overflow

## Architecture Decisions

### Decision 1: Usar appendTo="body" en vez de modificar estilos del dialog
- **Chose**: Agregar `[appendTo]="'body'"` al `p-select` del plan.
- **Over**: Aumentar la altura del dialog o modificar overflow del dialog con CSS custom.
- **Because**:
  - Es el fix oficial y documentado de PrimeNG para selects dentro de dialogs.
  - No requiere cambios de CSS globales que puedan afectar otros dialogs.
  - Es un cambio mínimo: un solo atributo en el template.
  - El proyecto ya tiene documentado que `p-select` dentro de contenedores con scroll/dialog tiene problemas de posicionamiento.

## Data Flow

Sin cambios — el binding `[(ngModel)]="companyFormData().plan_id"` y la lista `[options]="planOptions()"` permanecen idénticos. Solo cambia el elemento DOM donde se renderiza el overlay.

## File Changes

| File | Action | Purpose |
|------|--------|---------|
| `central-management.component.html` | modified | Agregar `[appendTo]="'body'"` al `p-select` del Plan en el dialog de empresa |

## Key Symbols

- `companyFormData().plan_id` (signal): Mantiene el plan seleccionado.
- `planOptions()` (computed): Mantiene la lista de planes disponibles.
- `saveCompany()` (método existente): Guarda el plan junto con los demás campos.
