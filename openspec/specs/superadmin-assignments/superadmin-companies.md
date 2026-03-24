# superadmin-companies Specification

## ADDED Requirements

### Requirement: Superadmin can view all companies
The system SHALL display a paginated list of all companies with their name, slug, plan, status, and creation date.

#### Scenario: Company list loads successfully
- **WHEN** superadmin navigates to `/sa/companies`
- **THEN** system displays a table with columns: Name, Slug, Plan, Status, Created
- **AND** table shows pagination with 10 companies per page

#### Scenario: Company list is searchable
- **WHEN** superadmin types in the search box
- **THEN** system filters companies by name or slug in real-time

### Requirement: Superadmin can create a company
The system SHALL allow superadmin to create a new company with name, slug, address, phone, and optional plan assignment.

#### Scenario: Create company form displays
- **WHEN** superadmin clicks "Nueva Empresa" button
- **THEN** system shows a dialog with fields: Name, Slug, Address, Phone, Plan (dropdown)

#### Scenario: Create company successfully
- **WHEN** superadmin fills all required fields and clicks "Guardar"
- **THEN** system creates the company in the database
- **AND** system shows success toast message
- **AND** system redirects to company list

#### Scenario: Create company with duplicate slug
- **WHEN** superadmin enters a slug that already exists
- **THEN** system shows validation error "El slug ya existe"

### Requirement: Superadmin can edit a company
The system SHALL allow superadmin to edit company details including name, address, phone, and plan assignment.

#### Scenario: Edit company form loads
- **WHEN** superadmin clicks "Editar" on a company row
- **THEN** system shows a dialog pre-filled with company data

#### Scenario: Update company successfully
- **WHEN** superadmin modifies fields and clicks "Guardar"
- **THEN** system updates the company in the database
- **AND** system shows success toast message

### Requirement: Superadmin can deactivate/reactivate a company
The system SHALL allow superadmin to toggle the active status of a company.

#### Scenario: Deactivate company
- **WHEN** superadmin clicks "Desactivar" on an active company
- **THEN** system shows confirmation dialog
- **AND** when confirmed, system sets is_active to false
- **AND** system shows success toast message

#### Scenario: Reactivate company
- **WHEN** superadmin clicks "Reactivar" on an inactive company
- **THEN** system shows confirmation dialog
- **AND** when confirmed, system sets is_active to true
- **AND** system shows success toast message

### Requirement: Company list shows status indicator
The system SHALL display a visual indicator for company active status.

#### Scenario: Active company shows green badge
- **WHEN** company has is_active = true
- **THEN** system displays a green "Activo" badge

#### Scenario: Inactive company shows gray badge
- **WHEN** company has is_active = false
- **THEN** system displays a gray "Inactivo" badge
