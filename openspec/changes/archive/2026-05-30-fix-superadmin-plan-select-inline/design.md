# Design: Fix Superadmin Plan Select Inline

## Architecture Decisions

### Decision 1: Eliminar inline editing completo de la fila de empresa
- **Chose**: Eliminar todo el inline editing de la tabla de empresas (nombre, slug, plan) y usar solo el dialog.
- **Over**: Mantener inline editing para nombre/slug y solo quitar el del plan.
- **Because**: 
  - Simplifica el código drásticamente.
  - UX más consistente: todos los campos de empresa se editan en el mismo lugar.
  - Evita mantener dos caminos de edición (inline + dialog) para la misma entidad.
  - El dialog ya existe, está probado y no tiene el bug de clipping.

### Decision 2: No tocar la tabla de usuarios
- **Chose**: Dejar la tabla de usuarios sin cambios.
- **Over**: Aplicar el mismo fix a la tabla de usuarios (que tiene `p-select` de rol inline).
- **Because**: El scope del bug reportado es específicamente el select de planes en empresas. La tabla de usuarios puede tratarse en un fix separado si se reporta.

## Data Flow

1. Usuario hace click en botón editar (lápiz) de una fila de empresa.
2. Se ejecuta `openEditCompanyDialog(company)` (nuevo método o reutilizar lógica existente).
3. El método setea `editingCompany` con la empresa seleccionada y `companyFormData` con sus datos.
4. Se abre `companyDialogVisible = true`.
5. El usuario edita el plan (u otros campos) en el dialog.
6. Al guardar, se llama `saveCompany()` que ya existe y funciona.
7. Se recarga la lista de empresas.

## File Changes

| File | Action | Purpose |
|------|--------|---------|
| `central-management.component.html` | modified | Eliminar `p-cellEditor` de Plan, `pEditableRow`, directivas de edición inline, y cambiar botón editar para abrir dialog |
| `central-management.component.ts` | modified | Eliminar signals/métodos de clonado de empresa, agregar método para abrir dialog en modo edición |
| `central-management.component.scss` | modified | Limpiar estilos de fila editable si ya no aplican |

## Key Symbols

- `companyDialogVisible` (signal): Controla visibilidad del dialog.
- `editingCompany` (signal): Guarda referencia a empresa en edición.
- `companyFormData` (signal): Datos del formulario del dialog.
- `saveCompany()` (método existente): Guarda/actualiza empresa.
- `openCreateCompanyDialog()` (método existente): Abre dialog en modo creación. Se puede clonar/adaptar para edición.
