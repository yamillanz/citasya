# Tasks: Fix Superadmin Plan Select Inline

## Phase 1: Refactorizar tabla de empresas (HTML)

- [x] 1.1 Eliminar `p-cellEditor` de la columna Plan (líneas 99-109 del HTML)
  - Dejar solo el output: `<span class="plan-badge">{{ getPlanName(company) }}</span>`
- [x] 1.2 Eliminar `p-cellEditor` de las columnas Nombre y Slug (líneas 79-98 del HTML)
  - Dejar solo los outputs: `company.name` y `company.slug`
- [x] 1.3 Eliminar `editMode="row"` del `p-table` de empresas (línea 52)
- [x] 1.4 Eliminar `[pEditableRow]="company"` del `tr` (línea 72)
- [x] 1.5 Eliminar directivas `pInitEditableRow`, `pSaveEditableRow`, `pCancelEditableRow` de los botones de acción
- [x] 1.6 Cambiar el botón de editar (lápiz) para que llame a un método de abrir dialog en modo edición
  - Reemplazar `pInitEditableRow` por `(onClick)="openEditCompanyDialog(company)"`
- [x] 1.7 Eliminar el bloque `@else` de botones de edición inline (guardar/cancelar) ya que no habrá modo edición inline

## Phase 2: Refactorizar lógica TypeScript

- [x] 2.1 Eliminar signal `clonedCompanies` y su uso
- [x] 2.2 Eliminar signal `editingCompanyId` si no se usa en otro lugar
- [x] 2.3 Eliminar método `onCompanyRowEditInit`
- [x] 2.4 Eliminar método `onCompanyRowEditSave`
- [x] 2.5 Eliminar método `onCompanyRowEditCancel`
- [x] 2.6 Crear método `openEditCompanyDialog(company: CompanyWithPlan)`
  - Setear `editingCompany` con la empresa
  - Setear `companyFormData` con los datos de la empresa
  - Abrir `companyDialogVisible.set(true)`
- [x] 2.7 Verificar que `saveCompany()` funciona correctamente para edición (ya debería funcionar)

## Phase 3: Limpiar estilos

- [x] 3.1 Revisar `central-management.component.scss` y eliminar estilos de fila editable que ya no aplican
  - Ej: `.p-datatable-tbody > tr.p-datatable-editing-row > td`

## Phase 4: Verificación

- [x] 4.1 Compilar la aplicación sin errores (`ng build` o `ng serve`)
- [x] 4.2 Navegar a `/sa/management` (o la ruta correspondiente)
- [x] 4.3 Verificar que el badge del plan se muestra correctamente en la tabla
- [x] 4.4 Hacer click en editar (lápiz) y confirmar que abre el dialog con datos precargados
- [x] 4.5 Cambiar el plan en el dialog, guardar, y verificar que se actualiza en la tabla
- [x] 4.6 Verificar que no hay errores en consola del navegador
