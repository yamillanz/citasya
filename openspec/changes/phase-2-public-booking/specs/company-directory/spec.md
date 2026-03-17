## ADDED Requirements

### Requirement: Public company page displays employees
The system SHALL display a public company page at `/c/:slug` that lists all active employees of the company with their basic information.

#### Scenario: Company page loads successfully
- **WHEN** user navigates to `/c/:companySlug` with valid slug
- **THEN** system displays company name, logo, address, and phone
- **AND** system displays list of active employees with photo and full name

#### Scenario: Company page shows error for invalid slug
- **WHEN** user navigates to `/c/:invalidSlug` with non-existent slug
- **THEN** system displays "Empresa no encontrada" error message

### Requirement: Employee links navigate to calendar
Each employee SHALL have a clickable link that navigates to their public calendar page at `/c/:slug/e/:employeeId`.

#### Scenario: Clicking employee navigates to calendar
- **WHEN** user clicks "Ver disponibilidad" on an employee card
- **THEN** system navigates to `/c/:companySlug/e/:employeeId`
