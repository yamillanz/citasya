## Why

El superadmin actualmente gestiona empresas y usuarios en vistas separadas (`/sa/companies` y `/sa/users`), lo que obliga a navegar entre páginas para ver los usuarios de una empresa. Se necesita una vista centralizada donde al seleccionar una compañía se muestren sus usuarios debajo, con edición inline (row editing) en ambas tablas y acciones masivas de activar/desactivar, mejorando la eficiencia operativa del superadmin.

## What Changes

- **Nueva vista unificada**: Reemplazar las rutas `/sa/companies` y `/sa/users` por una sola ruta `/sa/management` con una tabla de compañías y un panel de usuarios que aparece al seleccionar una compañía
- **Row editing inline**: Ambas tablas (companies y users) soportan edición directa en la fila usando PrimeNG `editMode="row"` con `pEditableRow`, `p-cellEditor`, `pInitEditableRow`, `pSaveEditableRow`, `pCancelEditableRow`
- **Selección masiva con checkboxes**: `p-tableCheckbox` y `p-tableHeaderCheckbox` en ambas tablas para permitir activate/deactivate en lote
- **Filtros avanzados**: Búsqueda por texto, filtro por estado (activo/inactivo), filtro por plan (solo companies)
- **Panel de usuarios contextual**: Al seleccionar una compañía, aparece un panel debajo de la tabla con los usuarios de esa compañía, editable y con toggle activate/deactivate
- **Diálogos de creación**: Mantener dialogs para crear nueva empresa y nuevo usuario (desde el panel de usuarios de la compañía seleccionada)
- **BREAKING**: Se eliminan las rutas `/sa/companies` y `/sa/users` y sus componentes asociados

## Capabilities

### New Capabilities
- `centralized-management`: Vista unificada del superadmin con tabla de compañías + panel de usuarios, edición inline, selección masiva, filtros, y acciones bulk

### Modified Capabilities
- `superadmin-companies`: Se elimina como vista independiente, su funcionalidad se integra en `centralized-management`
- `superadmin-users`: Se elimina como vista independiente, su funcionalidad se integra en `centralized-management`

## Impact

- **Rutas**: `/sa/companies` y `/sa/users` desaparecen, `/sa/management` es la nueva ruta
- **Sidebar**: Se reduce de 4 items a 3 (Gestión, Planes, Transacciones)
- **Componentes eliminados**: `SuperadminCompaniesComponent`, `SuperadminUsersComponent`
- **Componentes nuevos**: `CentralManagementComponent` (3 archivos: ts, html, scss)
- **Servicios existentes**: `CompanyService`, `UserService`, `PlanService` se reutilizan sin cambios
- **Modelos existentes**: `Company`, `User`, `Plan`, `CreateCompanyDto`, `CreateUserDto` se reutilizan sin cambios