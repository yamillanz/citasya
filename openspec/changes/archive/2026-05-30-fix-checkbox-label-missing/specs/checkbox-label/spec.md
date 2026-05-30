## ADDED Requirements

### Requirement: Checkbox MUST display visible label text
The checkbox labeled "Puede actuar como empleado" in the user dialog MUST render a visible text label next to the checkbox control.

#### Scenario: Manager role selected shows labeled checkbox
- **WHEN** the user selects the "Manager" role in the user dialog
- **THEN** a checkbox appears with the visible text "Puede actuar como empleado" next to it
- **AND** the label is clickable to toggle the checkbox state
