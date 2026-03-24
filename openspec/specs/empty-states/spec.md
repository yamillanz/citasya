# empty-states Specification

## Purpose
TBD - created by archiving change phase-6-polish. Update Purpose after archive.
## Requirements
### Requirement: Empty State for Data Tables
The system SHALL display a meaningful empty state when a table has no data.

#### Scenario: Empty Table State
- **WHEN** user views a table with no data
- **THEN** a centered empty state SHALL be displayed
- **AND** the empty state SHALL include an icon (e.g., inbox or table icon)
- **AND** a message SHALL say "No hay datos registrados"
- **AND** an optional CTA button SHALL be displayed (e.g., "Crear nuevo")

#### Scenario: Empty Search Results
- **WHEN** user searches for something that returns no results
- **THEN** an empty state SHALL be displayed
- **AND** the message SHALL say "No se encontraron resultados para '[search term]'"
- **AND** a "Limpiar búsqueda" button SHALL be displayed

### Requirement: Empty State Component
The system SHALL provide a reusable empty state component for consistent display.

#### Scenario: Empty State Structure
- **WHEN** an empty state is needed
- **THEN** it SHALL display an icon, title, description, and optional action button
- **AND** the component SHALL accept custom title and description props
- **AND** the component SHALL accept an optional action button configuration

### Requirement: Empty State in Forms
The system SHALL display a message when a dropdown or list has no options.

#### Scenario: Empty Dropdown
- **WHEN** user opens a dropdown with no options
- **THEN** the dropdown SHALL display "No hay opciones disponibles"
- **AND** the dropdown SHALL be disabled

