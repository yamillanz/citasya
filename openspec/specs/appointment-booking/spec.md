# appointment-booking Specification

## Purpose
TBD - created by archiving change phase-2-public-booking. Update Purpose after archive.
## Requirements
### Requirement: Booking form displays appointment summary
The system SHALL display a summary of the selected appointment (employee, service, date, time, price) before collecting client information.

#### Scenario: Summary displayed correctly
- **WHEN** booking form loads with valid parameters
- **THEN** system displays employee name, service name, formatted date, time, and price

### Requirement: Client information collection
The system SHALL collect client information through a form with required and optional fields.

#### Scenario: Form renders with validation
- **WHEN** booking form loads
- **THEN** form displays fields: client_name (required), client_phone (required), client_email (optional), notes (optional)
- **AND** required fields have validation messages

#### Scenario: Form submission with valid data
- **WHEN** user fills required fields and submits form
- **THEN** system creates appointment with status "pending"
- **AND** system displays success message

#### Scenario: Form submission with invalid data
- **WHEN** user submits form with missing required fields
- **THEN** system displays validation errors
- **AND** appointment is not created

### Requirement: Booking confirmation
The system SHALL display a success message after appointment is created.

#### Scenario: Successful booking
- **WHEN** appointment is created successfully
- **THEN** system displays "¡Reserva Confirmada!" message
- **AND** displays confirmation details and instructions
- **AND** provides link to return to company page

