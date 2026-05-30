# Delta Spec: Superadmin Companies — Fix Plan Select Inline Editing

## Context

En el panel de superadministrador (`/bo/superadmin/central-management`), la tabla de empresas permite editar inline campos como nombre, slug y plan. El campo plan usa un `p-select` de PrimeNG dentro de una celda editable (`p-cellEditor`). La tabla tiene `responsiveLayout="scroll"`, lo que fuerza `overflow-x: auto` en el wrapper de PrimeNG. Esto crea un *clipping context* que corta el dropdown del `p-select`, impidiendo seleccionar un plan.

Este es un bug conocido documentado en las reglas del proyecto: `p-select` dentro de contenedores con scroll tiene problemas de posicionamiento.

---

## ADDED Requirements

### REQ-SA-PLAN-001: Eliminación de inline editing para el campo Plan
- **SHALL** eliminarse el `p-cellEditor` de la columna "Plan" en la tabla de empresas.
- **SHALL** la columna Plan mostrar únicamente el badge del plan actual (output existente).
- **Scenario**: Given una fila de empresa en la tabla, When se activa el modo edición, Then el campo Plan NO muestra un `p-select` inline.

### REQ-SA-PLAN-002: Botón de editar abre dialog de empresa
- **SHALL** el botón de editar (lápiz) en cada fila de empresa abrir el `p-dialog` de edición de empresa (`companyDialogVisible`).
- **SHALL** el dialog cargar los datos de la empresa seleccionada en `companyFormData` y `editingCompany`.
- **Scenario**: Given una fila de empresa, When el usuario hace click en el botón de editar, Then se abre el dialog "Editar Empresa" con los campos pre-cargados (nombre, slug, dirección, teléfono, plan).

### REQ-SA-PLAN-003: Eliminación de lógica de clonado de empresa
- **SHALL** eliminarse `clonedCompanies` signal y sus referencias si ya no se usa para ningún campo inline.
- **SHALL** eliminarse `onCompanyRowEditCancel` si ya no hay inline editing que requiera restaurar estado.
- **SHALL** eliminarse `onCompanyRowEditInit` si ya no se usa.
- **SHALL** eliminarse `onCompanyRowEditSave` si la edición inline de empresa ya no existe.
- **Scenario**: Given el componente TypeScript, When se refactoriza, Then no quedan métodos/signals de clonado de fila de empresa sin uso.

---

## MODIFIED Requirements

### REQ-SA-PLAN-004: Mantener inline editing solo para campos simples (opcional)
- **SHOULD** mantenerse el inline editing para nombre y slug si el equipo lo desea, usando inputs de texto que no sufren del bug de clipping.
- **Decision**: Para este fix, se elimina TODO el inline editing de la fila de empresa para simplificar y unificar la UX. La edición se hace exclusivamente por dialog.
- **Scenario**: Given una fila de empresa, When el usuario quiere editar, Then solo puede hacerlo a través del dialog, no inline.

---

## REMOVED Requirements

### REQ-SA-PLAN-005: Eliminación de directivas de edición inline en filas de empresa
- **SHALL** eliminarse `pInitEditableRow`, `pSaveEditableRow`, `pCancelEditableRow` de la tabla de empresas.
- **SHALL** eliminarse `editMode="row"` de la tabla de empresas si ya no se usa inline editing en ninguna columna.
- **SHALL** eliminarse `pEditableRow` del `tr` de la tabla de empresas.
