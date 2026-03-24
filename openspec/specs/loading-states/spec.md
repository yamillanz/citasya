# loading-states Specification

## Purpose
TBD - created by archiving change phase-6-polish. Update Purpose after archive.
## Requirements
### Requirement: Skeleton Loading for Data Tables
The system SHALL display skeleton loaders when data is being fetched for tables.

#### Scenario: Table Loading State
- **WHEN** user navigates to a page with a data table
- **AND** data is being fetched
- **THEN** the table SHALL display 5 skeleton rows
- **AND** each skeleton row SHALL have animated shimmer effect
- **AND** no table headers or data SHALL be visible during loading

#### Scenario: Table Loaded State
- **WHEN** data fetch completes successfully
- **THEN** skeleton loaders SHALL be replaced with actual table data
- **AND** no visible flash or layout shift SHALL occur

### Requirement: Spinner for Form Submissions
The system SHALL display a loading spinner when form is being submitted.

#### Scenario: Form Submit Loading
- **WHEN** user submits a form (create, update, delete)
- **THEN** the submit button SHALL be disabled
- **AND** a spinner icon SHALL replace or appear alongside button text
- **AND** button text SHALL change to "Guardando..."

#### Scenario: Form Submit Complete
- **WHEN** form submission completes
- **THEN** the spinner SHALL be removed
- **AND** the button SHALL be re-enabled
- **AND** success/error toast SHALL be displayed

### Requirement: Full Page Loading State
The system SHALL display a full-page loading indicator for route changes.

#### Scenario: Route Change Loading
- **WHEN** user navigates to a new route
- **AND** the component is not yet loaded
- **THEN** a centered spinner SHALL be displayed
- **AND** the rest of the page SHALL be hidden or dimmed

