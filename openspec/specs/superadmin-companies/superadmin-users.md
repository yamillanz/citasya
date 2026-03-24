# superadmin-users Specification

## ADDED Requirements

### Requirement: Superadmin can view all users
The system SHALL display a paginated list of all users with their name, email, role, company, status, and creation date.

#### Scenario: User list loads successfully
- **WHEN** superadmin navigates to `/sa/users`
- **THEN** system displays a table with columns: Name, Email, Role, Company, Status, Created
- **AND** table shows pagination with 10 users per page

#### Scenario: User list is filterable by company
- **WHEN** superadmin selects a company from the filter dropdown
- **THEN** system shows only users belonging to that company

#### Scenario: User list is searchable
- **WHEN** superadmin types in the search box
- **THEN** system filters users by name or email in real-time

### Requirement: Superadmin can create a user
The system SHALL allow superadmin to create a new user with email, full name, role, and optional company assignment.

#### Scenario: Create user form displays
- **WHEN** superadmin clicks "Nuevo Usuario" button
- **THEN** system shows a dialog with fields: Email, Full Name, Role (dropdown), Company (dropdown)

#### Scenario: Create user successfully
- **WHEN** superadmin fills all required fields and clicks "Guardar"
- **THEN** system creates the user in the database
- **AND** system shows success toast message

#### Scenario: Create user with duplicate email
- **WHEN** superadmin enters an email that already exists
- **THEN** system shows validation error "El email ya existe"

### Requirement: Superadmin can edit a user
The system SHALL allow superadmin to edit user details including name, role, and company assignment.

#### Scenario: Edit user form loads
- **WHEN** superadmin clicks "Editar" on a user row
- **THEN** system shows a dialog pre-filled with user data

#### Scenario: Update user successfully
- **WHEN** superadmin modifies fields and clicks "Guardar"
- **THEN** system updates the user in the database
- **AND** system shows success toast message

### Requirement: Superadmin can deactivate/reactivate a user
The system SHALL allow superadmin to toggle the active status of a user.

#### Scenario: Deactivate user
- **WHEN** superadmin clicks "Desactivar" on an active user
- **THEN** system shows confirmation dialog
- **AND** when confirmed, system sets is_active to false
- **AND** system shows success toast message

#### Scenario: Reactivate user
- **WHEN** superadmin clicks "Reactivar" on an inactive user
- **THEN** system shows confirmation dialog
- **AND** when confirmed, system sets is_active to true
- **AND** system shows success toast message

### Requirement: User role is displayed with badge
The system SHALL display role-specific badges for each user.

#### Scenario: Manager shows blue badge
- **WHEN** user has role = 'manager'
- **THEN** system displays a blue "Manager" badge

#### Scenario: Employee shows teal badge
- **WHEN** user has role = 'employee'
- **THEN** system displays a teal "Empleado" badge

#### Scenario: Superadmin shows purple badge
- **WHEN** user has role = 'superadmin'
- **THEN** system displays a purple "Superadmin" badge
