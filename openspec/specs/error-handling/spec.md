# error-handling Specification

## Purpose
TBD - created by archiving change phase-6-polish. Update Purpose after archive.
## Requirements
### Requirement: Toast Notification Service
The system SHALL provide a centralized toast notification service for displaying success, error, warning, and info messages.

#### Scenario: Success Notification
- **WHEN** a user action completes successfully (e.g., form submission, record deletion)
- **THEN** system SHALL display a green success toast with message "Operación exitosa"
- **AND** the toast SHALL auto-dismiss after 3 seconds

#### Scenario: Error Notification
- **WHEN** a user action fails due to validation error
- **THEN** system SHALL display a red error toast with the specific error message
- **AND** the toast SHALL persist until manually dismissed

#### Scenario: Warning Notification
- **WHEN** a user action has potential issues (e.g., unsaved changes)
- **THEN** system SHALL display a yellow warning toast
- **AND** the toast SHALL auto-dismiss after 5 seconds

### Requirement: Inline Form Error States
The system SHALL display inline validation errors on form fields.

#### Scenario: Field Validation Error
- **WHEN** user submits a form with invalid field(s)
- **THEN** the invalid field(s) SHALL display a red border
- **AND** an error message SHALL appear below the field
- **AND** the error message SHALL be specific (e.g., "El email es requerido" not just "Error")

#### Scenario: API Error Display
- **WHEN** an API call fails
- **THEN** system SHALL display a toast with the error message from the server
- **AND** if the error is a network error, display "Error de conexión"

### Requirement: Error State in Data Tables
The system SHALL display a meaningful error state when data fails to load.

#### Scenario: Table Load Error
- **WHEN** data for a table fails to load
- **THEN** the table SHALL display an error message: "Error al cargar los datos"
- **AND** a "Reintentar" (Retry) button SHALL be displayed

