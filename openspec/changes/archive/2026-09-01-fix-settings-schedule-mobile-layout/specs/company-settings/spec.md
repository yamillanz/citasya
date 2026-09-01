# company-settings Specification

## MODIFIED Requirements

### Requirement: Responsive layout

The settings page SHALL be usable on mobile devices.

#### Scenario: Mobile view
- **GIVEN** the manager views the settings page on a mobile device
- **THEN** sections are stacked vertically
- **AND** each schedule day row displays the day name and active toggle on a first row and the start and end time inputs on a second row
- **AND** the start and end time inputs are stacked vertically, each on its own line, without overlapping or overflowing the row
- **AND** each time input is identified with a "Apertura"/"Cierre" caption
- **AND** the services table scrolls horizontally if needed
