## ADDED Requirements

### Requirement: Responsive Layout for Backoffice
The system SHALL provide responsive layouts that work well on tablet (768px) and mobile (1024px) viewports.

#### Scenario: Mobile Navigation
- **WHEN** user views backoffice on mobile viewport (<768px)
- **THEN** the sidebar SHALL be hidden by default
- **AND** a hamburger menu button SHALL be visible
- **AND** tapping the hamburger SHALL slide in the sidebar as an overlay

#### Scenario: Tablet Layout
- **WHEN** user views backoffice on tablet viewport (768px - 1024px)
- **THEN** the sidebar SHALL be collapsible
- **AND** content area SHALL take remaining width

### Requirement: Responsive Tables
The system SHALL handle data tables responsively on mobile devices.

#### Scenario: Mobile Table View
- **WHEN** user views a data table on mobile viewport (<768px)
- **THEN** horizontal scrolling SHALL be enabled
- **AND** critical columns SHALL remain visible
- **AND** less critical columns SHALL be hidden or truncated

#### Scenario: Mobile Form Layout
- **WHEN** user views a form on mobile viewport (<768px)
- **THEN** form fields SHALL stack vertically
- **AND** full-width inputs SHALL be used

### Requirement: Responsive Cards and Panels
The system SHALL adjust card layouts on smaller screens.

#### Scenario: Mobile Card Grid
- **WHEN** user views cards on mobile viewport (<768px)
- **THEN** cards SHALL display in single column
- **AND** on tablet viewport SHALL display in 2 columns

#### Scenario: Mobile Dialog
- **WHEN** user opens a dialog on mobile viewport (<768px)
- **THEN** the dialog SHALL be full-width
- **AND** the dialog SHALL open from bottom
