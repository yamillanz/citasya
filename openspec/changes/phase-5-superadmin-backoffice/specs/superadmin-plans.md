# superadmin-plans Specification

## ADDED Requirements

### Requirement: Superadmin can view all plans
The system SHALL display a list of all subscription plans with their name, price, limits, and status.

#### Scenario: Plan list loads successfully
- **WHEN** superadmin navigates to `/sa/plans`
- **THEN** system displays a table with columns: Name, Price, Max Users, Max Companies, Status

#### Scenario: Plan list is searchable
- **WHEN** superadmin types in the search box
- **THEN** system filters plans by name in real-time

### Requirement: Superadmin can create a plan
The system SHALL allow superadmin to create a new plan with name, price, and limits.

#### Scenario: Create plan form displays
- **WHEN** superadmin clicks "Nuevo Plan" button
- **THEN** system shows a dialog with fields: Name, Price, Max Users, Max Companies

#### Scenario: Create plan successfully
- **WHEN** superadmin fills all required fields and clicks "Guardar"
- **THEN** system creates the plan in the database
- **AND** system shows success toast message

### Requirement: Superadmin can edit a plan
The system SHALL allow superadmin to edit plan details including name, price, and limits.

#### Scenario: Edit plan form loads
- **WHEN** superadmin clicks "Editar" on a plan row
- **THEN** system shows a dialog pre-filled with plan data

#### Scenario: Update plan successfully
- **WHEN** superadmin modifies fields and clicks "Guardar"
- **THEN** system updates the plan in the database
- **AND** system shows success toast message

### Requirement: Superadmin can deactivate/reactivate a plan
The system SHALL allow superadmin to toggle the active status of a plan.

#### Scenario: Deactivate plan
- **WHEN** superadmin clicks "Desactivar" on an active plan
- **THEN** system shows confirmation dialog
- **AND** when confirmed, system sets is_active to false
- **AND** system shows success toast message

#### Scenario: Reactivate plan
- **WHEN** superadmin clicks "Reactivar" on an inactive plan
- **THEN** system shows confirmation dialog
- **AND** when confirmed, system sets is_active to true
- **AND** system shows success toast message

### Requirement: Inactive plans cannot be assigned
The system SHALL prevent superadmin from assigning an inactive plan to a company.

#### Scenario: Inactive plan disabled in dropdown
- **WHEN** superadmin views the plan dropdown in company form
- **THEN** inactive plans appear grayed out and are not selectable

### Requirement: Plan status is displayed with badge
The system SHALL display a visual indicator for plan active status.

#### Scenario: Active plan shows green badge
- **WHEN** plan has is_active = true
- **THEN** system displays a green "Activo" badge

#### Scenario: Inactive plan shows gray badge
- **WHEN** plan has is_active = false
- **THEN** system displays a gray "Inactivo" badge
