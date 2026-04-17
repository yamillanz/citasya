# centralized-management Specification

## ADDED Requirements

### Requirement: Superadmin can view companies in a centralized table
The system SHALL display a paginated table of all companies with row inline editing, checkbox selection, and contextual filters. The table route SHALL be `/sa/management`.

#### Scenario: Centralized management page loads
- **WHEN** superadmin navigates to `/sa/management`
- **THEN** system displays the "Gestión Central" page with a companies table
- **AND** table shows columns: Checkbox, Nombre, Slug, Plan, Estado, Acciones
- **AND** pagination shows 10 companies per page with options for 25 and 50

#### Scenario: Companies table supports row editing
- **WHEN** superadmin clicks the edit (pencil) icon on a company row
- **THEN** the row converts to editable mode showing input fields for Nombre, Slug, and a dropdown for Plan
- **AND** save and cancel buttons replace the edit button
- **WHEN** superadmin clicks save
- **THEN** system updates the company in the database and shows success toast
- **WHEN** superadmin clicks cancel
- **THEN** system reverts all changes and returns to display mode

#### Scenario: Company filters work correctly
- **WHEN** superadmin types in the search box
- **THEN** system filters companies by name or slug in real-time
- **WHEN** superadmin selects a status filter (Activo/Inactivo/Todos)
- **THEN** system filters companies by is_active status
- **WHEN** superadmin selects a plan filter
- **THEN** system filters companies by plan_id

#### Scenario: Clear filters
- **WHEN** superadmin clicks "Limpiar filtros" in the empty state
- **THEN** system resets search term, status filter, and plan filter to defaults
- **AND** table shows all companies again

### Requirement: Superadmin can select companies for bulk actions
The system SHALL allow superadmin to select multiple companies via checkboxes and perform bulk activate/deactivate actions.

#### Scenario: Checkbox selection
- **WHEN** superadmin checks one or more company checkboxes
- **THEN** a bulk actions bar appears showing the count of selected items
- **AND** "Activar selección" and "Desactivar selección" buttons are displayed

#### Scenario: Bulk activate companies
- **WHEN** superadmin clicks "Activar selección" with inactive companies selected
- **THEN** system shows confirmation dialog with count of companies to activate
- **AND** when confirmed, system activates all selected inactive companies
- **AND** system shows success toast and clears selection

#### Scenario: Bulk deactivate companies
- **WHEN** superadmin clicks "Desactivar selección" with active companies selected
- **THEN** system shows confirmation dialog with count of companies to deactivate
- **AND** when confirmed, system deactivates all selected active companies
- **AND** system shows success toast and clears selection

#### Scenario: Select all companies with header checkbox
- **WHEN** superadmin checks the header checkbox
- **THEN** system selects all companies on the current page
- **WHEN** superadmin unchecks the header checkbox
- **THEN** system deselects all companies on the current page

### Requirement: Superadmin can view users of a selected company
The system SHALL display a users panel below the companies table when a company row is clicked. The users panel shows all users belonging to the selected company with inline editing and checkbox selection.

#### Scenario: Select a company to show its users
- **WHEN** superadmin clicks on a company row
- **THEN** the row is visually highlighted with a selected state
- **AND** a users panel appears below the companies table
- **AND** panel header shows "Usuarios de: [Company Name]" and user count
- **AND** users table displays columns: Checkbox, Nombre, Email, Rol, Estado, Acciones

#### Scenario: Click selected company again to deselect
- **WHEN** superadmin clicks the currently selected company row again
- **THEN** the users panel hides and company selection is cleared

#### Scenario: Switch selection to different company
- **WHEN** superadmin clicks a different company row while one is selected
- **THEN** the new company becomes highlighted and the users panel updates to show users of the new company

### Requirement: Superadmin can inline edit users
The system SHALL allow superadmin to edit user details directly in the users table using row editing mode.

#### Scenario: Edit user row
- **WHEN** superadmin clicks edit icon on a user row
- **THEN** editable fields appear: Nombre (input), Rol (dropdown with Superadmin/Manager/Empleado)
- **AND** Email column remains read-only
- **WHEN** superadmin clicks save
- **THEN** system updates the user and shows success toast
- **WHEN** superadmin clicks cancel
- **THEN** system reverts changes and returns to display mode

### Requirement: Superadmin can toggle user active status
The system SHALL allow superadmin to activate or deactivate individual users and bulk activate/deactivate selected users.

#### Scenario: Deactivate individual user
- **WHEN** superadmin clicks deactivate on an active user
- **THEN** system shows confirmation dialog
- **AND** when confirmed, system sets is_active to false and refreshes the users list

#### Scenario: Reactivate individual user
- **WHEN** superadmin clicks reactivate on an inactive user
- **THEN** system shows confirmation dialog
- **AND** when confirmed, system sets is_active to true and refreshes the users list

#### Scenario: Bulk activate users
- **WHEN** superadmin selects users via checkboxes and clicks "Activar selección"
- **THEN** system shows confirmation and activates all selected inactive users
- **AND** clears selection and refreshes users list

#### Scenario: Bulk deactivate users
- **WHEN** superadmin selects users via checkboxes and clicks "Desactivar selección"
- **THEN** system shows confirmation and deactivates all selected active users
- **AND** clears selection and refreshes users list

### Requirement: Superadmin can create a new company
The system SHALL provide a dialog to create a new company with name, slug, address, phone, and optional plan.

#### Scenario: Open create company dialog
- **WHEN** superadmin clicks "Nueva Empresa" button in the page header
- **THEN** system shows a dialog with empty fields: Nombre, Slug, Dirección, Teléfono, Plan

#### Scenario: Create company with auto-slug
- **WHEN** superadmin types a company name and moves to the next field
- **THEN** system auto-generates a slug from the name

#### Scenario: Create company successfully
- **WHEN** superadmin fills required fields and clicks "Guardar"
- **THEN** system creates the company and refreshes the companies table
- **AND** system shows success toast message

#### Scenario: Create company with duplicate slug
- **WHEN** superadmin enters a slug that already exists
- **THEN** system shows validation error "El slug ya existe"

### Requirement: Superadmin can create a new user for a selected company
The system SHALL provide a dialog to create a new user, pre-assigning them to the currently selected company.

#### Scenario: Open create user dialog
- **WHEN** superadmin clicks "Nuevo Usuario" button in the users panel header
- **THEN** system shows a dialog with fields: Email, Nombre completo, Teléfono, Rol
- **AND** company_id is pre-set to the selected company

#### Scenario: Create user successfully
- **WHEN** superadmin fills required fields and clicks "Guardar"
- **THEN** system creates the user and refreshes the users table
- **AND** system shows success toast message

#### Scenario: Create user with duplicate email
- **WHEN** superadmin enters an email that already exists
- **THEN** system shows validation error "El email ya existe"

### Requirement: Superadmin sidebar reflects centralized route
The system SHALL update the superadmin sidebar menu to show "Gestión" linking to `/sa/management` instead of separate "Empresas" and "Usuarios" items.

#### Scenario: Sidebar navigation
- **WHEN** superadmin views the sidebar
- **THEN** menu items are: Gestión (icon: pi-cog, route: /sa/management), Planes (icon: pi-credit-card, route: /sa/plans), Transacciones (icon: pi-dollar, route: /sa/transactions)

#### Scenario: Default redirect
- **WHEN** superadmin navigates to `/sa` with no sub-path
- **THEN** system redirects to `/sa/management`

### Requirement: Empty states are context-aware
The system SHALL show different empty states based on whether filters are active.

#### Scenario: No companies and no filters
- **WHEN** companies table is empty and no filters are applied
- **THEN** system shows "No hay empresas registradas" with "Crear Empresa" action button

#### Scenario: No companies with active filters
- **WHEN** companies table is empty because filters exclude all results
- **THEN** system shows "No se encontraron resultados" with "Limpiar filtros" action button

#### Scenario: No users for selected company
- **WHEN** a company is selected but has no users
- **THEN** system shows "Sin usuarios" with "Agregar Usuario" action button