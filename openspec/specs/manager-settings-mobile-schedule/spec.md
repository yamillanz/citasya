# manager-settings-mobile-schedule Specification

## Purpose
TBD - created by archiving change fix-settings-schedule-mobile-layout. Update Purpose after archive.
## Requirements
### Requirement: Mobile schedule rows show both time inputs

The system SHALL render each schedule day as a compact two-row area on mobile (≤480px): the first row shows the day name and active toggle, and the second row shows both the start and end time inputs without overlapping.

#### Scenario: Day with active toggle
- **GIVEN** the manager opens settings on a mobile device (≤480px)
- **WHEN** a day is active (toggle ON)
- **THEN** the start and end time inputs are visible and editable, stacked vertically each on its own full-width line
- **AND** the times reflect the configured start/end values

#### Scenario: Day with inactive toggle
- **GIVEN** a day is inactive (toggle OFF)
- **THEN** the start and end time inputs are rendered dimmed and disabled
- **AND** they do not overlap each other

### Requirement: Time input captions on mobile

The system SHALL display "Apertura" and "Cierre" labels next to the start and end time inputs on mobile so users know which input is which.

#### Scenario: Captions visible
- **GIVEN** the manager opens settings on a mobile device (≤480px)
- **THEN** each day row displays a caption "Apertura" associated with the start time input
- **AND** each day row displays a caption "Cierre" associated with the end time input

### Requirement: Time error message visible on mobile

The system SHALL display the "Hora inválida" error message inside the mobile day row, within the visible viewport, when start time is equal to or after end time.

#### Scenario: Invalid range on mobile
- **GIVEN** a day is active with start time equal to or after end time
- **WHEN** the manager views the settings page on mobile
- **THEN** the "Hora inválida" message is visible inside the day row
- **AND** the message is not clipped or rendered outside the viewport

### Requirement: Accessible time inputs

The system SHALL provide accessible labels (aria-label or label association) for each start and end time input so assistive technologies can announce them per day.

#### Scenario: Screen reader announces input
- **GIVEN** the schedule section is rendered on any viewport
- **WHEN** a screen reader focuses the start time input of a day
- **THEN** the input is announced with the day name and the time role (e.g., "Lunes, hora de apertura")
- **AND** the end time input is announced with the day name and closing time role

