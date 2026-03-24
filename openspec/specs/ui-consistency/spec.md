# ui-consistency Specification

## Purpose
TBD - created by archiving change phase-6-polish. Update Purpose after archive.
## Requirements
### Requirement: UI Consistency Across Backoffice Sections
The system SHALL apply consistent styling, spacing, and PrimeNG component usage across all backoffice sections (manager, employee, superadmin).

#### Scenario: Consistent Card Styling
- **WHEN** user views any backoffice page with cards
- **THEN** all cards SHALL use the same border-radius (8px), shadow, and padding

#### Scenario: Consistent Button Styles
- **WHEN** user views buttons across the application
- **THEN** primary buttons SHALL use Verde Salvia (#9DC183) background
- **AND** secondary buttons SHALL use Gris Cálido (#5D6D7E) background
- **AND** button sizes SHALL be consistent (padding: 0.5rem 1rem)

#### Scenario: Consistent Form Layout
- **WHEN** user views any form in the backoffice
- **THEN** all form fields SHALL have consistent spacing (margin-bottom: 1rem)
- **AND** all form labels SHALL use the same font-weight (500)

### Requirement: Standardized Page Layout
The system SHALL use a consistent page layout structure across all backoffice sections.

#### Scenario: Page Header Structure
- **WHEN** user views any backoffice page
- **THEN** the page SHALL have a header with title, breadcrumbs, and optional actions
- **AND** the content area SHALL have consistent padding (1.5rem)

#### Scenario: Consistent Data Table Structure
- **WHEN** user views any data table in the backoffice
- **THEN** all tables SHALL have header with search/filter capabilities
- **AND** all tables SHALL have pagination controls at the bottom
- **AND** all tables SHALL support row actions (edit, delete, etc.)

